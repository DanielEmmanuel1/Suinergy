#!/usr/bin/env node

/**
 * Upgrade script for Suinergy contracts
 * Usage: node scripts/upgrade-contract.js <network>
 * Networks: testnet, devnet, mainnet
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const network = process.argv[2] || 'testnet';
const contractsDir = path.join(__dirname, '../packages/contracts/suinergy');
const deploymentInfoPath = path.join(__dirname, '../packages/contracts/deployment_info.json');

console.log(`🔄 Upgrading Suinergy contracts on ${network}...\n`);

// Load deployment info
let deploymentInfo;
try {
    const deploymentInfoContent = fs.readFileSync(deploymentInfoPath, 'utf8');
    deploymentInfo = JSON.parse(deploymentInfoContent);
} catch (error) {
    console.error('❌ Could not read deployment_info.json');
    console.error('   Make sure the contract has been deployed first.');
    process.exit(1);
}

const packageId = deploymentInfo.packageId;
const upgradeCapId = deploymentInfo.upgradeCapId;

if (!packageId || !upgradeCapId) {
    console.error('❌ Missing packageId or upgradeCapId in deployment_info.json');
    process.exit(1);
}

console.log(`Package ID: ${packageId}`);
console.log(`Upgrade Cap ID: ${upgradeCapId}\n`);

// Clean previous build artifacts first (helps with file lock issues on Windows)
console.log('🧹 Cleaning previous build...');
try {
    execSync('sui move clean', { 
        cwd: contractsDir,
        stdio: 'pipe' // Suppress output for clean
    });
} catch (error) {
    // Ignore errors from clean - it's okay if there's nothing to clean
}

// Build contracts
console.log('📦 Building contracts...');
try {
    execSync('sui move build', { 
        cwd: contractsDir,
        stdio: 'inherit'
    });
    console.log('✅ Build successful\n');
} catch (error) {
    console.error('❌ Build failed');
    process.exit(1);
}

// Upgrade the package
console.log(`⬆️  Upgrading package...`);
let upgradeOutput;
try {
    upgradeOutput = execSync(
        `sui client upgrade --upgrade-capability ${upgradeCapId} --gas-budget 100000000 --json`,
        {
            cwd: contractsDir,
            encoding: 'utf8'
        }
    );
    
    const upgradeData = JSON.parse(upgradeOutput);
    
    console.log('✅ Upgrade successful!\n');
    console.log('Transaction Digest:', upgradeData.objectChanges?.find(c => c.type === 'published')?.packageId || 'N/A');
    
    // The package ID stays the same after upgrade, so no need to update
    console.log('\n📝 Note: Package ID remains the same after upgrade');
    console.log('   Your existing vaults and objects are still valid.');
    
} catch (error) {
    console.error('❌ Upgrade failed');
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

console.log('\n✅ Contract upgrade complete!');

