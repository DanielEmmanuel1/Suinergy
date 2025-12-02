module suinergy::view {
    use sui::object::{Self, ID};
    use sui::clock::Clock;
    use std::option::{Self, Option};
    use std::vector;
    
    use suinergy::registry::{Self, ProtocolRegistry, ProtocolConfig};
    use suinergy::strategy::{Self, StrategyVault};
    use suinergy::adapter::AdapterInfo;
    use suinergy::mock_adapter::{Self, MockAdapter};

    /// View function: Get complete strategy state including adapter info
    /// Returns: (total_assets, total_shares, reserve_balance, share_price, has_mock_adapters)
    public fun get_strategy_view<T>(
        strategy: &StrategyVault<T>,
        registry: &ProtocolRegistry,
        clock: &Clock
    ): (u64, u64, u64, u64, bool) {
        let strategy_id = object::uid_to_inner(&strategy.id);
        let (total_assets, total_shares, reserve, last_rebalance, last_harvest) = 
            strategy::get_strategy_info(strategy, clock);
        let share_price = strategy::get_share_price(strategy);
        let has_mock = registry::has_mock_adapters(registry, strategy_id);
        
        (total_assets, total_shares, reserve, share_price, has_mock)
    }

    /// View function: Get adapter binding info for frontend
    /// Returns: (adapter_type_is_mock, package_id_option, adapter_object_id_option, 
    ///           allocation_bp, last_harvest, is_active)
    public fun get_adapter_binding_view(
        registry: &ProtocolRegistry,
        strategy_id: ID,
        adapter_slot: u8
    ): (bool, Option<address>, Option<ID>, u64, u64, bool) {
        let (adapter_type, package_id, adapter_object_id, allocation_bp, last_harvest, is_active) = 
            registry::get_adapter_binding(registry, strategy_id, adapter_slot);
        
        (registry::is_mock(&adapter_type), package_id, adapter_object_id, allocation_bp, last_harvest, is_active)
    }

    /// View function: Get all adapters for a strategy
    /// Returns vector of (slot, is_mock, package_id, allocation_bp, last_harvest, is_active)
    public fun get_strategy_adapters_view(
        registry: &ProtocolRegistry,
        strategy_id: ID
    ): vector<(u8, bool, Option<address>, u64, u64, bool)> {
        let mut result = vector::empty();
        
        // Check slots 0-9 (max 10 adapters per strategy)
        let i = 0;
        while (i < 10) {
            let (is_mock, package_id, adapter_object_id, allocation_bp, last_harvest, is_active) = 
                registry::get_adapter_binding(registry, strategy_id, i);
            
            if (is_active) {
                vector::push_back(&mut result, (
                    i,
                    is_mock,
                    package_id,
                    allocation_bp,
                    last_harvest,
                    is_active
                ));
            };
            
            i = i + 1;
        };
        
        result
    }

    /// View function: Get mock adapter info
    public fun get_mock_adapter_info<T>(
        adapter: &MockAdapter<T>,
        clock: &Clock
    ): AdapterInfo {
        mock_adapter::get_adapter_info(adapter, clock)
    }

    /// View function: Check if protocol is on testnet
    public fun is_testnet_view(config: &ProtocolConfig): bool {
        registry::is_testnet(config)
    }

    /// View function: Check if protocol is paused
    public fun is_paused_view(config: &ProtocolConfig): bool {
        registry::is_paused(config)
    }
}

