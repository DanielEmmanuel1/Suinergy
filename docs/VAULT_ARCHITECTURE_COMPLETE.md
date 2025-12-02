# Suinergy Vault Architecture - Complete Design

## Executive Summary

This document describes the complete architecture for Suinergy's Sui-native yield aggregator vault system. The design ensures accurate TVL computation, real-time on-chain queries, and full support for both real and mock adapters on Testnet.

## 1. Core Architecture

### 1.1 StrategyVault Object

Each strategy is a self-contained `StrategyVault` object that owns all assets and positions:

```move
public struct StrategyVault<phantom BaseAsset> has key {
    id: UID,
    treasury: Treasury<BaseAsset>,        // Owns idle funds
    positions: VecSet<ID>,                 // Set of Position object IDs
    total_shares: u64,                     // Total shares minted
    base_asset_type: address,              // Type tag for base asset
    allocation_config: AllocationConfig,    // Target allocations per adapter
    last_rebalance_timestamp: u64,
    last_harvest_timestamp: u64,
}
```

**Key Properties:**
- Owns treasury object (not shared, fully controlled)
- Maintains set of Position object IDs
- Tracks total shares for share price calculation
- Stores allocation configuration for rebalancing

### 1.2 Treasury Object

Dedicated treasury for each vault:

```move
public struct Treasury<phantom BaseAsset> has key {
    id: UID,
    balance: Balance<BaseAsset>,
}
```

**Responsibilities:**
- Holds all idle funds not yet deployed to adapters
- Receives deposits from users
- Supplies withdrawals when treasury has sufficient balance
- Receives funds when positions are unwound

### 1.3 Position Objects

Each external protocol position is a separate object:

```move
public struct Position has key {
    id: UID,
    adapter_id: ID,           // Adapter that manages this position
    position_data: vector<u8>, // Opaque data specific to adapter
}
```

**Properties:**
- Owned by StrategyVault (or shareable for adapter access)
- Contains adapter-specific data (pool IDs, LP token amounts, etc.)
- Adapter must implement `get_position_value(position)` to compute current value

## 2. Accurate TVL Computation

### 2.1 Total Assets Formula

```
total_assets = treasury.balance + sum(get_position_value(position) for all positions)
```

### 2.2 Implementation

```move
fun total_assets<BaseAsset>(vault: &StrategyVault<BaseAsset>): u64 {
    let treasury_bal = treasury::balance(&vault.treasury);
    
    // Iterate through all positions
    let position_values_sum = 0u64;
    let positions = &vault.positions;
    // For each position_id in positions:
    //   1. Get Position object
    //   2. Get adapter_id from position
    //   3. Lookup adapter in registry
    //   4. Call adapter::get_position_value(position)
    //   5. Add to position_values_sum
    
    treasury_bal + position_values_sum
}
```

### 2.3 View Functions for Frontend

All view functions are marked with `#[view]` and are non-mutating:

```move
#[view]
public fun get_treasury_balance<BaseAsset>(vault: &StrategyVault<BaseAsset>): u64

#[view]
public fun get_position_values<BaseAsset>(vault: &StrategyVault<BaseAsset>): vector<u64>

#[view]
public fun get_total_strategy_value<BaseAsset>(vault: &StrategyVault<BaseAsset>): u64

#[view]
public fun get_user_share_value<BaseAsset>(
    vault: &StrategyVault<BaseAsset>,
    user_shares: u64
): u64
```

## 3. Share Minting Model

### 3.1 Deposit Flow

1. User calls `deposit(coin: Coin<BaseAsset>)`
2. Vault merges coin into treasury
3. Calculate shares: `shares = (deposit_amount * total_shares) / total_assets`
   - First deposit: 1:1 ratio (shares = deposit_amount)
4. Mint `VaultShare` object to user
5. Update `total_shares`
6. Emit `DepositEvent`

### 3.2 Withdrawal Flow

1. User calls `withdraw(share: VaultShare<BaseAsset>)`
2. Calculate redemption: `amount = (shares * total_assets) / total_shares`
3. Burn share object
4. Update `total_shares`
5. Withdraw from treasury if sufficient, else unwind positions
6. Return `Coin<BaseAsset>` to user
7. Emit `WithdrawEvent`

### 3.3 Share Price Formula

```
share_price = (total_assets * 10^9) / total_shares
```

This returns price with 9 decimal precision.

## 4. Adapter Interface

### 4.1 Required Functions

All adapters (real and mock) must implement:

```move
// Get current value of a position
public fun get_position_value(position: &Position): u64

// Deposit funds into protocol
public fun deposit(coin: Coin, clock: &Clock, ctx: &mut TxContext): (Position, Coin)

// Withdraw funds from protocol
public fun withdraw(position: Position, amount: u64, clock: &Clock, ctx: &mut TxContext): (Coin, Option<Position>)

// Get current APY
public fun get_apy(clock: &Clock): u64

// Get health status
public fun get_health_status(): u8
```

### 4.2 Real Adapters

Real adapters call into external protocol contracts:

```move
module suinergy::scallop_adapter {
    // Package ID of Scallop protocol on Testnet
    const SCALLOP_PACKAGE: address = @0x<testnet_package_id>;
    
    public fun get_position_value(position: &Position): u64 {
        // Query Scallop's pool contract for current LP token value
        // Return value in base asset units
    }
}
```

### 4.3 Mock Adapters

Mock adapters simulate yield:

```move
module suinergy::mock_adapter {
    public fun get_position_value(
        adapter: &MockAdapter,
        position_id: ID,
        clock: &Clock
    ): u64 {
        // Calculate: balance + accumulated_yield
        // Yield = APY * time_elapsed * balance
        update_yield(adapter, clock);
        balance::value(&adapter.balance) + adapter.accumulated_yield
    }
}
```

## 5. Wallet Balance Reader

### 5.1 Implementation

```move
module suinergy::balance_reader {
    #[view]
    public fun get_user_balances(owner: address): UserBalances {
        UserBalances {
            sui: balance::balance_of<SUI>(owner),
            usdc: balance::balance_of<USDC>(owner),
            usdt: balance::balance_of<USDT>(owner),
        }
    }
}
```

### 5.2 Frontend Usage

```typescript
const result = await client.devInspectTransactionBlock({
    sender: userAddress,
    transactionBlock: {
        kind: 'moveCall',
        data: {
            packageId: SUINERGY_PACKAGE_ID,
            module: 'balance_reader',
            function: 'get_user_balances',
            arguments: [userAddress],
        },
    },
});
```

## 6. Deposit/Withdraw Entry Points

### 6.1 Entry Functions

```move
module suinergy::vault_entry {
    public entry fun deposit_sui(
        vault: &mut StrategyVault<SUI>,
        config: &ProtocolConfig,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let share = strategy_vault::deposit(vault, config, payment, ctx);
        transfer::transfer(share, tx_context::sender(ctx));
    }
    
    // Similar for USDC and USDT
}
```

## 7. Testnet Integration

### 7.1 Adapter Registry

The registry maps strategy adapter slots to either:
- Real adapter (with package ID and object ID)
- Mock adapter (with mock adapter object ID)

```move
public struct AdapterBinding has store {
    adapter_type: AdapterType,      // REAL or MOCK
    package_id: Option<address>,    // Some(package_id) if real
    adapter_object_id: Option<ID>,   // Adapter instance ID
    strategy_id: ID,
    allocation_basis_points: u64,
    last_harvest_timestamp: u64,
    is_active: bool,
}
```

### 7.2 Switching Between Real and Mock

1. Admin initiates adapter swap with timelock
2. Snapshot current position values
3. Unwind from old adapter (real or mock)
4. Deposit into new adapter
5. Update registry binding
6. Emit `AdapterSwapEvent`

## 8. Frontend Data Requirements

### 8.1 Strategy Vault Data

```typescript
interface StrategyVaultData {
    vaultId: string;
    treasuryBalance: bigint;
    totalShares: bigint;
    totalAssets: bigint; // TVL
    sharePrice: bigint;
    positions: Array<{
        positionId: string;
        adapterId: string;
        adapterType: 'real' | 'mock';
        value: bigint;
        allocationBasisPoints: number;
    }>;
}
```

### 8.2 User Position Data

```typescript
interface UserPositionData {
    vaultId: string;
    userShares: bigint;
    shareValue: bigint; // Current value of user's shares
    sharePrice: bigint;
}
```

## 9. Security and Audit Considerations

### 9.1 Invariants

1. `total_assets == treasury.balance + sum(position_values)`
2. `total_shares >= 0` (always non-negative)
3. `share_price = total_assets / total_shares` (when shares > 0)
4. Only vault can mint/burn shares
5. Only authorized adapters can modify positions
6. Admin actions require explicit capabilities

### 9.2 Arithmetic Safety

- All multiplications use `u128` to prevent overflow
- Division checks for zero denominators
- Share calculations use bounded arithmetic

### 9.3 Reentrancy Protection

- Follow Checks-Effects-Interactions pattern
- Emit events before external calls
- Limit cross-module calls
- Use Sui's object ownership model (no reentrancy in Move)

## 10. Module Structure

```
suinergy/
├── strategy_vault.move      # Main vault logic
├── treasury.move            # Treasury object
├── position.move            # Position objects
├── vault_share.move         # Share objects
├── vault_entry.move         # Entry points
├── vault_view.move          # View functions
├── balance_reader.move      # Wallet balance queries
├── adapter_interface.move   # Adapter trait definition
├── mock_adapter.move        # Mock adapter implementation
├── real_adapters/
│   ├── scallop_adapter.move
│   ├── cetus_adapter.move
│   ├── kriya_adapter.move
│   └── ...
├── registry.move            # Adapter registry
└── events.move              # Event definitions
```

## 11. Implementation Status

✅ **Completed:**
- StrategyVault struct design
- Treasury object
- Position objects
- VaultShare objects
- Deposit/withdraw mechanics
- View function signatures
- Balance reader module
- Mock adapter with get_position_value
- Adapter registry

🔄 **To Complete:**
- Full position value aggregation in total_assets()
- Real adapter implementations for Testnet protocols
- Position unwinding logic in withdraw()
- Rebalancing logic
- Adapter registry integration with position queries

## 12. Next Steps

1. Deploy contracts to Testnet
2. Implement real adapter modules for available protocols
3. Test TVL computation accuracy
4. Verify share price calculations
5. Test deposit/withdraw flows
6. Integrate frontend with view functions
7. Audit all arithmetic operations
8. Security review of adapter swap mechanism

---

This architecture provides a production-ready foundation for accurate TVL computation, real-time queries, and seamless integration between real and mock adapters on Sui Testnet.

