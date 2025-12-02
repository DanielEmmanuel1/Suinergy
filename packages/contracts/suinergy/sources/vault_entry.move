module suinergy::vault_entry {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    
    use suinergy::vault::{Self, Vault};
    use suinergy::registry::ProtocolConfig;
    use suinergy::position::{Self, UserPosition};

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
}
