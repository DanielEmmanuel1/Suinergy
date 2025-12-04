module suinergy::vault_entry {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::Clock;
    use sui::transfer;
    
    use suinergy::vault::{Self, Vault};
    use suinergy::registry::ProtocolConfig;
    use suinergy::position::{Self, UserPosition, Position};
    use suinergy::vault_selective::{Self, StrategyVaultRegistry};

    /// Error codes
    const EZeroAmount: u64 = 1;

    /// Deposit SUI into a vault
    public entry fun deposit_sui(
        vault: &mut Vault<SUI>,
        config: &ProtocolConfig,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        assert!(amount > 0, EZeroAmount);
        
        let position = vault::deposit(vault, config, payment, ctx);
        transfer::public_transfer(position, tx_context::sender(ctx));
    }

    /// Deposit any coin type into a vault
    public entry fun deposit<T>(
        vault: &mut Vault<T>,
        config: &ProtocolConfig,
        payment: Coin<T>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        assert!(amount > 0, EZeroAmount);
        
        let position = vault::deposit(vault, config, payment, ctx);
        transfer::public_transfer(position, tx_context::sender(ctx));
    }

    /// Withdraw SUI from a vault
    public entry fun withdraw_sui(
        vault: &mut Vault<SUI>,
        config: &ProtocolConfig,
        position: UserPosition,
        ctx: &mut TxContext
    ) {
        let coin = vault::withdraw(vault, config, position, ctx);
        transfer::public_transfer(coin, tx_context::sender(ctx));
    }

    /// Withdraw from a specific protocol position (selective withdrawal for SUI)
    public entry fun withdraw_from_position_sui(
        vault: &mut Vault<SUI>,
        registry: &mut StrategyVaultRegistry,
        config: &ProtocolConfig,
        user_position: &mut UserPosition,
        position_obj: &mut Position,
        adapter_id: ID,
        amount_underlying: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        vault_selective::withdraw_from_position(
            vault,
            registry,
            config,
            user_position,
            position_obj,
            adapter_id,
            amount_underlying,
            clock,
            ctx
        );
    }

    /// Generic selective withdrawal entry point
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
        vault_selective::withdraw_from_position(
            vault,
            registry,
            config,
            user_position,
            position_obj,
            adapter_id,
            amount_underlying,
            clock,
            ctx
        );
    }
}
