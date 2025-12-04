# Testnet Adapter Deployment Status

**Last Updated:** 2025-01-XX  
**Purpose:** Track which real adapters are available on Sui Testnet vs. mock adapters needed

## ⚠️ ACTION REQUIRED

**The following adapter package IDs need to be verified and configured:**

### Scallop Protocol
- **Status:** ❓ Unknown - needs verification
- **Env Var:** `SUI_SCALLOP_PACKAGE_ID`
- **Action:** 
  1. Check Scallop docs: https://docs.scallop.io
  2. Query testnet for Scallop lending pools
  3. Update `.env` with package ID if found
- **If Missing:** Use mock adapter

### Cetus DEX  
- **Status:** ❓ Unknown - needs verification
- **Env Var:** `SUI_CETUS_PACKAGE_ID`
- **Action:**
  1. Check Cetus docs: https://docs.cetus.xyz
  2. Query testnet for Cetus pool contracts
  3. Update `.env` with package ID if found
- **If Missing:** Use mock adapter

### Navi Protocol
- **Status:** ❓ Unknown - needs verification
- **Env Var:** `SUI_NAVI_PACKAGE_ID` (not yet defined)
- **Action:** Check if Navi has testnet deployment
- **If Missing:** Use mock adapter

### Kriya
- **Status:** ❓ Unknown - needs verification
- **Env Var:** `SUI_KRIYA_PACKAGE_ID` (not yet defined)
- **Action:** Check if Kriya has testnet deployment
- **If Missing:** Use mock adapter

## How to Verify Testnet Deployments

### Method 1: Check Protocol Documentation
Most protocols list their testnet deployments in their docs.

### Method 2: Query Sui Testnet Explorer
```bash
# Use Sui CLI to search for known protocol addresses
sui client objects --json | grep -i "scallop\|cetus\|navi\|kriya"
```

### Method 3: Check Sui Testnet RPC
```typescript
// Query for package objects
const packages = await suiClient.getOwnedObjects({
    owner: '0x...', // Known protocol deployer
    filter: { StructType: 'package' }
})
```

## Current Configuration

Check these files for current env var usage:
- `apps/api/src/services/adapter-registry.service.ts` (lines 230-242)
- `apps/dapp/src/config/index.ts`

## Recommendation

**Until real adapters are verified:**
1. ✅ Use mock adapters for all protocols
2. ✅ Implement selective withdrawal with mocks
3. ✅ Test thoroughly with mock adapters
4. 🔄 When real adapters found, swap via registry

**Mock adapters are fully functional for testing selective withdrawals.**

