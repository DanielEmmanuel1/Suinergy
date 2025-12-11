# Real Adapter Setup Guide

This guide explains how to configure and use real on-chain testnet adapters instead of mock adapters.

## Overview

Real adapters connect to actual DeFi protocols on Sui testnet:
- **Scallop**: Lending protocol
- **Cetus**: DEX/Liquidity pools
- **Navi**: Lending protocol (when available)
- **Kriya**: DEX (when available)

## Quick Start

### 1. Discover Protocol Package IDs

Run the discovery script to find protocol package IDs on testnet:

```bash
ts-node scripts/discover-testnet-protocols.ts
```

This will:
- Query Sui testnet for known protocol packages
- Update `.env.local` with discovered package IDs

### 2. Manual Configuration

If automatic discovery doesn't work, manually add package IDs to `.env.local`:

```env
# Protocol Package IDs (Testnet)
SUI_SCALLOP_PACKAGE_ID=0x...
SUI_CETUS_PACKAGE_ID=0x...
SUI_NAVI_PACKAGE_ID=0x...
SUI_KRIYA_PACKAGE_ID=0x...
```

**Where to find package IDs:**
- **Scallop**: Check [Scallop Documentation](https://docs.scallop.io)
- **Cetus**: Check [Cetus Documentation](https://docs.cetus.xyz)
- **Sui Explorer**: Search for protocol names on [testnet explorer](https://suiexplorer.com/?network=testnet)

### 3. Discover Pool Objects

Each protocol has pool objects that you need to interact with:

```typescript
import { testnetDiscoveryService } from './services/testnet-discovery.service';

// Discover Scallop pools
const scallopPools = await testnetDiscoveryService.discoverPoolObjects(
    process.env.SUI_SCALLOP_PACKAGE_ID!,
    'Scallop'
);

// Discover Cetus pools
const cetusPools = await testnetDiscoveryService.discoverPoolObjects(
    process.env.SUI_CETUS_PACKAGE_ID!,
    'Cetus'
);
```

### 4. Register Real Adapters

Use the adapter registry service to register real adapters:

```typescript
import { adapterRegistryService } from './services/adapter-registry.service';

// Register Scallop adapter
await adapterRegistryService.registerAdapter({
    protocol: 'Scallop',
    adapterType: 'real',
    packageId: process.env.SUI_SCALLOP_PACKAGE_ID!,
    poolId: scallopPools[0], // Use discovered pool ID
    allocationBasisPoints: 5000, // 50% allocation
});

// Register Cetus adapter
await adapterRegistryService.registerAdapter({
    protocol: 'Cetus',
    adapterType: 'real',
    packageId: process.env.SUI_CETUS_PACKAGE_ID!,
    poolId: cetusPools[0],
    allocationBasisPoints: 5000, // 50% allocation
});
```

## Move Contract Usage

### Creating Real Adapters in Move

```move
use suinergy::scallop_adapter::{Self, ScallopAdapter};
use suinergy::cetus_adapter::{Self, CetusAdapter};

// Create Scallop adapter
let scallop_adapter = scallop_adapter::new<SUI>(
    @0x<scallop_package_id>, // From env var
    @0x<pool_id>,            // Discovered pool ID
    ctx
);

// Create Cetus adapter
let cetus_adapter = cetus_adapter::new<SUI>(
    @0x<cetus_package_id>,   // From env var
    @0x<pool_id>,            // Discovered pool ID
    ctx
);
```

### Using Real Adapters

Real adapters implement the same interface as mock adapters:

```move
// Deposit into Scallop
let result = scallop_adapter::deposit(
    &mut scallop_adapter,
    coin,
    clock,
    ctx
);

// Withdraw from Cetus
let withdrawn = cetus_adapter::withdraw(
    &mut cetus_adapter,
    shares,
    clock,
    ctx
);

// Query balance
let balance = scallop_adapter::query_balance(&scallop_adapter, clock);
```

## Testing with Real Adapters

### 1. Update Test Configuration

In your test files, use real adapters when package IDs are available:

```move
#[test_only]
module suinergy::real_adapter_tests {
    use sui::test_scenario;
    use suinergy::scallop_adapter::{Self, ScallopAdapter};
    
    #[test]
    fun test_scallop_deposit() {
        // Only run if Scallop package ID is configured
        let scallop_package = @0x<testnet_package_id>; // From env
        let pool_id = @0x<pool_id>; // Discovered
        
        let mut scenario = test_scenario::begin(@0xADMIN);
        // ... test implementation
    }
}
```

### 2. Integration Tests

Create integration tests that use real testnet data:

```typescript
describe('Real Adapter Integration', () => {
    it('should deposit into Scallop pool', async () => {
        const adapter = await createScallopAdapter();
        const result = await adapter.deposit(coin, clock);
        expect(result.shares_minted).toBeGreaterThan(0);
    });
});
```

## Switching Between Mock and Real

The registry supports switching between mock and real adapters:

```typescript
// Use mock adapter (for testing)
await adapterRegistryService.registerAdapter({
    protocol: 'Scallop',
    adapterType: 'mock',
    // ... mock config
});

// Switch to real adapter (for production)
await adapterRegistryService.swapAdapter({
    protocol: 'Scallop',
    fromType: 'mock',
    toType: 'real',
    packageId: process.env.SUI_SCALLOP_PACKAGE_ID!,
    poolId: discoveredPoolId,
});
```

## Troubleshooting

### Package ID Not Found

1. Check protocol documentation for testnet package IDs
2. Use Sui Explorer to search for protocol contracts
3. Query testnet RPC directly:

```typescript
const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
const objects = await client.getOwnedObjects({
    owner: '<known_deployer_address>',
    filter: { StructType: 'package' }
});
```

### Pool Objects Not Found

1. Check protocol's pool registry or factory contract
2. Query shared objects with protocol-specific types
3. Use protocol's official SDK or documentation

### Adapter Calls Failing

1. Verify package ID is correct for testnet
2. Check pool object ID is valid and accessible
3. Ensure protocol functions match expected signatures
4. Review protocol's Move module structure

## Next Steps

1. **Implement Protocol-Specific Logic**: Update adapter Move modules with actual protocol function calls
2. **Add More Protocols**: Extend support for Navi, Kriya, and other protocols
3. **Error Handling**: Add comprehensive error handling for protocol-specific failures
4. **Monitoring**: Set up monitoring for real adapter health and performance

## Resources

- [Scallop Documentation](https://docs.scallop.io)
- [Cetus Documentation](https://docs.cetus.xyz)
- [Sui Testnet Explorer](https://suiexplorer.com/?network=testnet)
- [Sui Developer Documentation](https://docs.sui.io)

