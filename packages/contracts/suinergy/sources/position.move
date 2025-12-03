module suinergy::position {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;

    /// Position object representing funds deployed to an external protocol
    /// Each position is linked to an adapter that knows how to value it
    public struct Position has key {
        id: UID,
        adapter_id: ID, // The adapter that manages this position
        position_data: vector<u8>, // Opaque data specific to the adapter
    }

    /// Create a new position
    public fun new(
        adapter_id: ID,
        position_data: vector<u8>,
        ctx: &mut TxContext
    ): Position {
        Position {
            id: object::new(ctx),
            adapter_id,
            position_data,
        }
    }

    /// Get adapter ID for this position
    public fun adapter_id(position: &Position): ID {
        position.adapter_id
    }

    /// Get position data (opaque to vault, interpreted by adapter)
    public fun position_data(position: &Position): &vector<u8> {
        &position.position_data
    }

    /// Update position data (called by adapter during rebalancing)
    public fun update_data(
        position: &mut Position,
        new_data: vector<u8>
    ) {
        position.position_data = new_data;
    }

    /// Destroy position (called when fully withdrawn)
    public fun destroy(position: Position) {
        let Position { id, adapter_id: _, position_data: _ } = position;
        object::delete(id);
    }

    /// User Position - receipt token for user's vault shares
    public struct UserPosition has key, store {
        id: UID,
        vault_id: ID,
        shares: u64,
    }

    /// Create a new user position
    public fun new_user_position(
        vault_id: ID,
        shares: u64,
        ctx: &mut TxContext
    ): UserPosition {
        UserPosition {
            id: object::new(ctx),
            vault_id,
            shares,
        }
    }

    /// Get shares from user position
    public fun shares(position: &UserPosition): u64 {
        position.shares
    }

    /// Get vault ID from user position
    public fun vault_id(position: &UserPosition): ID {
        position.vault_id
    }

    /// Burn user position (called during withdrawal)
    public fun burn(position: UserPosition) {
        let UserPosition { id, vault_id: _, shares: _ } = position;
        object::delete(id);
    }
}
