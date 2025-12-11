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
    use suinergy::migration::MigrationCap;

    /// Error codes
    const EZeroAmount: u64 = 1;

    /// Initialize a new vault
    public entry fun init_vault<T>(ctx: &mut TxContext) {
        vault::init_vault<T>(ctx);
    }

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

    /// Withdraw any coin type from a vault
    public entry fun withdraw<T>(
        vault: &mut Vault<T>,
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

    /// Migrate an old UserPosition to the new package
    /// This allows users with positions from old packages to migrate to the new package
    public entry fun migrate_position(
        cap: &mut MigrationCap,
        old_position_id: ID,
        vault_id: ID,
        shares: u64,
        ctx: &mut TxContext
    ) {
        suinergy::migration::migrate_position(cap, old_position_id, vault_id, shares, ctx);
    }
}
