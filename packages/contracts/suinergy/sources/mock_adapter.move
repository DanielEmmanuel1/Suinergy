module suinergy::mock_adapter {
    use sui::object::{Self, UID, ID};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::clock::{Self, Clock};
    use suinergy::adapter::{Self, DepositResult, AdapterInfo};

    /// Error codes
    const EInsufficientLiquidity: u64 = 0;
    const EInvalidShares: u64 = 1;

    /// Mock Adapter that simulates yield behavior
    /// Implements the adapter interface for testing and when real adapters are unavailable
    public struct MockAdapter<phantom T> has key, store {
        id: UID,
        balance: Balance<T>,
        total_shares: u64,
        last_update: u64,
        apy_basis_points: u64, // e.g., 1250 = 12.5%
        accumulated_yield: u64, // Simulated yield accumulated over time
    }

    /// Create a new mock adapter with specified APY
    public fun new<T>(apy_basis_points: u64, ctx: &mut TxContext): MockAdapter<T> {
        MockAdapter<T> {
            id: object::new(ctx),
            balance: balance::zero(),
            total_shares: 0,
            last_update: 0,
            apy_basis_points,
            accumulated_yield: 0,
        }
    }

    /// Deposit into mock adapter - implements adapter interface
    /// Returns shares minted based on current share price (simulated yield included)
    public fun deposit<T>(
        adapter: &mut MockAdapter<T>,
        coin: Coin<T>,
        clock: &Clock,
        _ctx: &mut TxContext
    ): DepositResult {
        let amount = coin::value(&coin);
        assert!(amount > 0, EInvalidShares);
        
        // Update accumulated yield before deposit
        update_yield(adapter, clock);
        
        balance::join(&mut adapter.balance, coin::into_balance(coin));
        
        // Calculate shares: if first deposit, 1:1; otherwise based on share price
        let shares = if (adapter.total_shares == 0) {
            amount
        } else {
            let total_assets_with_yield = balance::value(&adapter.balance) + adapter.accumulated_yield;
            ((amount as u128) * (adapter.total_shares as u128) / (total_assets_with_yield as u128)) as u64
        };
        
        adapter.total_shares = adapter.total_shares + shares;
        adapter.last_update = clock::timestamp_ms(clock);
        
        DepositResult {
            shares_minted: shares,
            actual_amount_deposited: amount,
        }
    }

    /// Withdraw from mock adapter - implements adapter interface
    public fun withdraw<T>(
        adapter: &mut MockAdapter<T>,
        shares: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<T> {
        assert!(shares > 0, EInvalidShares);
        assert!(adapter.total_shares >= shares, EInsufficientLiquidity);
        
        // Update accumulated yield before withdrawal
        update_yield(adapter, clock);
        
        // Calculate amount including yield
        let total_assets_with_yield = balance::value(&adapter.balance) + adapter.accumulated_yield;
        let amount = if (adapter.total_shares == 0) {
            0
        } else {
            ((shares as u128) * (total_assets_with_yield as u128) / (adapter.total_shares as u128)) as u64
        };
        
        // Cap withdrawal at actual balance (yield is simulated)
        let withdraw_amount = if (amount > balance::value(&adapter.balance)) {
            balance::value(&adapter.balance)
        } else {
            amount
        };
        
        adapter.total_shares = adapter.total_shares - shares;
        adapter.accumulated_yield = if (adapter.total_shares == 0) {
            0 // Reset if fully withdrawn
        } else {
            adapter.accumulated_yield
        };
        
        let withdrawn_balance = balance::split(&mut adapter.balance, withdraw_amount);
        coin::from_balance(withdrawn_balance, ctx)
    }

    /// Query total assets (including simulated yield)
    public fun query_balance<T>(adapter: &MockAdapter<T>, clock: &Clock): u64 {
        let mut temp_adapter = *adapter;
        update_yield(&mut temp_adapter, clock);
        balance::value(&adapter.balance) + adapter.accumulated_yield
    }

    /// Query total shares
    public fun query_shares<T>(adapter: &MockAdapter<T>): u64 {
        adapter.total_shares
    }

    /// Claim rewards (simulated - returns zero for mock)
    public fun claim_rewards<T>(
        _adapter: &mut MockAdapter<T>,
        _clock: &Clock,
        ctx: &mut TxContext
    ): Coin<T> {
        // Mock adapters don't have separate reward tokens
        coin::zero(ctx)
    }

    /// Get APR (returns configured APY)
    public fun get_apr<T>(adapter: &MockAdapter<T>, _clock: &Clock): u64 {
        adapter.apy_basis_points
    }

    /// Get adapter info for view functions
    public fun get_adapter_info<T>(adapter: &MockAdapter<T>, clock: &Clock): AdapterInfo {
        let total_assets = query_balance(adapter, clock);
        AdapterInfo {
            adapter_id: object::uid_to_inner(&adapter.id),
            adapter_type: @0x0, // Mock adapter identifier
            total_assets,
            total_shares: adapter.total_shares,
            apy_basis_points: adapter.apy_basis_points,
            health_status: 0, // Always excellent for mock
            last_update_timestamp: adapter.last_update,
        }
    }

    /// Internal: Update accumulated yield based on time elapsed
    fun update_yield<T>(adapter: &mut MockAdapter<T>, clock: &Clock) {
        if (adapter.last_update == 0) {
            adapter.last_update = clock::timestamp_ms(clock);
            return
        };
        
        let current_time = clock::timestamp_ms(clock);
        let elapsed_ms = current_time - adapter.last_update;
        if (elapsed_ms == 0) return;
        
        // Calculate yield: APY * elapsed_time / year_ms * balance
        // APY is in basis points, so divide by 10000 to get decimal
        let year_ms = 31536000000; // 365 days in milliseconds
        let balance = balance::value(&adapter.balance);
        let yield_amount = ((balance as u128) * (adapter.apy_basis_points as u128) * (elapsed_ms as u128) / 10000 / (year_ms as u128)) as u64;
        
        adapter.accumulated_yield = adapter.accumulated_yield + yield_amount;
        adapter.last_update = current_time;
    }

    /// Set APY (admin function for testing)
    public fun set_apy<T>(adapter: &mut MockAdapter<T>, new_apy_basis_points: u64) {
        adapter.apy_basis_points = new_apy_basis_points;
    }
}
