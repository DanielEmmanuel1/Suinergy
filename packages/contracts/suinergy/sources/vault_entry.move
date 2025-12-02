module suinergy::vault_entry {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    
    use suinergy::vault::{Self, Vault};
    use suinergy::registry::ProtocolConfig;
    use suinergy::position::UserPosition;
    use suinergy::balance_reader::{USDC, USDT};
    use suinergy::events;

    /// Error codes
    const EZeroAmount: u64 = 1;
    const EInsufficientBalance: u64 = 2;

    /// Deposit SUI into a vault
    /// 
    /// # Arguments
    /// * `vault` - Mutable reference to the vault
    /// * `config` - Protocol configuration (for pause checks)
    /// * `payment` - Coin<SUI> to deposit
    /// * `ctx` - Transaction context
    /// 
    /// # Returns
    /// UserPosition object representing the user's shares
    /// 
    /// # Emits
    /// DepositEvent
    public entry fun deposit_sui(
        vault: &mut Vault<SUI>,
        config: &ProtocolConfig,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        assert!(amount > 0, EZeroAmount);
        
        let position = vault::deposit(vault, config, payment, ctx);
        transfer::transfer(position, tx_context::sender(ctx));
        
        // Event is emitted by vault::deposit
    }

    /// Deposit USDC into a vault
    /// 
    /// # Arguments
    /// * `vault` - Mutable reference to the vault
    /// * `config` - Protocol configuration (for pause checks)
    /// * `payment` - Coin<USDC> to deposit
    /// * `ctx` - Transaction context
    /// 
    /// # Returns
    /// UserPosition object representing the user's shares
    /// 
    /// # Emits
    /// DepositEvent
    public entry fun deposit_usdc(
        vault: &mut Vault<USDC>,
        config: &ProtocolConfig,
        payment: Coin<USDC>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        assert!(amount > 0, EZeroAmount);
        
        let position = vault::deposit(vault, config, payment, ctx);
        transfer::transfer(position, tx_context::sender(ctx));
        
        // Event is emitted by vault::deposit
    }

    /// Deposit USDT into a vault
    /// 
    /// # Arguments
    /// * `vault` - Mutable reference to the vault
    /// * `config` - Protocol configuration (for pause checks)
    /// * `payment` - Coin<USDT> to deposit
    /// * `ctx` - Transaction context
    /// 
    /// # Returns
    /// UserPosition object representing the user's shares
    /// 
    /// # Emits
    /// DepositEvent
    public entry fun deposit_usdt(
        vault: &mut Vault<USDT>,
        config: &ProtocolConfig,
        payment: Coin<USDT>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        assert!(amount > 0, EZeroAmount);
        
        let position = vault::deposit(vault, config, payment, ctx);
        transfer::transfer(position, tx_context::sender(ctx));
        
        // Event is emitted by vault::deposit
    }

    /// Withdraw SUI from a vault
    /// 
    /// # Arguments
    /// * `vault` - Mutable reference to the vault
    /// * `config` - Protocol configuration (for pause checks)
    /// * `position` - UserPosition to burn for withdrawal
    /// * `ctx` - Transaction context
    /// 
    /// # Returns
    /// Coin<SUI> to the user
    /// 
    /// # Emits
    /// WithdrawEvent
    public entry fun withdraw_sui(
        vault: &mut Vault<SUI>,
        config: &ProtocolConfig,
        position: UserPosition,
        ctx: &mut TxContext
    ) {
        let coin = vault::withdraw(vault, config, position, ctx);
        transfer::public_transfer(coin, tx_context::sender(ctx));
    }

    /// Withdraw USDC from a vault
    public entry fun withdraw_usdc(
        vault: &mut Vault<USDC>,
        config: &ProtocolConfig,
        position: UserPosition,
        ctx: &mut TxContext
    ) {
        let coin = vault::withdraw(vault, config, position, ctx);
        transfer::public_transfer(coin, tx_context::sender(ctx));
    }

    /// Withdraw USDT from a vault
    public entry fun withdraw_usdt(
        vault: &mut Vault<USDT>,
        config: &ProtocolConfig,
        position: UserPosition,
        ctx: &mut TxContext
    ) {
        let coin = vault::withdraw(vault, config, position, ctx);
        transfer::public_transfer(coin, tx_context::sender(ctx));
    }
}

