module suinergy::admin {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use sui::transfer;

    /// Admin Capability
    public struct AdminCap has key, store {
        id: UID,
    }

    public fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap {
            id: object::new(ctx),
        }, sui::tx_context::sender(ctx));
    }
}
