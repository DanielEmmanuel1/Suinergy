module suinergy::vault {
    use sui::object::{Self, UID, ID};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    
    use suinergy::registry::ProtocolConfig;
    use suinergy::position::{Self, UserPosition};
    use suinergy::events;

    /// Error codes
    const EPaused: u64 = 0;
    const EZeroAmount: u64 = 1;

    /// Main Vault object
    public struct Vault<phantom T> has key {
        id: UID,
        total_assets: u64,
        total_shares: u64,
        balance: Balance<T>, // Idle funds not yet deployed
    }

    /// Admin capability for the vault
    public struct VaultCap has key, store {
        id: UID,
    }

    public fun init_vault<T>(ctx: &mut TxContext) {
        let vault = Vault<T> {
            id: object::new(ctx),
            total_assets: 0,
            total_shares: 0,
            balance: balance::zero(),
        };
        
        let cap = VaultCap {
            id: object::new(ctx),
        };

        transfer::share_object(vault);
        transfer::transfer(cap, tx_context::sender(ctx));
    }

    /// Deposit assets into the vault
    public fun deposit<T>(
        vault: &mut Vault<T>,
        config: &ProtocolConfig,
        coin: Coin<T>,
        ctx: &mut TxContext
    ): UserPosition {
        assert!(!suinergy::registry::is_paused(config), EPaused);
        
        let amount = coin::value(&coin);
        assert!(amount > 0, EZeroAmount);

        // Calculate shares to mint
        let shares = if (vault.total_shares == 0) {
            amount
        } else {
            (amount as u128 * (vault.total_shares as u128) / (vault.total_assets as u128)) as u64
        };

        balance::join(&mut vault.balance, coin::into_balance(coin));
        vault.total_assets = vault.total_assets + amount;
        vault.total_shares = vault.total_shares + shares;

        events::emit_deposit(tx_context::sender(ctx), object::uid_to_inner(&vault.id), amount, shares);

        position::new_user_position(object::uid_to_inner(&vault.id), shares, ctx)
    }

    /// Withdraw assets from the vault
    public fun withdraw<T>(
        vault: &mut Vault<T>,
        config: &ProtocolConfig,
        position: UserPosition,
        ctx: &mut TxContext
    ): Coin<T> {
        assert!(!suinergy::registry::is_paused(config), EPaused);
        
        let shares = position::shares(&position);
        assert!(shares > 0, EZeroAmount);

        // Calculate assets to return
        let amount = (shares as u128 * (vault.total_assets as u128) / (vault.total_shares as u128)) as u64;

        // Burn position
        position::burn(position);
        vault.total_shares = vault.total_shares - shares;
        vault.total_assets = vault.total_assets - amount;

        // In a real implementation, we might need to withdraw from strategies if idle balance is insufficient
        // For scaffolding, we assume idle balance is enough or this logic is expanded later
        let withdrawn_balance = balance::split(&mut vault.balance, amount);

        events::emit_withdraw(tx_context::sender(ctx), object::uid_to_inner(&vault.id), amount, shares);

        coin::from_balance(withdrawn_balance, ctx)
    }
}
