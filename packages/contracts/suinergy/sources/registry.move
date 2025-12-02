module suinergy::registry {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::vec_set::{Self, VecSet};
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::option;

    /// Error codes
    const ENotAdmin: u64 = 0;
    const EVersionMismatch: u64 = 1;
    const EAdapterNotFound: u64 = 2;
    const EInvalidAdapterType: u64 = 3;
    const EAdapterAlreadyRegistered: u64 = 4;
    const EStrategyNotFound: u64 = 5;

    /// Adapter type: REAL or MOCK
    public struct AdapterType has copy, drop, store {
        is_mock: bool,
    }

    /// Adapter binding information
    public struct AdapterBinding has store {
        adapter_type: AdapterType,
        package_id: Option<address>, // Some(package_id) if real, None if mock
        adapter_object_id: Option<ID>, // The adapter instance ID
        strategy_id: ID, // Which strategy this adapter belongs to
        allocation_basis_points: u64, // Allocation percentage (e.g., 3500 = 35%)
        last_harvest_timestamp: u64,
        is_active: bool,
    }

    /// Global configuration and feature flags
    public struct ProtocolConfig has key, store {
        id: UID,
        admin: address,
        is_testnet: bool,
        version: u64,
        paused: bool,
        timelock_duration_ms: u64, // Timelock for adapter swaps
    }

    /// Central registry to track all active vaults and strategies
    public struct ProtocolRegistry has key {
        id: UID,
        vaults: VecSet<ID>,
        strategies: VecSet<ID>,
        // Maps strategy_id -> Table<adapter_slot_id, AdapterBinding>
        adapter_bindings: Table<ID, Table<u8, AdapterBinding>>,
    }

    /// Capability to manage the registry (requires multi-sig in production)
    public struct RegistryCap has key, store {
        id: UID,
    }

    /// Timelock for adapter swaps
    public struct AdapterSwapTimelock has key, store {
        id: UID,
        strategy_id: ID,
        old_adapter_slot: u8,
        new_adapter_binding: AdapterBinding,
        unlock_timestamp: u64,
    }

    /// Events
    public struct AdapterRegisteredEvent has copy, drop {
        strategy_id: ID,
        adapter_slot: u8,
        adapter_type: AdapterType,
        package_id: Option<address>,
    }

    public struct AdapterSwapInitiatedEvent has copy, drop {
        strategy_id: ID,
        adapter_slot: u8,
        timelock_id: ID,
        unlock_timestamp: u64,
    }

    public struct AdapterSwappedEvent has copy, drop {
        strategy_id: ID,
        adapter_slot: u8,
        old_adapter_type: AdapterType,
        new_adapter_type: AdapterType,
    }

    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        
        // Create Registry
        transfer::share_object(ProtocolRegistry {
            id: object::new(ctx),
            vaults: vec_set::empty(),
            strategies: vec_set::empty(),
            adapter_bindings: table::new(ctx),
        });

        // Create Config
        transfer::share_object(ProtocolConfig {
            id: object::new(ctx),
            admin: sender,
            is_testnet: true, // Default to testnet for safety
            version: 1,
            paused: false,
            timelock_duration_ms: 86400000, // 24 hours default
        });

        // Create Admin Cap
        transfer::transfer(RegistryCap {
            id: object::new(ctx),
        }, sender);
    }

    // === Adapter Type Helpers ===

    public fun mock_adapter_type(): AdapterType {
        AdapterType { is_mock: true }
    }

    public fun real_adapter_type(): AdapterType {
        AdapterType { is_mock: false }
    }

    public fun is_mock(adapter_type: &AdapterType): bool {
        adapter_type.is_mock
    }

    // === Read Functions ===

    public fun is_testnet(config: &ProtocolConfig): bool {
        config.is_testnet
    }

    public fun is_paused(config: &ProtocolConfig): bool {
        config.paused
    }

    public fun admin(config: &ProtocolConfig): address {
        config.admin
    }

    public fun timelock_duration(config: &ProtocolConfig): u64 {
        config.timelock_duration_ms
    }

    /// Get adapter binding for a strategy and slot
    public fun get_adapter_binding(
        registry: &ProtocolRegistry,
        strategy_id: ID,
        adapter_slot: u8
    ): (AdapterType, Option<address>, Option<ID>, u64, u64, bool) {
        if (!table::contains(&registry.adapter_bindings, strategy_id)) {
            return (mock_adapter_type(), option::none(), option::none(), 0, 0, false)
        };
        let strategy_adapters = table::borrow(&registry.adapter_bindings, strategy_id);
        if (!table::contains(strategy_adapters, adapter_slot)) {
            return (mock_adapter_type(), option::none(), option::none(), 0, 0, false)
        };
        let binding = table::borrow(strategy_adapters, adapter_slot);
        (
            binding.adapter_type,
            binding.package_id,
            binding.adapter_object_id,
            binding.allocation_basis_points,
            binding.last_harvest_timestamp,
            binding.is_active
        )
    }

    /// Check if strategy has any mock adapters
    public fun has_mock_adapters(registry: &ProtocolRegistry, strategy_id: ID): bool {
        if (!table::contains(&registry.adapter_bindings, strategy_id)) {
            return false
        };
        let strategy_adapters = table::borrow(&registry.adapter_bindings, strategy_id);
        let keys = table::keys(strategy_adapters);
        let len = vector::length(&keys);
        let i = 0;
        while (i < len) {
            let slot = *vector::borrow(&keys, i);
            let binding = table::borrow(strategy_adapters, slot);
            if (binding.adapter_type.is_mock && binding.is_active) {
                return true
            };
            i = i + 1;
        };
        false
    }

    // === Admin Functions ===

    public fun set_testnet(config: &mut ProtocolConfig, _cap: &RegistryCap, is_testnet: bool) {
        config.is_testnet = is_testnet;
    }

    public fun set_paused(config: &mut ProtocolConfig, _cap: &RegistryCap, paused: bool) {
        config.paused = paused;
    }

    public fun set_timelock_duration(config: &mut ProtocolConfig, _cap: &RegistryCap, duration_ms: u64) {
        config.timelock_duration_ms = duration_ms;
    }

    public fun register_vault(registry: &mut ProtocolRegistry, _cap: &RegistryCap, vault_id: ID) {
        vec_set::insert(&mut registry.vaults, vault_id);
    }

    public fun register_strategy(registry: &mut ProtocolRegistry, _cap: &RegistryCap, strategy_id: ID, ctx: &mut TxContext) {
        vec_set::insert(&mut registry.strategies, strategy_id);
        // Initialize adapter bindings table for this strategy
        if (!table::contains(&registry.adapter_bindings, strategy_id)) {
            table::add(&mut registry.adapter_bindings, strategy_id, table::new(ctx));
        };
    }

    /// Register an adapter binding for a strategy
    /// Requires: RegistryCap (admin only)
    /// Emits: AdapterRegisteredEvent
    public entry fun register_adapter(
        registry: &mut ProtocolRegistry,
        config: &ProtocolConfig,
        _cap: &RegistryCap,
        strategy_id: ID,
        adapter_slot: u8,
        adapter_type: AdapterType,
        package_id: Option<address>,
        adapter_object_id: Option<ID>,
        allocation_basis_points: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(vec_set::contains(&registry.strategies, strategy_id), EStrategyNotFound);
        assert!(allocation_basis_points <= 10000, 6); // Max 100%
        
        if (!table::contains(&registry.adapter_bindings, strategy_id)) {
            table::add(&mut registry.adapter_bindings, strategy_id, table::new(ctx));
        };
        
        let strategy_adapters = table::borrow_mut(&mut registry.adapter_bindings, strategy_id);
        
        // Check if slot already exists
        if (table::contains(strategy_adapters, adapter_slot)) {
            abort EAdapterAlreadyRegistered
        };
        
        let binding = AdapterBinding {
            adapter_type,
            package_id,
            adapter_object_id,
            strategy_id,
            allocation_basis_points,
            last_harvest_timestamp: sui::clock::timestamp_ms(clock),
            is_active: true,
        };
        
        table::add(strategy_adapters, adapter_slot, binding);
        
        event::emit(AdapterRegisteredEvent {
            strategy_id,
            adapter_slot,
            adapter_type,
            package_id,
        });
    }

    /// Initiate an adapter swap with timelock
    /// Requires: RegistryCap, Clock
    /// Emits: AdapterSwapInitiatedEvent
    public entry fun initiate_adapter_swap(
        registry: &mut ProtocolRegistry,
        config: &ProtocolConfig,
        _cap: &RegistryCap,
        strategy_id: ID,
        adapter_slot: u8,
        new_adapter_type: AdapterType,
        new_package_id: Option<address>,
        new_adapter_object_id: Option<ID>,
        new_allocation_basis_points: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(vec_set::contains(&registry.strategies, strategy_id), EStrategyNotFound);
        assert!(new_allocation_basis_points <= 10000, 6);
        
        let strategy_adapters = table::borrow_mut(&mut registry.adapter_bindings, strategy_id);
        assert!(table::contains(strategy_adapters, adapter_slot), EAdapterNotFound);
        
        let unlock_timestamp = sui::clock::timestamp_ms(clock) + config.timelock_duration_ms;
        
        let new_binding = AdapterBinding {
            adapter_type: new_adapter_type,
            package_id: new_package_id,
            adapter_object_id: new_adapter_object_id,
            strategy_id,
            allocation_basis_points: new_allocation_basis_points,
            last_harvest_timestamp: sui::clock::timestamp_ms(clock),
            is_active: false, // Inactive until swap completes
        };
        
        let timelock = AdapterSwapTimelock {
            id: object::new(ctx),
            strategy_id,
            old_adapter_slot: adapter_slot,
            new_adapter_binding: new_binding,
            unlock_timestamp,
        };
        
        transfer::transfer(timelock, tx_context::sender(ctx));
        
        event::emit(AdapterSwapInitiatedEvent {
            strategy_id,
            adapter_slot,
            timelock_id: object::id(&timelock),
            unlock_timestamp,
        });
    }

    /// Complete an adapter swap after timelock expires
    /// Requires: AdapterSwapTimelock ownership, Clock
    /// Emits: AdapterSwappedEvent
    public entry fun complete_adapter_swap(
        registry: &mut ProtocolRegistry,
        timelock: AdapterSwapTimelock,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let AdapterSwapTimelock {
            id,
            strategy_id,
            old_adapter_slot,
            new_adapter_binding,
            unlock_timestamp,
        } = timelock;
        
        assert!(sui::clock::timestamp_ms(clock) >= unlock_timestamp, 7); // Timelock must have expired
        
        let strategy_adapters = table::borrow_mut(&mut registry.adapter_bindings, strategy_id);
        assert!(table::contains(strategy_adapters, old_adapter_slot), EAdapterNotFound);
        
        let old_binding = table::remove(strategy_adapters, old_adapter_slot);
        let old_type = old_binding.adapter_type;
        
        // Activate the new binding
        let mut new_binding = new_adapter_binding;
        new_binding.is_active = true;
        
        table::add(strategy_adapters, old_adapter_slot, new_binding);
        
        object::delete(id);
        
        event::emit(AdapterSwappedEvent {
            strategy_id,
            adapter_slot: old_adapter_slot,
            old_adapter_type: old_type,
            new_adapter_type: new_binding.adapter_type,
        });
    }

    /// Update adapter allocation (no timelock for allocation changes)
    public entry fun update_adapter_allocation(
        registry: &mut ProtocolRegistry,
        _cap: &RegistryCap,
        strategy_id: ID,
        adapter_slot: u8,
        new_allocation_basis_points: u64,
        ctx: &mut TxContext
    ) {
        assert!(new_allocation_basis_points <= 10000, 6);
        let strategy_adapters = table::borrow_mut(&mut registry.adapter_bindings, strategy_id);
        assert!(table::contains(strategy_adapters, adapter_slot), EAdapterNotFound);
        let binding = table::borrow_mut(strategy_adapters, adapter_slot);
        binding.allocation_basis_points = new_allocation_basis_points;
    }

    /// Update last harvest timestamp (called by keeper)
    public fun update_harvest_timestamp(
        registry: &mut ProtocolRegistry,
        strategy_id: ID,
        adapter_slot: u8,
        timestamp: u64
    ) {
        let strategy_adapters = table::borrow_mut(&mut registry.adapter_bindings, strategy_id);
        if (table::contains(strategy_adapters, adapter_slot)) {
            let binding = table::borrow_mut(strategy_adapters, adapter_slot);
            binding.last_harvest_timestamp = timestamp;
        };
    }
}
