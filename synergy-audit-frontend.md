# Frontend Audit - Suinergy dApp

## Application Structure

**Framework:** Next.js 14 with App Router  
**Location:** `apps/dapp/`  
**Port:** 3001 (configured in package.json)

---

## Key Components

### 1. Strategy Detail Page

**Location:** `apps/dapp/src/app/strategies/[id]/page.tsx` (1672 lines)

**Current Implementation:**
- ✅ Full UI with charts, allocation display, deposit/withdraw modals
- ❌ Uses **100% mock data** from `getStrategyData()` function (lines 26-158)
- ✅ Integrates with `useUserPositions()` hook to show user's actual positions
- ✅ Wallet connection via `@mysten/dapp-kit`

**Mock Data Sources:**
- Strategy APY, TVL, platforms: Hardcoded in `getStrategyData()`
- Performance history: Generated with `Math.random()` (lines 48-65)
- Platform allocations: Hardcoded percentages

**Real Data Integration:**
- ✅ User positions: Queries on-chain `UserPosition` objects
- ✅ Token balances: Uses `useTokenBalances()` hook
- ⚠️ Vault data: Reads `Vault` objects but calculates share price client-side

**Issues:**
1. **❌ CRITICAL: Cannot query vault state on-chain**
   - No view functions exist in contracts
   - Falls back to reading raw object fields (lines 139-162)
   - Share price calculated client-side, may be inaccurate

2. **⚠️ Mock Strategy Data:**
   ```typescript
   // Lines 26-158: All strategy info is hardcoded
   const strategies: Record<string, any> = {
       '1': { name: 'Prime USDC Vault', apy: 12.5, ... }
   }
   ```

3. **✅ GOOD: Deposit flow works**
   - Constructs transaction correctly (lines 200-400)
   - Handles coin type detection for USDC/USDT
   - Proper error handling

**What's Missing:**
- Backend API integration for strategy metadata
- Real-time APY updates from on-chain queries
- TVL calculation from vault view functions

---

### 2. Deposit Modal

**Location:** `apps/dapp/src/components/modals/deposit-modal.tsx` (465 lines)

**Current Implementation:**
- ✅ Token selection (SUI, USDC, USDT)
- ✅ Amount input with balance display
- ✅ Transaction construction using Sui SDK
- ✅ Coin type auto-detection for USDC/USDT

**Transaction Flow:**
```typescript
// Lines 98-220: Constructs moveCall
const tx = new Transaction()
tx.moveCall({
    packageId: process.env.NEXT_PUBLIC_SUINERGY_PACKAGE_ID,
    module: 'vault_entry',
    function: 'deposit',
    typeArguments: [coinType],
    arguments: [vaultId, configId, coin],
})
```

**Issues:**
1. **⚠️ Environment Variables Required:**
   - `NEXT_PUBLIC_SUINERGY_PACKAGE_ID`
   - `NEXT_PUBLIC_VAULT_ID` (or `NEXT_PUBLIC_USDC_VAULT_ID`, etc.)
   - `NEXT_PUBLIC_PROTOCOL_CONFIG_ID`
   - Missing `.env.example` file

2. **✅ GOOD: Handles multiple coin types**
   - Tries common USDC/USDT coin types (lines 116-138)
   - Falls back gracefully

3. **⚠️ No Transaction Simulation**
   - Doesn't preview share amount before deposit
   - User doesn't know how many shares they'll receive

**Status:** ✅ **Functional but needs env vars configured**

---

### 3. Hooks

#### use-user-positions.ts

**Purpose:** Query user's `UserPosition` objects from chain.

**Current Implementation:**
- ✅ Queries owned objects by type
- ✅ Calculates position value from shares and vault state
- ✅ Maps vault IDs to strategy names

**Issues:**
1. **⚠️ Share Price Calculation Client-Side:**
   ```typescript
   // Lines 138-167: Reads vault object and calculates
   const totalAssets = BigInt(vaultFields?.total_assets || 0)
   const totalShares = BigInt(vaultFields?.total_shares || 1)
   const actualValue = (shares * totalAssets) / totalShares
   ```
   **Problem:** `total_assets` is incorrect (not real TVL), so calculation is wrong.

2. **✅ GOOD: Handles old package ID fallback** (lines 48-66)

**Status:** ✅ **Works but relies on incorrect vault state**

---

#### use-strategies.ts

**Purpose:** Fetch strategy list from backend API.

**Current Implementation:**
- ⚠️ Calls `${apiConfig.baseUrl}/api/strategies`
- ⚠️ Backend endpoint not implemented (returns 404/stub)

**Status:** ❌ **Backend not ready**

---

#### use-token-balances.ts

**Purpose:** Query user's SUI, USDC, USDT balances.

**Current Implementation:**
- ✅ Uses `client.getBalance()` for each token
- ✅ Handles coin type detection

**Status:** ✅ **Works**

---

#### use-adapter-registry.ts

**Purpose:** Query adapter registry to check mock vs real adapters.

**Current Implementation:**
- ✅ Calls backend `/api/adapter-registry` endpoint
- ⚠️ Backend service exists but incomplete

**Status:** ⚠️ **Depends on backend**

---

### 4. Oracle/Price System

**Location:** `apps/dapp/src/lib/oracle/`

**Current Implementation:**
- ✅ Multi-provider price engine (Birdeye, Pyth, Switchboard)
- ✅ Caching (30s TTL)
- ✅ Fallback chain if provider fails

**Files:**
- `price-engine.ts` - Main engine
- `providers/birdeye.ts` - Birdeye API integration
- `providers/pyth.ts` - Pyth Hermes API
- `providers/switchboard.ts` - Stub (line 30: TODO)

**Issues:**
1. **⚠️ Birdeye requires API key:**
   ```typescript
   // birdeye.ts line 23-27
   const apiKey = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY;
   if (!apiKey) { return null; }
   ```

2. **⚠️ Switchboard not implemented** (switchboard.ts line 30)

3. **✅ GOOD: Price engine architecture is solid**

**Status:** ✅ **90% complete, needs API keys and Switchboard**

---

## Environment Variables Required

**Missing `.env.example` file.** Required vars:

```env
# Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Contract IDs
NEXT_PUBLIC_SUINERGY_PACKAGE_ID=0xb18e10c0d4cd763ae8f2d2972a6397d0d92f1638840a6f868f06d52683bf3d58
NEXT_PUBLIC_PROTOCOL_CONFIG_ID=0x7a1b696b29feb33c286b90791be4d7a5121b89d1bc63124827ffc921dd3f07e3
NEXT_PUBLIC_VAULT_ID=0x0a40ef0c750be9e67b885933b13b7ae212df2732fb33a0165fbe991217cc5bf9
NEXT_PUBLIC_USDC_VAULT_ID=0x13b13f28f4096c897381f14cc9eec2c7e393b08b666daf5a7aa1f753b2437403

# Coin Types
NEXT_PUBLIC_USDC_COIN_TYPE=0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000

# Oracles (optional)
NEXT_PUBLIC_BIRDEYE_API_KEY=your_key_here
```

---

## Wallet Integration

**Package:** `@mysten/dapp-kit` v0.14.33

**Supported Wallets:**
- ✅ Sui Wallet
- ✅ Suiet
- ✅ Martian
- ✅ Nightly
- ✅ Phantom
- ✅ OKX
- ✅ Bitget

**Status:** ✅ **Fully functional**

---

## UI/UX Issues

1. **✅ GOOD: Modern design with Tailwind + shadcn/ui**
2. **⚠️ Missing "TESTNET" badge** - Should show when on testnet
3. **⚠️ Missing "Mock Adapter" indicator** - Should warn users about test adapters
4. **✅ GOOD: Responsive layout**
5. **✅ GOOD: Loading states and error handling**

---

## Recommendations

1. **IMMEDIATE:** Create `.env.example` with all required variables
2. **CRITICAL:** Integrate vault view functions once contracts are fixed
3. **HIGH:** Replace mock strategy data with backend API calls
4. **HIGH:** Add TESTNET badge in header when `isTestnet === true`
5. **MEDIUM:** Add transaction simulation preview (show shares before deposit)
6. **MEDIUM:** Implement Switchboard oracle provider


