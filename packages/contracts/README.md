# Smart Contracts - Suinergy

Sui Move smart contracts for the Suinergy yield aggregator protocol.

## Packages

### Vault (`vault/`)
Manages user deposits and withdrawals:
- Accept SUI and USDC deposits
- Issue vault shares
- Process withdrawals
- Track total value locked (TVL)

### Strategy (`strategy/`)
Orchestrates yield strategies:
- Register new strategies
- Allocate funds across strategies
- Rebalance positions
- Track performance metrics

### Governance (`governance/`)
Protocol administration:
- Admin role management
- Parameter updates
- Emergency controls
- Upgrade authorization

## Development

### Build

```bash
sui move build --path vault
sui move build --path strategy
sui move build --path governance
```

### Test

```bash
sui move test --path vault
sui move test --path strategy
sui move test --path governance
```

### Deploy

Update `scripts/deploy.js` with your deployment configuration, then:

```bash
node scripts/deploy.js <network>
```

Networks: `localnet`, `devnet`, `testnet`, `mainnet`

## Structure

Each package follows the standard Sui Move structure:

```
package/
├── Move.toml        # Package manifest
└── sources/         # Move modules
    └── *.move       # Module files
```

## Documentation

- [Sui Move Book](https://move-book.com/)
- [Sui Documentation](https://docs.sui.io/)
- [Sui Move by Example](https://examples.sui.io/)
