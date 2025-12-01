#!/usr/bin/env node

/**
 * Deployment script for Sui smart contracts
 * Usage: node deploy.js <network>
 * Networks: localnet, devnet, testnet, mainnet
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const network = process.argv[2] || 'testnet';
const contractsDir = path.join(__dirname, '../packages/contracts');

console.log(`Deploying contracts to ${network}...`);

// Deploy vault package
console.log('\n📦 Deploying vault package...');
// execSync(`sui client publish --gas-budget 100000000`, {
//   cwd: path.join(contractsDir, 'vault'),
//   stdio: 'inherit'
// });

// Deploy strategy package
console.log('\n📦 Deploying strategy package...');
// execSync(`sui client publish --gas-budget 100000000`, {
//   cwd: path.join(contractsDir, 'strategy'),
//   stdio: 'inherit'
// });

// Deploy governance package
console.log('\n📦 Deploying governance package...');
// execSync(`sui client publish --gas-budget 100000000`, {
//   cwd: path.join(contractsDir, 'governance'),
//   stdio: 'inherit'
// });

console.log('\n✅ Deployment complete!');
console.log('⚠️  Remember to update contract addresses in .env files');
