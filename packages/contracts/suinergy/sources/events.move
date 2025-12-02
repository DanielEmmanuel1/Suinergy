module suinergy::events {
    use sui::event;
    use sui::object::ID;
    use std::option;

    // === Event Structs ===

    public struct DepositEvent has copy, drop {
        user: address,
        vault_id: ID,
        amount: u64,
        shares_minted: u64,
    }

    public struct WithdrawEvent has copy, drop {
        user: address,
        vault_id: ID,
        amount: u64,
        shares_burned: u64,
    }

    public struct StrategyDepositEvent has copy, drop {
        strategy_id: ID,
        amount: u64,
    }

    public struct StrategyWithdrawEvent has copy, drop {
        strategy_id: ID,
        amount: u64,
    }

    public struct RebalanceEvent has copy, drop {
        vault_id: ID,
        strategy_id: ID,
        amount: u64,
        is_deposit: bool, // true if depositing into strategy, false if withdrawing
    }

    public struct HarvestEvent has copy, drop {
        strategy_id: ID,
        adapter_slot: u8,
        rewards_amount: u64,
        timestamp: u64,
    }

    public struct AdapterSwapEvent has copy, drop {
        strategy_id: ID,
        adapter_slot: u8,
        old_adapter_type: u8, // 0 = mock, 1 = real
        new_adapter_type: u8,
        old_package_id: Option<address>,
        new_package_id: Option<address>,
    }

    // === Emission Functions ===

    public fun emit_deposit(user: address, vault_id: ID, amount: u64, shares_minted: u64) {
        event::emit(DepositEvent {
            user,
            vault_id,
            amount,
            shares_minted,
        });
    }

    public fun emit_withdraw(user: address, vault_id: ID, amount: u64, shares_burned: u64) {
        event::emit(WithdrawEvent {
            user,
            vault_id,
            amount,
            shares_burned,
        });
    }

    public fun emit_strategy_deposit(strategy_id: ID, amount: u64) {
        event::emit(StrategyDepositEvent {
            strategy_id,
            amount,
        });
    }

    public fun emit_strategy_withdraw(strategy_id: ID, amount: u64) {
        event::emit(StrategyWithdrawEvent {
            strategy_id,
            amount,
        });
    }

    public fun emit_rebalance(vault_id: ID, strategy_id: ID, amount: u64, is_deposit: bool) {
        event::emit(RebalanceEvent {
            vault_id,
            strategy_id,
            amount,
            is_deposit,
        });
    }

    public fun emit_harvest(strategy_id: ID, adapter_slot: u8, rewards_amount: u64, timestamp: u64) {
        event::emit(HarvestEvent {
            strategy_id,
            adapter_slot,
            rewards_amount,
            timestamp,
        });
    }

    public fun emit_adapter_swap(
        strategy_id: ID,
        adapter_slot: u8,
        old_adapter_type: u8,
        new_adapter_type: u8,
        old_package_id: Option<address>,
        new_package_id: Option<address>
    ) {
        event::emit(AdapterSwapEvent {
            strategy_id,
            adapter_slot,
            old_adapter_type,
            new_adapter_type,
            old_package_id,
            new_package_id,
        });
    }
}
