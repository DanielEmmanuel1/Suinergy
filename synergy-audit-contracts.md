# Move Contracts Audit - Suinergy

## Package Structure

```
packages/contracts/suinergy/
├── sources/
│   ├── vault.move              ✅ Active (basic deposit/withdraw)
│   ├── vault_entry.move        ✅ Active (entry points)
│   ├── registry.move           ✅ Active (ProtocolConfig)
│   ├── position.move           ✅ Active (UserPosition, Position)
│   ├── events.move             ✅ Active (event definitions)
│   ├── adapter.move            ✅ Active (interface docs only)
│   ├── vault_view.move.bak*    ❌ DELETED - NEEDS RESTORATION
│   ├── mock_adapter.move.bak*  ❌ DELETED - NEEDS IMPLEMENTATION
│   └── (many .bak files)       ⚠️ Backup files indicate refactoring
└── tests/
    └── flow_tests.move         ⚠️ Only 1 basic test
```

**Published Package ID:** `0xb18e10c0d4cd763ae8f2d2972a6397d0d92f1638840a6f868f06d52683bf3d58`

---

## Module-by-Module Audit

### 1. vault.move

**Location:** `packages/contracts/suinergy/sources/vault.move`

**Purpose:** Main vault logic for deposits, withdrawals, share minting/burning.

**Current Implementation:**
- ✅ `Vault<T>` struct with `total_assets`, `total_shares`, `balance`
- ✅ `deposit()` function with share calculation
- ✅ `withdraw()` function with redemption calculation
- ✅ Basic pause check via `ProtocolConfig`

**Critical Issues:**

1. **❌ CRITICAL: total_assets is a counter, not calculated TVL**
   ```move
   // Line 20: total_assets is just a u64 counter
   public struct Vault<phantom T> has key {
       total_assets: u64,  // ❌ WRONG: Should be computed, not stored
   }
   ```
   **Problem:** `total_assets` is updated on deposit/withdraw but never reflects actual TVL (treasury + position values). This breaks share price calculations.

2. **❌ MISSING: No position value aggregation**
   - Vault has no way to query Position objects
   - No integration with adapter registry to get position values
   - Architecture doc mentions `StrategyVault` with `positions: VecSet<ID>` but current `Vault` has no positions field

3. **❌ INCOMPLETE: Withdrawal assumes treasury has funds**
   ```move
   // Line 96: Comment says logic is missing
   // In a real implementation, we might need to withdraw from strategies
   // if idle balance is insufficient
   ```
   **Missing:** Position unwinding logic, adapter withdrawal calls.

4. **⚠️ SHARE CALCULATION: Potential rounding issues**
   ```move
   // Line 62: Uses u128 but truncates to u64
   (amount as u128 * (vault.total_shares as u128) / (vault.total_assets as u128)) as u64
   ```
   **Issue:** First deposit check prevents division by zero, but no protection against very small shares being truncated to 0.

5. **❌ MISSING: View functions**
   - No `#[view]` functions to query vault state
   - Frontend cannot read `total_assets`, `total_shares`, or `balance`

**What's Missing:**
- `total_assets()` function that computes: `treasury.balance + sum(position_values)`
- `get_share_price()` view function
- `get_user_share_value()` view function
- Position management (add/remove positions)
- Integration with adapter registry

---

### 2. vault_entry.move

**Location:** `packages/contracts/suinergy/sources/vault_entry.move`

**Purpose:** Public entry points for deposits/withdrawals.

**Current Implementation:**
- ✅ `deposit_sui()` entry point
- ✅ `deposit<T>()` generic entry point
- ✅ `withdraw_sui()` entry point
- ✅ Proper `public_transfer` of UserPosition/Coin

**Issues:**
1. **⚠️ Missing:** `withdraw<T>()` generic entry (only SUI specific)
2. **✅ Good:** Proper coin splitting and validation

**Status:** ✅ **Functional for basic flows**

---

### 3. registry.move

**Location:** `packages/contracts/suinergy/sources/registry.move`

**Purpose:** Global protocol configuration and admin controls.

**Current Implementation:**
- ✅ `ProtocolConfig` with `admin`, `is_testnet`, `version`, `paused`
- ✅ `init()` function creates config and `RegistryCap`
- ✅ `is_paused()` and `is_testnet()` getters

**Issues:**
1. **❌ MISSING: Adapter registry logic**
   - Architecture doc mentions `AdapterBinding` and registry, but this module only has `ProtocolConfig`
   - No adapter discovery, binding, or slot management

2. **⚠️ ADMIN ACCESS: No timelock/multisig**
   - Admin can pause/unpause immediately
   - Should have timelock for mainnet

**What's Missing:**
- Adapter registry struct and functions
- Adapter binding management (mock vs real)
- Strategy-to-adapter mappings

---

### 4. position.move

**Location:** `packages/contracts/suinergy/sources/position.move`

**Purpose:** Defines Position (adapter positions) and UserPosition (user shares).

**Current Implementation:**
- ✅ `Position` struct with `adapter_id`, `position_data`
- ✅ `UserPosition` struct with `vault_id`, `shares`
- ✅ Helper functions for getting/setting fields

**Issues:**
1. **✅ Good:** Clean separation of concerns
2. **⚠️ NOTE:** Position struct is defined but never used in vault.move

**Status:** ✅ **Correctly implemented**

---

### 5. adapter.move

**Location:** `packages/contracts/suinergy/sources/adapter.move`

**Purpose:** Documents expected adapter interface (Move doesn't have traits).

**Current Implementation:**
- ✅ `AdapterInfo` struct definition
- ✅ `DepositResult` and `WithdrawResult` structs
- ✅ Comments describing expected adapter functions
- ❌ No actual adapter implementations

**What's Missing:**
- `mock_adapter.move` implementation
- Real adapter modules (scallop_adapter.move, cetus_adapter.move, etc.)

---

### 6. events.move

**Location:** `packages/contracts/suinergy/sources/events.move`

**Purpose:** Event definitions for deposits, withdrawals, rebalances, harvests.

**Current Implementation:**
- ✅ All event structs defined
- ✅ Emission functions implemented

**Status:** ✅ **Complete**

---

### 7. vault_view.move (MISSING - Only .bak files exist)

**Expected Location:** `packages/contracts/suinergy/sources/vault_view.move`

**Purpose:** View functions for frontend to query vault state.

**Status:** ❌ **File deleted/renamed to .bak**

**What Should Exist:**
```move
#[view]
public fun get_total_assets<BaseAsset>(vault: &Vault<BaseAsset>): u64

#[view]
public fun get_total_shares<BaseAsset>(vault: &Vault<BaseAsset>): u64

#[view]
public fun get_treasury_balance<BaseAsset>(vault: &Vault<BaseAsset>): u64

#[view]
public fun get_share_price<BaseAsset>(vault: &Vault<BaseAsset>): u64

#[view]
public fun get_user_share_value<BaseAsset>(
    vault: &Vault<BaseAsset>,
    user_shares: u64
): u64
```

**Priority:** 🔴 **CRITICAL** - Frontend cannot function without this.

---

### 8. mock_adapter.move (MISSING - Only .bak files exist)

**Expected Location:** `packages/contracts/suinergy/sources/mock_adapter.move`

**Purpose:** Mock adapter for testnet that simulates yield.

**Status:** ❌ **File deleted/renamed to .bak**

**What Should Exist:**
- `MockAdapter` struct with balance, APY, timestamps
- `get_position_value()` that calculates: `balance + accumulated_yield`
- `deposit()` and `withdraw()` functions
- Yield accumulation based on Clock

**Priority:** 🔴 **CRITICAL** - Cannot test on testnet without this.

---

## Test Coverage

**Location:** `packages/contracts/suinergy/tests/flow_tests.move`

**Current Tests:**
- ✅ 1 basic flow test: deposit and withdraw (lines 12-57)
- ❌ No tests for share price calculation
- ❌ No tests for TVL computation
- ❌ No tests for position management
- ❌ No tests for adapter integration

**Missing Test Cases:**
1. First deposit (should be 1:1 shares)
2. Second deposit (should use formula)
3. Withdrawal with insufficient treasury (should unwind positions)
4. Share price calculation accuracy
5. Total assets = treasury + positions invariant
6. Edge cases: zero shares, very small deposits

---

## Compilation Status

**Can compile?** ✅ Likely yes (basic Move syntax is correct)

**Test command:**
```bash
cd packages/contracts/suinergy
sui move build
```

**Expected Issues:**
- May fail if dependencies on deleted modules (vault_view, mock_adapter)
- Will succeed if only active modules are imported

---

## Deployment Status

**Package ID:** `0xb18e10c0d4cd763ae8f2d2972a6397d0d92f1638840a6f868f06d52683bf3d58`  
**Network:** Testnet  
**Upgrade Cap:** `0xc9ab5ef73b5198843dd35cdb54c4fbc94472f1c36bcd51bce2f48f1d903ca912`

**Deployed Vaults:**
- SUI Vault: `0x0a40ef0c750be9e67b885933b13b7ae212df2732fb33a0165fbe991217cc5bf9`
- USDC Vault: `0x13b13f28f4096c897381f14cc9eec2c7e393b08b666daf5a7aa1f753b2437403`

**Deployment Info:** `packages/contracts/deployment_info.json`

---

## Security Concerns

1. **Share Calculation Rounding:** Small deposits may mint 0 shares
2. **No Invariant Checks:** `total_assets` can drift from actual TVL
3. **Missing Access Controls:** No capability checks for admin functions (if added later)
4. **No Reentrancy Protection:** Move prevents reentrancy, but adapter calls need careful design
5. **Withdrawal Without Liquidity Check:** Assumes treasury always has funds

---

## Recommendations

1. **IMMEDIATE:** Restore `vault_view.move` from `.bak` or recreate
2. **IMMEDIATE:** Implement `mock_adapter.move` 
3. **CRITICAL:** Fix TVL calculation to sum treasury + positions
4. **HIGH:** Add position management to Vault struct
5. **HIGH:** Implement adapter registry module
6. **MEDIUM:** Add comprehensive test suite
7. **MEDIUM:** Add invariant assertions in deposit/withdraw


