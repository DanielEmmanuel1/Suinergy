module suinergy::vault_selective {
    use sui::object::{Self, UID, ID};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::vec_set::{Self, VecSet};
    use std::option;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::transfer;
    
    use suinergy::vault::{Self, Vault};
    use suinergy::position::{Self, Position, UserPosition};
    use suinergy::registry::ProtocolConfig;
    use suinergy::events;

    /// Error codes
    const EInvalidAdapter: u64 = 10;
    const EPositionNotFound: u64 = 11;
    const EInsufficientPositionValue: u64 = 12;
    const EExceedsUserShare: u64 = 13;
    const EInvalidPosition: u64 = 14;
    const EPaused: u64 = 0;
    const EZeroAmount: u64 = 1;

    /// Registry for tracking vault positions and their adapters
    public struct StrategyVaultRegistry has key {
        id: UID,
        vault_id: ID,
        /// Maps adapter_id -> Position object ID
        adapter_positions: Table<ID, ID>,
        /// Maps Position ID -> PositionInfo
        position_info: Table<ID, PositionInfo>,
        /// Active position IDs for iteration
        active_positions: VecSet<ID>,
    }

    /// Information about a position
    public struct PositionInfo has store, copy, drop {
        adapter_id: ID,
        allocation_basis_points: u64, // e.g., 3500 = 35%
        current_value: u64, // Cached position value
        protocol_name: vector<u8>, // "Scallop", "Cetus", etc.
        last_updated: u64, // Timestamp
    }

    /// Initialize a strategy vault registry
    public fun init_registry(
        vault_id: ID,
        ctx: &mut TxContext
    ): StrategyVaultRegistry {
        StrategyVaultRegistry {
            id: object::new(ctx),
            vault_id,
            adapter_positions: table::new(ctx),
            position_info: table::new(ctx),
            active_positions: vec_set::empty(),
        }
    }

    /// Register a position with its adapter
    /// Only callable by vault admin (add capability check in production)
    public fun register_position(
        registry: &mut StrategyVaultRegistry,
        adapter_id: ID,
        position_id: ID,
        allocation_bp: u64,
        protocol_name: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Add to adapter -> position mapping
        table::add(&mut registry.adapter_positions, adapter_id, position_id);
        
        // Store position info
        let info = PositionInfo {
            adapter_id,
            allocation_basis_points: allocation_bp,
            current_value: 0,
            protocol_name,
            last_updated: 0,
        };
        table::add(&mut registry.position_info, position_id, info);
        
        // Add to active positions set
        vec_set::insert(&mut registry.active_positions, position_id);
    }

    /// Update position value (called after rebalancing/harvesting)
    public fun update_position_value(
        registry: &mut StrategyVaultRegistry,
        position_id: ID,
        new_value: u64,
        timestamp: u64,
    ) {
        if (table::contains(&registry.position_info, position_id)) {
            let info = table::borrow_mut(&mut registry.position_info, position_id);
            info.current_value = new_value;
            info.last_updated = timestamp;
        }
    }

    /// Get position ID for an adapter
    public fun get_position_id(registry: &StrategyVaultRegistry, adapter_id: ID): Option<ID> {
        if (table::contains(&registry.adapter_positions, adapter_id)) {
            option::some(*table::borrow(&registry.adapter_positions, adapter_id))
        } else {
            option::none()
        }
    }

    /// Get position info
    public fun get_position_info(registry: &StrategyVaultRegistry, position_id: ID): Option<PositionInfo> {
        if (table::contains(&registry.position_info, position_id)) {
            option::some(*table::borrow(&registry.position_info, position_id))
        } else {
            option::none()
        }
    }

    /// Check if adapter is registered
    public fun is_adapter_registered(registry: &StrategyVaultRegistry, adapter_id: ID): bool {
        table::contains(&registry.adapter_positions, adapter_id)
    }

    /// Selective withdrawal from a specific protocol position
    /// 
    /// This function allows users to withdraw from a specific adapter position
    /// instead of withdrawing proportionally from all positions.
    /// 
    /// Share accounting:
    /// - Calculates user's proportional share of the target position
    /// - Burns only the shares representing the withdrawn amount
    /// - Maintains vault accounting invariants
    public entry fun withdraw_from_position<T>(
        vault: &mut Vault<T>,
        registry: &mut StrategyVaultRegistry,
        config: &ProtocolConfig,
        user_position: &mut UserPosition,
        position_obj: &mut Position,
        adapter_id: ID,
        amount_underlying: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // 1. Validate protocol is not paused
        assert!(!suinergy::registry::is_paused(config), EPaused);
        
        // 2. Validate amount
        assert!(amount_underlying > 0, EZeroAmount);
        
        // 3. Validate adapter_id is registered
        assert!(is_adapter_registered(registry, adapter_id), EInvalidAdapter);
        
        // 4. Get position ID
        let expected_position_id = position::adapter_id(position_obj);
        let position_id_opt = get_position_id(registry, adapter_id);
        assert!(option::contains(&position_id_opt, &expected_position_id), EInvalidPosition);
        // Use the expected_position_id since we validated it matches
        let position_id = expected_position_id;
        
        // 5. Get position info
        let position_info_opt = get_position_info(registry, position_id);
        assert!(option::is_some(&position_info_opt), EPositionNotFound);
        // Get a reference to the position info
        let position_info_ref = option::borrow(&position_info_opt);
        
        // 6. Validate position belongs to this adapter
        assert!(position::adapter_id(position_obj) == adapter_id, EInvalidAdapter);
        
        // 7. Get user and vault state
        let user_shares = position::shares(user_position);
        assert!(user_shares > 0, EZeroAmount);
        
        // Access vault state through helper functions
        let total_shares = suinergy::vault::total_shares(vault);
        let total_assets = suinergy::vault::total_assets(vault);
        assert!(total_shares > 0, EZeroAmount);
        assert!(total_assets > 0, EZeroAmount);
        
        // 8. Calculate user's share of this specific position
        // User's total position value in vault
        let user_total_value = ((user_shares as u128) * (total_assets as u128) / (total_shares as u128)) as u64;
        
        // Position's current value - access field through reference
        let position_value = position_info_ref.current_value;
        assert!(position_value > 0, EInsufficientPositionValue);
        
        // User's proportional share of this position
        let user_position_share = if (total_assets > 0) {
            ((user_total_value as u128) * (position_value as u128) / (total_assets as u128)) as u64
        } else {
            0
        };
        
        // 9. Validate withdrawal amount
        assert!(amount_underlying <= user_position_share, EExceedsUserShare);
        assert!(amount_underlying <= position_value, EInsufficientPositionValue);
        
        // 10. Calculate shares to burn
        // shares_to_burn = user_shares * (withdraw_amount / user_total_value)
        let shares_to_burn = if (user_total_value > 0) {
            ((user_shares as u128) * (amount_underlying as u128) / (user_total_value as u128)) as u64
        } else {
            0
        };
        assert!(shares_to_burn > 0, EZeroAmount);
        assert!(shares_to_burn <= user_shares, EExceedsUserShare);
        
        // 11. Withdraw from adapter (adapter-specific logic)
        // This will need to call the adapter's withdraw_partial function
        // For now, we'll assume the adapter withdrawal is handled externally
        // and we receive the coins. In a full implementation, this would:
        // - Look up adapter type (mock vs real)
        // - Call appropriate adapter module
        // - Handle partial vs full withdrawal logic
        
        // TODO: Implement adapter withdrawal routing
        // For MVP, we'll simulate by withdrawing from vault balance
        // In production, this must call adapter.withdraw_partial()
        let coins_returned = if (suinergy::vault::balance_value(vault) >= amount_underlying) {
            // Withdraw from treasury if sufficient
            let withdrawn = suinergy::vault::split_balance(vault, amount_underlying);
            coin::from_balance(withdrawn, ctx)
        } else {
            // TODO: Trigger adapter withdrawal
            // For now, abort if treasury insufficient
            // In production: unwind position via adapter
            abort EInsufficientPositionValue
        };
        
        // 12. Update accounting
        // Reduce user shares
        position::reduce_shares(user_position, shares_to_burn);
        
        // Update vault state
        suinergy::vault::update_after_withdrawal(vault, shares_to_burn, amount_underlying);
        
        // Update position value in registry
        let new_position_value = position_value - amount_underlying;
        update_position_value(registry, position_id, new_position_value, clock::timestamp_ms(clock));
        
        // 13. Emit event
        events::emit_withdraw_position(
            tx_context::sender(ctx),
            suinergy::vault::vault_id(vault),
            adapter_id,
            amount_underlying,
            shares_to_burn,
        );
        
        // 14. Transfer coins to user
        transfer::public_transfer(coins_returned, tx_context::sender(ctx));
    }

    /// View function: Get all active positions for a vault
    public fun get_active_positions(registry: &StrategyVaultRegistry): &vector<ID> {
        vec_set::keys(&registry.active_positions)
    }

    /// View function: Get position info by adapter ID
    public fun get_position_info_by_adapter(registry: &StrategyVaultRegistry, adapter_id: ID): option::Option<PositionInfo> {
        if (is_adapter_registered(registry, adapter_id)) {
            let position_id = *table::borrow(&registry.adapter_positions, adapter_id);
            get_position_info(registry, position_id)
        } else {
            option::none()
        }
    }
}

