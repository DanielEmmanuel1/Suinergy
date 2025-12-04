# Selective Withdrawal Implementation Status

## ✅ Completed Components

### 1. Smart Contracts
- ✅ **`vault_selective.move`** - Core selective withdrawal module
  - `StrategyVaultRegistry` struct for tracking positions
  - `withdraw_from_position` function with proper share accounting
  - View functions for querying positions
- ✅ **`position.move`** - Extended with `reduce_shares` and `split` functions
- ✅ **`events.move`** - Added `WithdrawPositionEvent`
- ✅ **`vault_entry.move`** - Added entry points for selective withdrawal

### 2. Frontend
- ✅ **`SelectiveWithdrawModal.tsx`** - Complete modal component
  - Position selection UI
  - Withdrawal amount input
  - Share burn calculation display
  - USD value display
- ✅ **`use-vault-positions.ts`** - Hook for fetching positions
- ✅ **Strategy page integration** - Button and modal added

### 3. Backend
- ✅ **`positions.routes.ts`** - API routes for position queries
- ✅ **`position.service.ts`** - Extended with vault position methods

### 4. Documentation
- ✅ **Architecture document** - Complete design specification
- ✅ **Testnet adapter status** - Tracking document

---

## ⚠️ Known Issues & TODOs

### Critical (Block MVP)

1. **Vault Structure Missing Position Tracking**
   - Current `Vault<T>` doesn't track positions
   - Need to add `positions: VecSet<ID>` and `position_adapter_map: Table<ID, ID>`
   - **File:** `packages/contracts/suinergy/sources/vault.move`

2. **Adapter Withdrawal Routing Not Implemented**
   - `adapter_withdraw_partial` function is a placeholder
   - Need to route to correct adapter (mock vs real)
   - **File:** `packages/contracts/suinergy/sources/vault_selective.move` (line ~200)

3. **Position Object Access**
   - `withdraw_from_position` requires Position object to be passed
   - Need strategy for fetching/accessing Position objects in entry point
   - Consider: Position objects should be stored in a way that's queryable

4. **View Functions Missing**
   - Frontend can't query position values on-chain
   - Need `#[view]` functions in `vault_selective.move` that are actually callable
   - Backend service queries will fail without proper view functions

### High Priority

5. **Registry Initialization**
   - `StrategyVaultRegistry` must be initialized and positions registered
   - Need admin function to register positions after deployment
   - **File:** `packages/contracts/suinergy/sources/vault_selective.move`

6. **Adapter Partial Withdraw Interface**
   - Mock adapters don't have `withdraw_partial` function
   - Real adapters need wrapper functions
   - **File:** Need to create/update mock adapter module

7. **Backend Position Query Implementation**
   - `getVaultPositions` method is incomplete
   - Needs proper parsing of Move return values
   - **File:** `apps/api/src/services/position.service.ts`

### Medium Priority

8. **Share Accounting Accuracy**
   - Current calculation in frontend is simplified
   - Should use actual vault `total_assets` and `total_shares`
   - Requires view functions to be implemented first

9. **Position Object ID Management**
   - Frontend needs to know Position object IDs
   - Should come from registry queries
   - May need additional view function

10. **Error Handling**
    - More specific error messages for different failure modes
    - Better handling of adapter failures

---

## 🔧 Required Fixes Before Testnet

### Fix 1: Extend Vault Structure

**File:** `packages/contracts/suinergy/sources/vault.move`

Add to `Vault<T>` struct:
```move
positions: VecSet<ID>,  // Track Position object IDs
```

Update `init_vault` to initialize empty set.

### Fix 2: Implement Adapter Routing

**File:** `packages/contracts/suinergy/sources/vault_selective.move`

Replace placeholder `adapter_withdraw_partial`:
```move
fun adapter_withdraw_partial<T>(
    registry: &StrategyVaultRegistry,
    adapter_id: ID,
    position: &mut Position,
    amount: u64,
    clock: &Clock,
    ctx: &mut TxContext
): Coin<T> {
    // 1. Get position info to determine adapter type
    let position_info = table::borrow(&registry.position_info, object::uid_to_inner(&position.id));
    
    // 2. Check if mock or real adapter (need to add this to PositionInfo)
    // 3. Call appropriate adapter module
    
    // For mock: mock_adapter::withdraw_partial(...)
    // For real: Use dynamic dispatch or module routing
    
    abort 0 // Placeholder
}
```

### Fix 3: Create Mock Adapter Partial Withdraw

**File:** `packages/contracts/suinergy/sources/mock_adapter.move` (create new)

```move
public fun withdraw_partial<T>(
    adapter: &mut MockAdapter<T>,
    position: &mut Position,
    amount: u64,
    clock: &Clock,
    ctx: &mut TxContext
): Coin<T> {
    // Update yield first
    let current_value = get_position_value(adapter, position, clock);
    
    // Calculate proportional withdrawal
    let balance_val = balance::value(&adapter.balance);
    let withdraw_amount = if (current_value > 0) {
        (amount * balance_val) / current_value
    } else {
        0
    };
    
    assert!(withdraw_amount <= balance_val, EInsufficientBalance);
    
    // Split balance
    let withdrawn = balance::split(&mut adapter.balance, withdraw_amount);
    coin::from_balance(withdrawn, ctx)
}
```

### Fix 4: Fix Entry Point Position Access

The entry point requires Position object, but we need a way to get it. Options:

**Option A:** Store Position IDs in registry, fetch objects separately
**Option B:** Pass Position ID, lookup in transaction
**Option C:** Position objects are shareable, access via ID

**Recommended:** Use Position objects stored in registry, make them accessible via view functions, then fetch by ID in frontend.

---

## 📋 Testnet Deployment Checklist

- [ ] Compile contracts: `sui move build --path packages/contracts/suinergy`
- [ ] Fix all compilation errors
- [ ] Deploy contracts to testnet
- [ ] Initialize `StrategyVaultRegistry` for each vault
- [ ] Register mock adapter positions
- [ ] Test selective withdrawal with mock adapter
- [ ] Verify share accounting correctness
- [ ] Test with real adapters (if available)
- [ ] Update frontend env vars with registry IDs
- [ ] Test end-to-end withdrawal flow

---

## 🧪 Testing Requirements

### Unit Tests (Move)
- [ ] Test share calculation for selective withdrawal
- [ ] Test position validation
- [ ] Test adapter routing
- [ ] Test edge cases (full withdrawal, zero amounts)

### Integration Tests
- [ ] Test withdrawal from mock adapter
- [ ] Test withdrawal from real adapter (when available)
- [ ] Test share accounting invariants
- [ ] Test event emission

### Frontend Tests
- [ ] Test modal position display
- [ ] Test withdrawal transaction construction
- [ ] Test error handling
- [ ] Test success/error modals

---

## 🔐 Security Audit Checklist

- [ ] Verify share burn calculation prevents over-withdrawal
- [ ] Verify position ownership checks
- [ ] Verify adapter validation
- [ ] Test reentrancy protection (Move prevents, but verify)
- [ ] Verify total_assets consistency after withdrawal
- [ ] Test boundary conditions (max withdrawal, zero withdrawal)
- [ ] Verify access control on registry functions

---

## 📝 Next Steps

1. **Fix vault structure** - Add position tracking
2. **Implement adapter routing** - Complete `adapter_withdraw_partial`
3. **Create mock adapter** - Implement `withdraw_partial`
4. **Add view functions** - Make positions queryable
5. **Complete backend service** - Properly parse Move return values
6. **Test end-to-end** - Full flow from UI to on-chain

---

**Current Status:** ~70% complete. Core architecture in place, needs adapter routing and position tracking completion.

