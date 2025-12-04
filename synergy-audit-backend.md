# Backend API Audit - Suinergy

## Application Structure

**Framework:** Express.js + TypeScript  
**Location:** `apps/api/`  
**Port:** 4000  
**Database:** PostgreSQL + Prisma ORM  
**Cache:** Redis  
**Jobs:** BullMQ

---

## Services Audit

### 1. strategy.service.ts

**Location:** `apps/api/src/services/strategy.service.ts`

**Current Implementation:**
```typescript
export class StrategyService {
    async getActiveStrategies(): Promise<void> {
        // Implementation will be added
    }
    async updateStrategyApy(_strategyId: string, _apy: number): Promise<void> {
        // Implementation will be added
    }
}
```

**Status:** ❌ **Complete stub - no implementation**

**What's Missing:**
- Database queries for Strategy model
- APY calculation logic
- TVL aggregation from on-chain queries
- Strategy metadata management

---

### 2. indexer.ts

**Location:** `apps/api/src/services/indexer.ts`

**Current Implementation:**
- ✅ Basic polling structure
- ✅ Checkpoint tracking
- ❌ `indexEvents()` function is empty (line 45-54)
- ⚠️ All imports commented out (lines 1-4)

**Status:** ❌ **Non-functional**

**What Should Index:**
- `DepositEvent` → Create/update Deposit records
- `WithdrawEvent` → Mark deposits as withdrawn
- `RebalanceEvent` → Track strategy allocations
- `HarvestEvent` → Update APY history

**Missing Implementation:**
```typescript
private async indexEvents() {
    // Should:
    // 1. Query Sui RPC for events from last checkpoint
    // 2. Filter for suinergy::events::* types
    // 3. Parse event data
    // 4. Upsert to Prisma database
    // 5. Update checkpoint
}
```

---

### 3. adapter-registry.service.ts

**Location:** `apps/api/src/services/adapter-registry.service.ts`

**Current Implementation:**
- ✅ Queries on-chain registry via `devInspectTransactionBlock`
- ✅ Parses adapter bindings (mock vs real)
- ✅ Handles missing registry gracefully

**Issues:**
1. **⚠️ View function calls may fail:**
   - Assumes `is_testnet()` and `get_adapter_binding()` exist in contracts
   - Registry module only has `ProtocolConfig`, no adapter registry

2. **✅ GOOD: Discovery logic structure exists** (lines 226-283)
   - `discoverTestnetAdapters()` framework in place
   - Needs actual protocol package IDs

**Status:** ⚠️ **Structure exists but depends on missing contract functions**

---

### 4. analytics.service.ts

**Location:** `apps/api/src/services/analytics.service.ts`

**Status:** ❌ **Not examined (likely stub)**

---

### 5. position.service.ts

**Location:** `apps/api/src/services/position.service.ts`

**Status:** ❌ **Not examined (likely stub)**

---

## API Routes

### 1. adapter-registry.routes.ts

**Endpoints:**
- `GET /api/adapter-registry` - Get registry state
- `GET /api/adapter-registry/strategy/:id` - Get strategy adapters

**Status:** ✅ **Implemented, calls adapter-registry.service**

---

### 2. positions.routes.ts

**Status:** ❌ **Not examined**

---

### 3. transactions.routes.ts

**Status:** ❌ **Not examined**

---

## Database Schema (Prisma)

**Location:** `apps/api/prisma/schema.prisma`

**Models:**
- ✅ `User` - Wallet addresses
- ✅ `Deposit` - Transaction tracking
- ✅ `Strategy` - Strategy metadata
- ✅ `ApyHistory` - Historical APY snapshots
- ✅ `LoyaltyScore` - User loyalty tiers
- ✅ `IndexedEvent` - Event processing queue
- ✅ `MetricsCache` - Performance caching

**Status:** ✅ **Well-designed schema**

**Missing:**
- Migration files (need to run `prisma migrate dev`)
- Seed data

---

## Configuration

**Location:** `apps/api/src/config/index.ts`

**Current Setup:**
- ✅ Environment variable loading
- ✅ Sui RPC URL configuration
- ✅ Database, Redis, cron job configs

**Required Environment Variables:**
```env
DATABASE_URL=postgresql://...
REDIS_HOST=localhost
REDIS_PORT=6379
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_SUINERGY_PACKAGE_ID=0xb18e10c0d4cd763ae8f2d2972a6397d0d92f1638840a6f868f06d52683bf3d58
SUI_PROTOCOL_CONFIG_ID=0x7a1b696b29feb33c286b90791be4d7a5121b89d1bc63124827ffc921dd3f07e3
```

**Status:** ✅ **Configuration structure complete**

---

## Background Jobs

**Location:** `apps/api/src/jobs/`

**Files:**
- `queues.ts` - BullMQ queue definitions
- `scheduler.ts` - Cron job scheduling

**Status:** ⚠️ **Structure exists, jobs not implemented**

**Expected Jobs:**
- APY updates (every 15 minutes)
- Loyalty score recalculation (hourly)
- Event indexing (continuous)
- Metrics cache refresh

---

## Recommendations

1. **CRITICAL:** Implement event indexer (`indexer.ts`)
2. **HIGH:** Implement strategy service (`strategy.service.ts`)
3. **HIGH:** Run Prisma migrations and seed database
4. **MEDIUM:** Implement analytics service
5. **MEDIUM:** Add background job implementations
6. **LOW:** Add API documentation (OpenAPI/Swagger)

---

## API Endpoints Status

| Endpoint | Status | Implementation |
|----------|--------|----------------|
| `GET /api/adapter-registry` | ✅ | Complete |
| `GET /api/adapter-registry/strategy/:id` | ✅ | Complete |
| `GET /api/strategies` | ❌ | Stub |
| `GET /api/strategies/:id` | ❌ | Stub |
| `GET /api/positions` | ❌ | Unknown |
| `GET /api/transactions` | ❌ | Unknown |

---

## Testing

**Status:** ❌ **No tests found**

**Missing:**
- Unit tests for services
- Integration tests for API routes
- Database migration tests


