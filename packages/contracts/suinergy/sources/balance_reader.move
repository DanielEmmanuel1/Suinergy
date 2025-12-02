module suinergy::balance_reader {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    
    /// Token balance struct returned to frontend
    public struct TokenBalance has copy, drop {
        sui: u64,
        usdc: u64,
        usdt: u64,
    }

    /// View function to get all token balances for a user
    /// Returns balances for SUI, USDC, and USDT
    /// 
    /// Note: For USDC and USDT, this currently returns 0.
    /// The frontend should query these directly using suiClient.getBalance()
    /// with the specific testnet coin type addresses, or this module can be
    /// extended to accept coin type parameters once testnet deployments are known.
    /// 
    /// # Arguments
    /// * `owner` - The address to query balances for
    /// 
    /// # Returns
    /// TokenBalance struct with sui, usdc, and usdt balances
    #[view]
    public fun get_balances(owner: address): TokenBalance {
        // Get SUI balance
        let sui_bal = balance::balance_of<SUI>(owner);
        
        // For USDC and USDT, return 0 for now
        // The frontend will query these directly via RPC with known testnet coin types
        // Once testnet coin package IDs are known, this can be extended to query them
        let usdc_bal = 0;
        let usdt_bal = 0;
        
        TokenBalance {
            sui: sui_bal,
            usdc: usdc_bal,
            usdt: usdt_bal,
        }
    }

    /// View function to get SUI balance only
    #[view]
    public fun get_sui_balance(owner: address): u64 {
        balance::balance_of<SUI>(owner)
    }
}

/// Testnet USDC coin type placeholder
/// In production, import from the actual testnet USDC package
/// Example: use 0x<package_id>::usdc::USDC
public struct USDC has drop {}

/// Testnet USDT coin type placeholder
/// In production, import from the actual testnet USDT package
/// Example: use 0x<package_id>::usdt::USDT
public struct USDT has drop {}

