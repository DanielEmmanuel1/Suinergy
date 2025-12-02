module suinergy::strategy {
    use sui::object::{Self, UID, ID};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::table::{Self, Table};
    use sui::vec_map::{Self, VecMap};
    use sui::clock::{Self, Clock};
    
    use suinergy::registry::{Self, ProtocolConfig, ProtocolRegistry};
    use suinergy::events;
    use suinergy::adapter::{Self, AdapterInfo};
    use suinergy::mock_adapter::{Self, MockAdapter};

    /// Error codes
    const EPaused: u64 = 0;
    const EZeroAmount: u64 = 1;
    const EInsufficientShares: u64 = 2;
    const EInvalidAdapter: u64 = 3;
    const EAdapterNotFound: u64 = 4;
    const EOverflow: u64 = 5;
    const EUnderflow: u64 = 6;
    const EInvalidAllocation: u64 = 7;

    /// Strategy Vault - self-contained Move object with allocation targets and sub-positions
    public struct StrategyVault<phantom T> has key {
        id: UID,
        total_assets: u64, // Total assets across all adapters + reserve
        total_shares: u64,  // Total strategy shares minted
        reserve_balance: Balance<T>, // Idle funds not yet deployed to adapters
        // Adapter positions: maps adapter_slot -> balance deployed
        adapter_positions: Table<u8, Balance<T>>,
        // Metadata
        name: vector<u8>,
        target_allocations: VecMap<u8, u64>, // adapter_slot -> allocation_basis_points
        last_rebalance_timestamp: u64,
        last_harvest_timestamp: u64,
    }

    /// Strategy Share (Receipt token for strategy) - stored in user's wallet
    public struct StrategyShare<phantom T> has key, store {
        id: UID,
        strategy_id: ID,
        shares: u64,
    }

    /// Admin capability for strategy operations (rebalancing, harvesting)
    public struct StrategyCap has key, store {
        id: UID,
        strategy_id: ID,
    }

    /// Initialize a new strategy vault
    public fun new_strategy<T>(
        name: vector<u8>,
        ctx: &mut TxContext
    ): (StrategyVault<T>, StrategyCap) {
        let strategy = StrategyVault<T> {
            id: object::new(ctx),
            total_assets: 0,
            total_shares: 0,
            reserve_balance: balance::zero(),
            adapter_positions: table::new(ctx),
            name,
            target_allocations: vec_map::empty(),
            last_rebalance_timestamp: 0,
            last_harvest_timestamp: 0,
        };
        
        let cap = StrategyCap {
            id: object::new(ctx),
            strategy_id: object::uid_to_inner(&strategy.id),
        };
        
        (strategy, cap)
    }

    /// Deposit into strategy - mints shares based on current share price
    /// Checks-Effects-Interactions pattern:
    /// 1. Check: validate inputs and paused state
    /// 2. Effects: update state, mint shares
    /// 3. Interactions: emit events
    public fun deposit<T>(
        strategy: &mut StrategyVault<T>,
        config: &ProtocolConfig,
        coin: Coin<T>,
        ctx: &mut TxContext
    ): StrategyShare<T> {
        assert!(!registry::is_paused(config), EPaused);
        
        let amount = coin::value(&coin);
        assert!(amount > 0, EZeroAmount);

        // Calculate shares to mint: shares = (amount * total_shares) / total_assets
        // If first deposit, use 1:1 ratio
        let shares = if (strategy.total_shares == 0) {
            amount
        } else {
            // Use checked arithmetic to prevent overflow
            let numerator = (amount as u128) * (strategy.total_shares as u128);
            let denominator = strategy.total_assets as u128;
            assert!(denominator > 0, EUnderflow);
            (numerator / denominator) as u64
        };

        // Update state (Effects)
        balance::join(&mut strategy.reserve_balance, coin::into_balance(coin));
        strategy.total_assets = strategy.total_assets + amount;
        strategy.total_shares = strategy.total_shares + shares;

        // Emit event (Interactions)
        events::emit_strategy_deposit(object::uid_to_inner(&strategy.id), amount);

        StrategyShare<T> {
            id: object::new(ctx),
            strategy_id: object::uid_to_inner(&strategy.id),
            shares,
        }
    }

    /// Withdraw from strategy - burns shares and returns assets
    public fun withdraw<T>(
        strategy: &mut StrategyVault<T>,
        config: &ProtocolConfig,
        share: StrategyShare<T>,
        ctx: &mut TxContext
    ): Coin<T> {
        assert!(!registry::is_paused(config), EPaused);
        
        let StrategyShare<T> { id, strategy_id, shares } = share;
        assert!(strategy_id == object::uid_to_inner(&strategy.id), 0); // Must match strategy
        assert!(shares > 0, EZeroAmount);
        assert!(strategy.total_shares >= shares, EInsufficientShares);
        
        object::delete(id);

        // Calculate assets to return: amount = (shares * total_assets) / total_shares
        let amount = if (strategy.total_shares == 0) {
            0
        } else {
            let numerator = (shares as u128) * (strategy.total_assets as u128);
            let denominator = strategy.total_shares as u128;
            (numerator / denominator) as u64
        };

        // Update state
        strategy.total_shares = strategy.total_shares - shares;
        strategy.total_assets = strategy.total_assets - amount;

        // Try to withdraw from reserve first, then from adapters if needed
        let reserve_value = balance::value(&strategy.reserve_balance);
        let withdrawn_balance = if (reserve_value >= amount) {
            balance::split(&mut strategy.reserve_balance, amount)
        } else {
            // In a full implementation, we would trigger adapter withdrawals here
            // For now, we assume reserve is sufficient or this is handled by rebalancer
            balance::split(&mut strategy.reserve_balance, reserve_value)
        };

        events::emit_strategy_withdraw(object::uid_to_inner(&strategy.id), amount);

        coin::from_balance(withdrawn_balance, ctx)
    }

    /// Rebalance strategy - allocate funds to adapters based on target allocations
    /// Requires: StrategyCap (keeper/admin only)
    /// Emits: RebalanceEvent for each adapter allocation
    public fun rebalance<T>(
        strategy: &mut StrategyVault<T>,
        registry: &mut ProtocolRegistry,
        config: &ProtocolConfig,
        _cap: &StrategyCap,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!registry::is_paused(config), EPaused);
        
        let total = strategy.total_assets;
        if (total == 0) return; // Nothing to rebalance
        
        let allocations = &strategy.target_allocations;
        let len = vec_map::length(allocations);
        let i = 0;
        
        while (i < len) {
            let (slot, target_bp) = vec_map::get(allocations, i);
            let target_amount = ((total as u128) * (target_bp as u128) / 10000) as u64;
            
            // Get current position for this adapter slot
            let current_balance = if (table::contains(&strategy.adapter_positions, slot)) {
                balance::value(table::borrow(&strategy.adapter_positions, slot))
            } else {
                0
            };
            
            if (target_amount > current_balance) {
                // Need to deposit more
                let deposit_amount = target_amount - current_balance;
                if (deposit_amount > 0 && balance::value(&strategy.reserve_balance) >= deposit_amount) {
                    let coin = coin::from_balance(balance::split(&mut strategy.reserve_balance, deposit_amount), ctx);
                    // In full implementation, call adapter deposit here
                    // For now, we track the position
                    if (!table::contains(&strategy.adapter_positions, slot)) {
                        table::add(&mut strategy.adapter_positions, slot, balance::zero());
                    };
                    // Note: actual adapter deposit would happen here
                    events::emit_rebalance(
                        object::uid_to_inner(&strategy.id),
                        object::uid_to_inner(&strategy.id),
                        deposit_amount,
                        true
                    );
                };
            } else if (target_amount < current_balance) {
                // Need to withdraw excess
                let withdraw_amount = current_balance - target_amount;
                // In full implementation, call adapter withdraw here
                // For now, we just update tracking
                events::emit_rebalance(
                    object::uid_to_inner(&strategy.id),
                    object::uid_to_inner(&strategy.id),
                    withdraw_amount,
                    false
                );
            };
            
            i = i + 1;
        };
        
        strategy.last_rebalance_timestamp = clock::timestamp_ms(clock);
    }

    /// Set target allocation for an adapter slot
    public fun set_target_allocation<T>(
        strategy: &mut StrategyVault<T>,
        _cap: &StrategyCap,
        adapter_slot: u8,
        allocation_basis_points: u64
    ) {
        assert!(allocation_basis_points <= 10000, EInvalidAllocation);
        if (vec_map::contains(&strategy.target_allocations, adapter_slot)) {
            vec_map::remove(&mut strategy.target_allocations, adapter_slot);
        };
        vec_map::insert(&mut strategy.target_allocations, adapter_slot, allocation_basis_points);
    }

    /// View function: Get strategy state for frontend
    public fun get_strategy_info<T>(
        strategy: &StrategyVault<T>,
        _clock: &Clock
    ): (u64, u64, u64, u64, u64) {
        (
            strategy.total_assets,
            strategy.total_shares,
            balance::value(&strategy.reserve_balance),
            strategy.last_rebalance_timestamp,
            strategy.last_harvest_timestamp
        )
    }

    /// View function: Get share price (assets per share)
    public fun get_share_price<T>(strategy: &StrategyVault<T>): u64 {
        if (strategy.total_shares == 0) {
            1000000000 // 1:1 with 9 decimals
        } else {
            ((strategy.total_assets as u128) * 1000000000 / (strategy.total_shares as u128)) as u64
        }
    }
}
