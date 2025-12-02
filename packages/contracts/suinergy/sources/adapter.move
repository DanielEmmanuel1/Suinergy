module suinergy::adapter {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::clock::Clock;

    /// Common errors
    const EInsufficientBalance: u64 = 0;
    const EUnsupportedToken: u64 = 1;
    const EInvalidAdapter: u64 = 2;
    const EDepositFailed: u64 = 3;
    const EWithdrawFailed: u64 = 4;

    /// Adapter trait interface - all adapters must implement these functions
    /// Note: Move doesn't have native traits, so we document the expected interface
    /// and enforce it through module conventions and wrapper functions.

    /// Adapter metadata for view functions
    public struct AdapterInfo has copy, drop {
        adapter_id: ID,
        adapter_type: address, // Package ID for real adapters, 0x0 for mock
        total_assets: u64,
        total_shares: u64,
        apy_basis_points: u64, // APY in basis points (e.g., 1250 = 12.5%)
        health_status: u8, // 0 = excellent, 1 = good, 2 = warning, 3 = critical
        last_update_timestamp: u64,
    }

    /// Deposit result from adapter
    public struct DepositResult has copy, drop {
        shares_minted: u64,
        actual_amount_deposited: u64,
    }

    /// Withdraw result from adapter
    public struct WithdrawResult has copy, drop {
        amount_withdrawn: u64,
        shares_burned: u64,
    }

    /// Expected adapter interface (documented, not enforced by type system):
    /// 
    /// public fun deposit<T>(
    ///     adapter: &mut Adapter<T>,
    ///     coin: Coin<T>,
    ///     clock: &Clock,
    ///     ctx: &mut TxContext
    /// ): DepositResult
    /// 
    /// public fun withdraw<T>(
    ///     adapter: &mut Adapter<T>,
    ///     shares: u64,
    ///     clock: &Clock,
    ///     ctx: &mut TxContext
    /// ): Coin<T>
    /// 
    /// public fun query_balance<T>(adapter: &Adapter<T>): u64
    /// 
    /// public fun query_shares<T>(adapter: &Adapter<T>): u64
    /// 
    /// public fun claim_rewards<T>(
    ///     adapter: &mut Adapter<T>,
    ///     clock: &Clock,
    ///     ctx: &mut TxContext
    /// ): Coin<T>
    /// 
    /// public fun get_apr<T>(adapter: &Adapter<T>, clock: &Clock): u64
    /// 
    /// public fun get_adapter_info<T>(adapter: &Adapter<T>, clock: &Clock): AdapterInfo

    /// Helper to validate adapter response
    public fun validate_deposit_result(result: &DepositResult): bool {
        result.shares_minted > 0 && result.actual_amount_deposited > 0
    }

    /// Helper to validate adapter balance query
    public fun validate_balance(balance: u64): bool {
        balance <= 18446744073709551615 // u64::MAX check
    }
}
