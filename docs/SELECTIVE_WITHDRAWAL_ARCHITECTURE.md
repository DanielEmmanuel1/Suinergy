# Selective Position Withdrawal Architecture - Suinergy

## Executive Summary

This document describes the complete architecture for implementing selective per-protocol position withdrawals in Suinergy vaults. Users can choose which adapter/protocol position to withdraw from, while maintaining vault accounting integrity and strategy allocation weights.

---

## Current State Assessment

### ✅ What Exists
- Basic `Vault<T>` with deposit/withdraw functions
- `UserPosition` (share receipt tokens)
- `Position` struct definition (not yet used in vault)
- Adapter interface documentation
- Events framework
- Frontend deposit/withdraw modals

### ❌ What's Missing
- **Position tracking in vault** - Vault doesn't track which positions exist
- **Adapter registry** - No mapping from positions to adapters
- **Selective withdrawal logic** - Only proportional withdrawal exists
- **Partial adapter withdrawals** - Adapters don't expose partial withdraw
- **Position value aggregation** - Can't calculate TVL accurately
- **View functions** - Frontend can't query position states

### ⚠️ Testnet Adapter Status

**REAL ADAPTERS ON TESTNET:**
Based on codebase analysis, testnet adapter discovery requires:
- `SUI_SCALLOP_PACKAGE_ID` env var (not configured)
- `SUI_CETUS_PACKAGE_ID` env var (not configured)

**RECOMMENDATION:** Check Sui testnet for official deployments:
- Scallop Lending: Check their docs for testnet package ID
- Cetus DEX: Check their docs for testnet package ID  
- Navi Protocol: Check if deployed to testnet
- Kriya: Check if deployed to testnet

Until real adapters are deployed/verified, use mock adapters for testing.

---

## Architecture Design

### 1. Vault Structure Extension

**Current:**
```move
public struct Vault<phantom T> has key {
    id: UID,
    total_assets: u64,
    total_shares: u64,
    balance: Balance<T>,
}
```

**Extended:**
```move
public struct Vault<phantom T> has key {
    id: UID,
    total_assets: u64,
    total_shares: u64,
    balance: Balance<T>,
    positions: VecSet<ID>,  // Track all Position object IDs
    position_adapter_map: Table<ID, ID>,  // position_id -> adapter_id mapping
}
```

### 2. Position Registry Structure

Create a new `StrategyVaultRegistry` that tracks:
```move
public struct StrategyVaultRegistry has key {
    id: UID,
    vault_id: ID,
    // Maps adapter_id -> Position ID
    adapter_positions: Table<ID, ID>,
    // Maps Position ID -> AdapterInfo
    position_info: Table<ID, PositionInfo>,
}

public struct PositionInfo has store {
    adapter_id: ID,
    allocation_basis_points: u64,
    current_value: u64,  // Cached, updated on rebalance
    protocol_name: vector<u8>,  // "Scallop", "Cetus", etc.
}
```

### 3. Selective Withdrawal Flow

```
User initiates withdrawal:
  1. Frontend queries: GET /vaults/:id/positions
  2. User selects protocol (e.g., "Scallop")
  3. User enters amount to withdraw
  4. Frontend calls: withdraw_from_position(
        vault,
        user_position,  // User's share receipt
        adapter_id,     // Selected adapter
        amount,         // Amount in underlying tokens
     )
  5. Contract:
     a. Validates adapter_id is registered
     b. Gets Position object from registry
     c. Calculates user's proportional share of that position
     d. Calls adapter.withdraw_partial(position, amount)
     e. Burns proportional shares from UserPosition
     f. Updates vault.total_assets
     g. Transfers Coin<T> to user
     h. Emits WithdrawPositionEvent
```

### 4. Share Accounting Formula

For selective withdrawal:
```
user_position_value = user_shares * total_assets / total_shares
target_position_value = user_position_value * (position_value / total_assets)
shares_to_burn = user_shares * (withdraw_amount / target_position_value)
```

**Invariant:** `shares_to_burn <= user_shares`

---

## Smart Contract Implementation

### Module: `vault_selective.move`

```move
module suinergy::vault_selective {
    use sui::object::{Self, UID, ID};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::vec_set::{Self, VecSet};
    use sui::tx_context::{Self, TxContext};
    
    use suinergy::vault::{Self, Vault};
    use suinergy::position::{Self, Position, UserPosition};
    use suinergy::registry::ProtocolConfig;
    use suinergy::events;
    
    /// Error codes
    const EInvalidAdapter: u64 = 10;
    const EPositionNotFound: u64 = 11;
    const EInsufficientPositionValue: u64 = 12;
    const EExceedsUserShare: u64 = 13;
    
    /// Withdraw from a specific protocol position
    public entry fun withdraw_from_position<T>(
        vault: &mut Vault<T>,
        registry: &mut StrategyVaultRegistry,
        config: &ProtocolConfig,
        user_position: &mut UserPosition,
        adapter_id: ID,
        amount_underlying: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // 1. Validate adapter_id is registered
        assert!(table::contains(&registry.adapter_positions, adapter_id), EInvalidAdapter);
        
        // 2. Get position ID for this adapter
        let position_id = *table::borrow(&registry.adapter_positions, adapter_id);
        
        // 3. Get Position object (must be passed in or accessed via ID)
        // Note: In Sui, we need to pass the Position object or use object lookup
        // For now, assume Position is passed separately or accessed via registry
        
        // 4. Calculate user's share of this position
        let user_shares = position::shares(user_position);
        let total_shares = vault.total_shares;
        let total_assets = vault.total_assets;
        
        // User's total position value
        let user_total_value = (user_shares as u128 * total_assets as u128 / total_shares as u128) as u64;
        
        // Get position info
        let position_info = table::borrow(&registry.position_info, position_id);
        let position_value = position_info.current_value;
        
        // User's proportional share of this specific position
        let user_position_share = (user_total_value as u128 * position_value as u128 / total_assets as u128) as u64;
        
        // 5. Validate withdrawal amount
        assert!(amount_underlying <= user_position_share, EExceedsUserShare);
        assert!(amount_underlying > 0, 1); // EZeroAmount
        
        // 6. Calculate shares to burn
        let shares_to_burn = (user_shares as u128 * amount_underlying as u128 / user_total_value as u128) as u64;
        assert!(shares_to_burn <= user_shares, EExceedsUserShare);
        
        // 7. Withdraw from adapter (this is adapter-specific)
        // For now, we'll need to call the adapter's withdraw_partial function
        // This requires passing the Position object to the adapter
        let coins_returned = adapter_withdraw_partial<T>(adapter_id, position_id, amount_underlying, clock, ctx);
        
        // 8. Update accounting
        position::deduct_shares(user_position, shares_to_burn);
        vault.total_shares = total_shares - shares_to_burn;
        vault.total_assets = total_assets - amount_underlying;
        
        // Update position value in registry
        let position_info_mut = table::borrow_mut(&registry.position_info, position_id);
        position_info_mut.current_value = position_value - amount_underlying;
        
        // 9. Emit event
        events::emit_withdraw_position<T>(
            tx_context::sender(ctx),
            object::uid_to_inner(&vault.id),
            adapter_id,
            amount_underlying,
            shares_to_burn
        );
        
        // 10. Transfer coins to user
        transfer::public_transfer(coins_returned, tx_context::sender(ctx));
    }
    
    /// Helper to call adapter's withdraw_partial
    /// This will need to dispatch to the correct adapter module
    fun adapter_withdraw_partial<T>(
        adapter_id: ID,
        position_id: ID,
        amount: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): Coin<T> {
        // TODO: Implement adapter routing logic
        // This requires checking if adapter is mock or real
        // Then calling the appropriate module function
        abort 0 // Placeholder
    }
}
```

---

## Adapter Interface Extensions

All adapters must implement:

```move
/// Partial withdrawal from a position
public fun withdraw_partial<T>(
    adapter: &mut Adapter<T>,
    position: &mut Position<T>,
    amount: u64,
    clock: &Clock,
    ctx: &mut TxContext
): Coin<T> {
    // Real adapters: Call protocol's partial withdraw
    // Mock adapters: Simulate partial withdraw
    // If protocol doesn't support partial: Full withdraw + re-deposit remainder
}
```

---

## Frontend Implementation

### Modal Component: `SelectiveWithdrawModal.tsx`

```typescript
interface ProtocolPosition {
    adapterId: string
    protocolName: string
    allocationPercent: number
    currentValue: bigint
    userShare: bigint
    apy: number
    logo?: string
}

export function SelectiveWithdrawModal({
    open,
    onOpenChange,
    vaultId,
    userPosition,
    positions, // Fetched from API
    onWithdraw,
}) {
    // Display list of positions
    // User selects one
    // User enters amount
    // Shows share burn calculation
    // Executes withdraw_from_position
}
```

### API Integration

```typescript
// Fetch positions for vault
const { data: positions } = useQuery({
    queryKey: ['vault-positions', vaultId],
    queryFn: async () => {
        const response = await fetch(`/api/vaults/${vaultId}/positions`)
        return response.json()
    }
})

// Execute selective withdrawal
const withdrawFromPosition = async (
    adapterId: string,
    amount: bigint
) => {
    const tx = new Transaction()
    tx.moveCall({
        packageId: PACKAGE_ID,
        module: 'vault_selective',
        function: 'withdraw_from_position',
        typeArguments: [coinType],
        arguments: [
            vaultId,
            registryId,
            configId,
            userPositionId,
            adapterId,
            amount,
            clockId,
        ],
    })
    // Execute...
}
```

---

## Backend/Indexer Updates

### API Endpoints

```typescript
// GET /api/vaults/:id/positions
// Returns all positions with current values, allocations, etc.

// GET /api/vaults/:id/user/:address/positions  
// Returns user's proportional share of each position

// POST /api/vaults/:id/withdraw-position
// Proxy to contract call (optional, frontend can call directly)
```

### Indexer Updates

Indexer must track:
- `WithdrawPositionEvent` - new event type
- Update position values after withdrawals
- Recompute allocation weights
- Update user position breakdowns

---

## Security Invariants

### Must Maintain:

1. **Share Accounting:**
   ```
   total_shares > 0
   user_shares >= shares_to_burn
   total_assets >= sum(position_values) + treasury_balance
   ```

2. **Position Integrity:**
   ```
   position_value > 0 before withdrawal
   position_value >= amount_withdrawn
   user_share_of_position >= amount_withdrawn
   ```

3. **Adapter Validation:**
   ```
   adapter_id must exist in registry
   position must belong to adapter_id
   adapter must be active
   ```

4. **Access Control:**
   ```
   Only user who owns UserPosition can withdraw
   Cannot withdraw more than user's share
   ```

---

## Implementation Checklist

- [ ] Extend `Vault` struct to track positions
- [ ] Create `StrategyVaultRegistry` module
- [ ] Implement `withdraw_from_position` entry point
- [ ] Add `WithdrawPositionEvent` to events.move
- [ ] Extend adapter interface with `withdraw_partial`
- [ ] Implement mock adapter `withdraw_partial`
- [ ] Create view functions for position queries
- [ ] Build frontend `SelectiveWithdrawModal` component
- [ ] Add API endpoints for position queries
- [ ] Update indexer to track `WithdrawPositionEvent`
- [ ] Add unit tests for share accounting
- [ ] Add integration tests for selective withdrawal
- [ ] Document testnet adapter deployment status

---

## Next Steps

1. **Immediate:** Check testnet for real adapter deployments
2. **Phase 1:** Extend vault structure + registry
3. **Phase 2:** Implement selective withdrawal logic
4. **Phase 3:** Frontend modal + API integration
5. **Phase 4:** Testing + audit

---

**Status:** Design complete, ready for implementation

