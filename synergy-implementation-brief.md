# Suinergy MVP Implementation Brief

**Purpose:** Actionable implementation guide for completing the Suinergy dApp MVP on Sui Testnet.  
**Target Audience:** Engineering team or AI coding assistant  
**Priority Order:** Security-critical → Functional → UX

---

## Action 1: Fix TVL Calculation in Vault (CRITICAL)

**Intent:** Replace `total_assets` counter with computed TVL = treasury + sum(position_values)

**Files to Modify:**
- `packages/contracts/suinergy/sources/vault.move`

**Changes:**

1. **Remove `total_assets` from Vault struct (line 20):**
   ```move
   // REMOVE this field:
   total_assets: u64,
   ```

2. **Add function to compute total assets:**
   ```move
   /// Calculate total assets: treasury balance + sum of position values
   /// TODO: Requires adapter registry integration to query position values
   public fun total_assets<T>(vault: &Vault<T>): u64 {
       // For now, return treasury balance only
       // Full implementation requires:
       // 1. Get all Position objects from vault
       // 2. For each position, get adapter_id
       // 3. Look up adapter in registry
       // 4. Call adapter::get_position_value(position)
       // 5. Sum all position values
       balance::value(&vault.balance)
   }
   ```

3. **Update `deposit()` function (lines 58-62):**
   ```move
   // REPLACE line 59-63:
   let shares = if (vault.total_shares == 0) {
       amount
   } else {
       let total = total_assets(vault); // Use function instead of field
       (amount as u128 * (vault.total_shares as u128) / (total as u128)) as u64
   };
   ```

4. **Update `deposit()` to remove `total_assets` update (line 66):**
   ```move
   // REMOVE this line:
   vault.total_assets = vault.total_assets + amount;
   ```

5. **Update `withdraw()` function (line 87):**
   ```move
   // REPLACE line 87:
   let total = total_assets(vault); // Use function
   let amount = (shares as u128 * (total as u128) / (vault.total_shares as u128)) as u64;
   ```

6. **Remove `total_assets` update from `withdraw()` (line 92):**
   ```move
   // REMOVE this line:
   vault.total_assets = vault.total_assets - amount;
   ```

**Test:**
```move
#[test]
fun test_total_assets_computation() {
    // Create vault, deposit, verify total_assets() returns correct value
}
```

---

## Action 2: Implement View Functions (CRITICAL)

**Intent:** Create `vault_view.move` module so frontend can query vault state

**File to Create:**
- `packages/contracts/suinergy/sources/vault_view.move`

**Implementation:**
```move
module suinergy::vault_view {
    use sui::object::ID;
    use suinergy::vault::{Self, Vault};

    /// Get total shares minted
    #[view]
    public fun get_total_shares<T>(vault: &Vault<T>): u64 {
        vault.total_shares
    }

    /// Get treasury (idle) balance
    #[view]
    public fun get_treasury_balance<T>(vault: &Vault<T>): u64 {
        balance::value(&vault.balance)
    }

    /// Get total assets (TVL)
    #[view]
    public fun get_total_assets<T>(vault: &Vault<T>): u64 {
        vault::total_assets(vault)
    }

    /// Get share price (assets per share, with 9 decimals)
    #[view]
    public fun get_share_price<T>(vault: &Vault<T>): u64 {
        if (vault.total_shares == 0) {
            1000000000 // 1.0 with 9 decimals
        } else {
            let total = vault::total_assets(vault);
            (total as u128 * 1000000000 / (vault.total_shares as u128)) as u64
        }
    }

    /// Calculate value of user's shares
    #[view]
    public fun get_user_share_value<T>(
        vault: &Vault<T>,
        user_shares: u64
    ): u64 {
        if (vault.total_shares == 0) {
            0
        } else {
            let total = vault::total_assets(vault);
            (user_shares as u128 * (total as u128) / (vault.total_shares as u128)) as u64
        }
    }

    /// Get vault ID
    #[view]
    public fun get_vault_id<T>(vault: &Vault<T>): ID {
        object::uid_to_inner(&vault.id)
    }
}
```

**Export from Move.toml:**
Ensure `vault_view` is accessible (it should be automatically if in `sources/`)

**Frontend Integration:**
```typescript
// In use-vault-state.ts hook:
const result = await client.devInspectTransactionBlock({
    sender: '0x0',
    transactionBlock: {
        kind: 'moveCall',
        data: {
            packageId: PACKAGE_ID,
            module: 'vault_view',
            function: 'get_total_assets',
            typeArguments: ['0x2::sui::SUI'],
            arguments: [vaultId],
        },
    },
});
```

---

## Action 3: Implement Mock Adapter (CRITICAL)

**Intent:** Create mock adapter for testnet that simulates yield

**File to Create:**
- `packages/contracts/suinergy/sources/mock_adapter.move`

**Implementation:**
```move
module suinergy::mock_adapter {
    use sui::object::{Self, UID, ID};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use suinergy::position::{Self, Position};

    /// Mock adapter that simulates yield
    public struct MockAdapter<phantom T> has key {
        id: UID,
        balance: Balance<T>,
        apy_basis_points: u64, // APY in basis points (e.g., 500 = 5%)
        last_update_timestamp: u64,
        accumulated_yield: u64,
    }

    /// Create new mock adapter
    public fun new<T>(
        apy_basis_points: u64,
        ctx: &mut TxContext
    ): MockAdapter<T> {
        MockAdapter<T> {
            id: object::new(ctx),
            balance: balance::zero(),
            apy_basis_points,
            last_update_timestamp: 0,
            accumulated_yield: 0,
        }
    }

    /// Get position value: balance + accumulated yield
    public fun get_position_value<T>(
        adapter: &MockAdapter<T>,
        position: &Position,
        clock: &Clock
    ): u64 {
        let current_time = clock::timestamp_ms(clock);
        let elapsed_ms = current_time - adapter.last_update_timestamp;
        
        // Update yield: (APY / 10000) * (elapsed_seconds / 31536000) * balance
        let balance_val = balance::value(&adapter.balance);
        if (elapsed_ms > 0 && balance_val > 0) {
            let elapsed_years = (elapsed_ms as u128) / 31536000000; // ms in a year
            let yield_amount = (balance_val as u128 * (adapter.apy_basis_points as u128) * elapsed_years) / 1000000;
            balance_val + (yield_amount as u64)
        } else {
            balance_val
        }
    }

    /// Deposit into mock adapter
    public fun deposit<T>(
        adapter: &mut MockAdapter<T>,
        coin: Coin<T>,
        clock: &Clock,
        ctx: &mut TxContext
    ): Position {
        let amount = coin::value(&coin);
        balance::join(&mut adapter.balance, coin::into_balance(coin));
        
        // Update timestamp
        adapter.last_update_timestamp = clock::timestamp_ms(clock);
        
        // Create position (just store adapter ID in position_data)
        let position_data = bcs::to_bytes(&object::uid_to_inner(&adapter.id));
        position::new(object::uid_to_inner(&adapter.id), position_data, ctx)
    }

    /// Withdraw from mock adapter
    public fun withdraw<T>(
        adapter: &mut MockAdapter<T>,
        position: Position,
        amount: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): (Coin<T>, Option<Position>) {
        // Update yield before withdrawal
        let _ = get_position_value(adapter, &position, clock);
        
        // Withdraw from balance
        let withdrawn = balance::split(&mut adapter.balance, amount);
        let coin = coin::from_balance(withdrawn, ctx);
        
        // If balance is zero, destroy position
        if (balance::value(&adapter.balance) == 0) {
            position::destroy(position);
            (coin, option::none())
        } else {
            (coin, option::some(position))
        }
    }

    /// Get current APY
    public fun get_apy<T>(adapter: &MockAdapter<T>): u64 {
        adapter.apy_basis_points
    }
}
```

**Add to Move.toml dependencies:**
```toml
[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", ... }
```

---

## Action 4: Add Invariant Checks (HIGH PRIORITY)

**Intent:** Add safety assertions to prevent incorrect state

**File to Modify:**
- `packages/contracts/suinergy/sources/vault.move`

**Add to `deposit()` function (after line 63):**
```move
// After share calculation:
assert!(shares > 0, EZeroAmount); // Prevent zero shares
```

**Add to `deposit()` function (after balance join, line 65):**
```move
// Verify vault state is consistent
let total_after = total_assets(vault);
assert!(total_after >= amount, 2); // TVL should increase by at least deposit amount
```

**Add new error code (line 16):**
```move
const EInvalidState: u64 = 2;
```

**Add to `withdraw()` function (after line 88):**
```move
assert!(amount > 0, EZeroAmount);
let total_before = total_assets(vault);
assert!(total_before >= amount, EInvalidState); // Ensure sufficient liquidity
```

---

## Action 5: Implement Event Indexer (HIGH PRIORITY)

**Intent:** Make backend indexer process on-chain events

**File to Modify:**
- `apps/api/src/services/indexer.ts`

**Implementation:**
```typescript
private async indexEvents() {
    try {
        // Get last checkpoint from database
        const lastCheckpoint = await this.getLastCheckpoint();
        
        // Query events from Sui
        const events = await this.suiClient.queryEvents({
            query: {
                Package: process.env.SUI_SUINERGY_PACKAGE_ID!,
            },
            cursor: lastCheckpoint || undefined,
            limit: this.config.indexer.batchSize,
            order: 'ascending',
        });

        for (const event of events.data) {
            await this.processEvent(event);
        }

        // Update checkpoint
        if (events.nextCursor) {
            await this.saveCheckpoint(events.nextCursor);
        }
    } catch (error) {
        logger.error('Indexing error:', error);
        throw error;
    }
}

private async processEvent(event: SuiEvent) {
    const eventType = event.type;
    
    if (eventType.includes('DepositEvent')) {
        await this.handleDepositEvent(event);
    } else if (eventType.includes('WithdrawEvent')) {
        await this.handleWithdrawEvent(event);
    }
    // ... other event types
}

private async handleDepositEvent(event: SuiEvent) {
    const parsedJson = event.parsedJson as any;
    
    // Find or create user
    let user = await prisma.user.findUnique({
        where: { walletAddress: parsedJson.user },
    });
    
    if (!user) {
        user = await prisma.user.create({
            data: { walletAddress: parsedJson.user },
        });
    }
    
    // Create deposit record
    await prisma.deposit.create({
        data: {
            userId: user.id,
            txHash: event.id.txDigest,
            amount: parsedJson.amount.toString(),
            token: 'SUI', // Determine from vault type
            strategyId: parsedJson.vault_id,
            depositedAt: new Date(Number(event.timestampMs)),
        },
    });
}
```

**Uncomment imports (lines 1-4):**
```typescript
import { suiClient } from '../lib/sui-client';
import { prisma } from '../lib/prisma';
import { eventQueue } from '../jobs/queues';
```

---

## Action 6: Implement Strategy Service (HIGH PRIORITY)

**File to Modify:**
- `apps/api/src/services/strategy.service.ts`

**Implementation:**
```typescript
export class StrategyService {
    async getActiveStrategies(): Promise<Strategy[]> {
        return prisma.strategy.findMany({
            where: { isActive: true },
            orderBy: { currentApy: 'desc' },
        });
    }

    async getStrategy(strategyId: string): Promise<Strategy | null> {
        return prisma.strategy.findUnique({
            where: { id: strategyId },
            include: {
                apyHistory: {
                    orderBy: { timestamp: 'desc' },
                    take: 90, // Last 90 days
                },
            },
        });
    }

    async updateStrategyApy(strategyId: string, apy: number): Promise<void> {
        // Query vault on-chain to get current TVL and calculate APY
        const vault = await this.queryVaultState(strategyId);
        
        await prisma.$transaction([
            prisma.strategy.update({
                where: { id: strategyId },
                data: {
                    currentApy: apy,
                    tvl: vault.totalAssets.toString(),
                },
            }),
            prisma.apyHistory.create({
                data: {
                    strategyId,
                    apy,
                    tvl: vault.totalAssets.toString(),
                },
            }),
        ]);
    }

    private async queryVaultState(vaultId: string) {
        // Call vault_view::get_total_assets on-chain
        const result = await suiClient.devInspectTransactionBlock({
            sender: '0x0',
            transactionBlock: {
                kind: 'moveCall',
                data: {
                    packageId: process.env.SUI_SUINERGY_PACKAGE_ID!,
                    module: 'vault_view',
                    function: 'get_total_assets',
                    arguments: [vaultId],
                },
            },
        });
        
        // Parse return value
        return {
            totalAssets: BigInt(result.results[0].returnValues[0][0]),
        };
    }
}
```

---

## Action 7: Add TESTNET Badge to Frontend (MEDIUM)

**File to Modify:**
- `apps/dapp/src/components/layout/main-layout.tsx`

**Add near header:**
```typescript
const { data: registryState } = useAdapterRegistry();

// In JSX, add badge:
{registryState?.isTestnet && (
    <Badge variant="warning" className="mr-2">
        TESTNET
    </Badge>
)}
```

---

## Action 8: Replace Mock Strategy Data (MEDIUM)

**File to Modify:**
- `apps/dapp/src/app/strategies/[id]/page.tsx`

**Replace `getStrategyData()` function (lines 26-158):**
```typescript
const { data: strategy, isLoading } = useStrategy(strategyId);

// Remove hardcoded mock data, use:
const strategy = strategy || {
    // Fallback only if API fails
    id: strategyId,
    name: 'Loading...',
    // ...
};
```

**Update `use-strategies.ts` hook** to call backend API instead of mock.

---

## Action 9: Create .env.example Files (MEDIUM)

**File to Create:**
- `apps/dapp/.env.example`
- `apps/api/.env.example`

**Content for dapp/.env.example:**
```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
NEXT_PUBLIC_SUINERGY_PACKAGE_ID=
NEXT_PUBLIC_PROTOCOL_CONFIG_ID=
NEXT_PUBLIC_VAULT_ID=
NEXT_PUBLIC_USDC_VAULT_ID=
NEXT_PUBLIC_USDT_VAULT_ID=
NEXT_PUBLIC_USDC_COIN_TYPE=
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_BIRDEYE_API_KEY=
```

---

## Action 10: Add Test Coverage (LOW PRIORITY)

**File to Modify:**
- `packages/contracts/suinergy/tests/flow_tests.move`

**Add tests:**
```move
#[test]
fun test_share_price_first_deposit() {
    // Deposit when total_shares = 0, verify 1:1 ratio
}

#[test]
fun test_share_price_second_deposit() {
    // Deposit again, verify shares calculated correctly
}

#[test]
fun test_withdraw_insufficient_treasury() {
    // Test withdrawal when treasury < amount
    // Should fail or trigger position unwinding
}
```

---

## Implementation Order

1. ✅ Action 1: Fix TVL calculation
2. ✅ Action 2: Implement view functions
3. ✅ Action 3: Implement mock adapter
4. ✅ Action 4: Add invariant checks
5. ✅ Action 5: Event indexer
6. ✅ Action 6: Strategy service
7. ✅ Action 7-10: Polish and testing

---

## Testing Checklist

After implementation:

- [ ] `sui move build` succeeds
- [ ] `sui move test` passes all tests
- [ ] Deploy to testnet
- [ ] Initialize vaults
- [ ] Test deposit flow end-to-end
- [ ] Test withdrawal flow
- [ ] Verify view functions return correct data
- [ ] Check event indexing works
- [ ] Verify frontend displays real data

---

## Environment Setup Commands

```bash
# Backend
cd apps/api
cp .env.example .env
# Edit .env with actual values
pnpm prisma migrate dev
pnpm dev

# Frontend
cd apps/dapp
cp .env.example .env.local
# Edit .env.local with contract IDs
pnpm dev

# Contracts
cd packages/contracts/suinergy
sui move build
sui move test
```

---

This brief provides exact code signatures, file paths, and implementation steps. Follow in priority order for MVP completion.


