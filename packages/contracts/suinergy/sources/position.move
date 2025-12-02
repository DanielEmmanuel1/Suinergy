module suinergy::position {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;

    /// Represents a user's position in a specific vault
    public struct UserPosition has key, store {
        id: UID,
        vault_id: address, // The ID of the vault this position belongs to
        shares: u64,       // The number of shares owned
    }

    public fun new(vault_id: address, shares: u64, ctx: &mut TxContext): UserPosition {
        UserPosition {
            id: object::new(ctx),
            vault_id,
            shares,
        }
    }

    public fun shares(position: &UserPosition): u64 {
        position.shares
    }

    public fun vault_id(position: &UserPosition): address {
        position.vault_id
    }

    public fun burn(position: UserPosition) {
        let UserPosition { id, vault_id: _, shares: _ } = position;
        object::delete(id);
    }

    public fun join(self: &mut UserPosition, other: UserPosition) {
        let UserPosition { id, vault_id, shares } = other;
        assert!(self.vault_id == vault_id, 0); // Must be same vault
        self.shares = self.shares + shares;
        object::delete(id);
    }

    public fun split(self: &mut UserPosition, amount: u64, ctx: &mut TxContext): UserPosition {
        assert!(self.shares >= amount, 0);
        self.shares = self.shares - amount;
        new(self.vault_id, amount, ctx)
    }
}
