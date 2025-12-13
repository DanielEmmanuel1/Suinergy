module shim::vault_entry_shim {
    use sui::coin::{Self, Coin};
    use sui::tx_context;
    use sui::transfer;
    use sui::tx_context::TxContext;

    use 0xb18e10c0d4cd763ae8f2d2972a6397d0d92f1638840a6f868f06d52683bf3d58::registry::ProtocolConfig;
    use 0xb18e10c0d4cd763ae8f2d2972a6397d0d92f1638840a6f868f06d52683bf3d58::position::UserPosition;
    use 0xb18e10c0d4cd763ae8f2d2972a6397d0d92f1638840a6f868f06d52683bf3d58::vault;

    /// Generic deposit that delegates to suinergy::vault::deposit
    entry public fun deposit<T>(
        vault_obj: &mut vault::Vault<T>,
        config: &ProtocolConfig,
        payment: Coin<T>,
        ctx: &mut TxContext
    ) {
        let pos = vault::deposit(vault_obj, config, payment, ctx);
        transfer::public_transfer(pos, tx_context::sender(ctx));
    }

    /// Generic withdraw that delegates to suinergy::vault::withdraw
    entry public fun withdraw<T>(
        vault_obj: &mut vault::Vault<T>,
        config: &ProtocolConfig,
        position: UserPosition,
        ctx: &mut TxContext
    ) {
        let coin = vault::withdraw(vault_obj, config, position, ctx);
        transfer::public_transfer(coin, tx_context::sender(ctx));
    }
}

