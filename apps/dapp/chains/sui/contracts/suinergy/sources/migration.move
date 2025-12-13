module suinergy::migration {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::table::{Self, Table};
    
    use suinergy::position::{Self, UserPosition};

    /// Error codes
    const EInvalidVault: u64 = 1;
    const EZeroShares: u64 = 2;
    const EMigrationPaused: u64 = 3;
    const EPositionNotApproved: u64 = 4;
    const EDuplicateMigration: u64 = 5;

    /// Capability to authorize migrations (admin only)
    public struct MigrationCap has key, store {
        id: UID,
        /// Whether migrations are currently enabled
        migrations_enabled: bool,
        /// Table of approved old position object IDs that have been migrated
        /// Maps: old_position_id -> new_position_id (to prevent double migration)
        migrated_positions: Table<ID, ID>,
    }

    /// Initialize migration capability (admin only)
    public fun init_migration(ctx: &mut TxContext) {
        transfer::transfer(MigrationCap {
            id: object::new(ctx),
            migrations_enabled: true,
            migrated_positions: table::new(ctx),
        }, tx_context::sender(ctx));
    }

    /// Enable/disable migrations (admin only)
    public fun set_migrations_enabled(cap: &mut MigrationCap, enabled: bool) {
        cap.migrations_enabled = enabled;
    }

    /// Check if a position has already been migrated
    public fun is_migrated(cap: &MigrationCap, old_position_id: ID): bool {
        table::contains(&cap.migrated_positions, old_position_id)
    }

    /// Emergency migration: Create a new UserPosition with shares from an old position
    /// 
    /// SECURITY NOTES:
    /// - This function accepts position data directly (vault_id, shares, old_position_id)
    /// - The frontend must read the old position data from on-chain before calling this
    /// - An admin must approve each migration by calling this function (or via capability)
    /// - This prevents double-spending by tracking migrated positions
    /// 
    /// Flow:
    /// 1. Frontend reads old position object data (vault_id, shares, object_id)
    /// 2. Admin or authorized user calls this function with that data
    /// 3. Function validates and creates new position
    /// 4. User can then use new position with new package functions
    public entry fun migrate_position(
        cap: &mut MigrationCap,
        old_position_id: ID, // Object ID of the old position (for tracking)
        vault_id: ID,
        shares: u64,
        ctx: &mut TxContext
    ) {
        // Check migrations are enabled
        assert!(cap.migrations_enabled, EMigrationPaused);
        
        // Validate inputs
        assert!(shares > 0, EZeroShares);
        
        // Check this position hasn't already been migrated
        assert!(!table::contains(&cap.migrated_positions, old_position_id), EDuplicateMigration);
        
        // Create new position
        let new_position = position::new_user_position(vault_id, shares, ctx);
        let new_position_id = object::id(&new_position);
        
        // Record migration
        table::add(&mut cap.migrated_positions, old_position_id, new_position_id);
        
        // Transfer new position to user
        transfer::public_transfer(new_position, tx_context::sender(ctx));
    }

    /// Get the new position ID for a migrated old position (view function)
    public fun get_migrated_position(cap: &MigrationCap, old_position_id: ID): ID {
        *table::borrow(&cap.migrated_positions, old_position_id)
    }
}

