#!/usr/bin/env node

/**
 * Find USDC coin types in your wallet
 * Usage: node scripts/find-usdc-coin-type.js <wallet-address>
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const walletAddress = process.argv[2];

if (!walletAddress) {
    console.error('❌ Please provide your wallet address');
    console.error('   Usage: node scripts/find-usdc-coin-type.js <wallet-address>');
    console.error('   Example: node scripts/find-usdc-coin-type.js 0xb7ca1a42fc80bd12e488db0bbf086bd32ac604f160edef289e739bd339b395ff');
    process.exit(1);
}

console.log(`🔍 Finding USDC coin types in wallet: ${walletAddress}\n`);

try {
    // Get all coins from wallet
    const output = execSync(
        `sui client coins --address ${walletAddress} --json`,
        { encoding: 'utf8' }
    );
    
    const coins = JSON.parse(output);
    
    if (!coins.data || coins.data.length === 0) {
        console.log('❌ No coins found in wallet');
        process.exit(1);
    }
    
    // Filter for USDC-like coins
    const usdcCoins = coins.data.filter(coin => {
        const coinType = coin.coinType?.toLowerCase() || '';
        return coinType.includes('usdc') || coinType.includes('circle');
    });
    
    if (usdcCoins.length === 0) {
        console.log('❌ No USDC coins found in wallet\n');
        console.log('Found coin types:');
        const uniqueTypes = [...new Set(coins.data.map(c => c.coinType))];
        uniqueTypes.slice(0, 10).forEach(type => {
            console.log(`  - ${type}`);
        });
        if (uniqueTypes.length > 10) {
            console.log(`  ... and ${uniqueTypes.length - 10} more`);
        }
    } else {
        console.log(`✅ Found ${usdcCoins.length} USDC coin type(s):\n`);
        
        // Group by coin type
        const coinTypeMap = new Map();
        usdcCoins.forEach(coin => {
            const type = coin.coinType;
            const balance = BigInt(coin.balance || 0);
            const existing = coinTypeMap.get(type) || BigInt(0);
            coinTypeMap.set(type, existing + balance);
        });
        
        // Sort by balance
        const sortedTypes = Array.from(coinTypeMap.entries())
            .sort((a, b) => b[1] > a[1] ? 1 : -1);
        
        sortedTypes.forEach(([coinType, totalBalance], index) => {
            const humanBalance = Number(totalBalance) / 1e6; // USDC has 6 decimals
            console.log(`${index + 1}. ${coinType}`);
            console.log(`   Balance: ${humanBalance} USDC\n`);
        });
        
        if (sortedTypes.length > 0) {
            console.log('💡 Use the coin type with the highest balance:');
            console.log(`   ${sortedTypes[0][0]}\n`);
        }
    }
    
} catch (error) {
    console.error('❌ Error querying wallet:', error.message);
    
    if (error.stdout) {
        try {
            const errorData = JSON.parse(error.stdout);
            console.error('Error details:', JSON.stringify(errorData, null, 2));
        } catch (e) {
            console.error('Raw output:', error.stdout);
        }
    }
    
    process.exit(1);
}

