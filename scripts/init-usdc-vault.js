#!/usr/bin/env node

/**
 * Initialize a USDC vault
 * Usage: node scripts/init-usdc-vault.js <usdc-coin-type>
 * Example: node scripts/init-usdc-vault.js "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const usdcCoinType = process.argv[2];

if (!usdcCoinType) {
    console.error('❌ Please provide the USDC coin type');
    console.error('   Usage: node scripts/init-usdc-vault.js <usdc-coin-type>');
    console.error('   Example: node scripts/init-usdc-vault.js "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC"');
    process.exit(1);
}

const contractsDir = path.join(__dirname, '../packages/contracts/suinergy');
const deploymentInfoPath = path.join(__dirname, '../packages/contracts/deployment_info.json');

console.log(`🔧 Initializing USDC Vault...\n`);
console.log(`USDC Coin Type: ${usdcCoinType}\n`);

// Load deployment info
let deploymentInfo;
try {
    const deploymentInfoContent = fs.readFileSync(deploymentInfoPath, 'utf8');
    deploymentInfo = JSON.parse(deploymentInfoContent);
} catch (error) {
    console.error('❌ Could not read deployment_info.json');
    process.exit(1);
}

const packageId = deploymentInfo.packageId;

if (!packageId) {
    console.error('❌ Missing packageId in deployment_info.json');
    process.exit(1);
}

console.log(`Package ID: ${packageId}\n`);

// Initialize USDC vault
console.log('📤 Initializing vault...');
let vaultOutput;
try {
    vaultOutput = execSync(
        `sui client call --package ${packageId} --module vault --function init_vault --type-args "${usdcCoinType}" --gas-budget 10000000 --json`,
        { encoding: 'utf8' }
    );
    
    const vaultData = JSON.parse(vaultOutput);
    
    const vaultId = vaultData.objectChanges?.find(
        change => change.type === 'created' && change.objectType?.includes('Vault')
    )?.objectId;
    
    const vaultCapId = vaultData.objectChanges?.find(
        change => change.type === 'created' && change.objectType?.includes('VaultCap')
    )?.objectId;
    
    if (vaultId && vaultCapId) {
        console.log(`✅ USDC Vault initialized!\n`);
        console.log(`   Vault ID: ${vaultId}`);
        console.log(`   Vault Cap ID: ${vaultCapId}`);
        
        // Update deployment info
        if (!deploymentInfo.vaults) {
            deploymentInfo.vaults = {};
        }
        
        deploymentInfo.vaults.USDC = {
            vaultId,
            vaultCapId,
            coinType: usdcCoinType,
            transactionDigest: vaultData.digest || 'N/A',
            initializedAt: new Date().toISOString(),
        };
        
        fs.writeFileSync(
            deploymentInfoPath,
            JSON.stringify(deploymentInfo, null, 4)
        );
        
        console.log('\n📝 Deployment info updated!');
        console.log('\n⚠️  IMPORTANT: Update your .env.local file:');
        console.log(`   NEXT_PUBLIC_USDC_VAULT_ID=${vaultId}`);
        
    } else {
        console.error('❌ Could not find Vault ID or Vault Cap ID');
        console.error('Transaction output:', JSON.stringify(vaultData, null, 2));
    }
    
} catch (error) {
    console.error('❌ Failed to initialize USDC vault');
    console.error(error.message);
    
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

