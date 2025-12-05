#!/usr/bin/env ts-node

/**
 * Script to discover real protocol package IDs on Sui testnet
 * 
 * Usage:
 *   ts-node scripts/discover-testnet-protocols.ts
 * 
 * This script queries the Sui testnet to find package IDs for:
 * - Scallop (lending)
 * - Cetus (DEX)
 * - Navi (lending)
 * - Kriya (DEX)
 * 
 * Output: Updates .env file with discovered package IDs
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const TESTNET_RPC = getFullnodeUrl('testnet');

interface ProtocolInfo {
    name: string;
    envVar: string;
    knownAddresses?: string[]; // Known testnet addresses from docs
    searchPatterns?: string[];
}

const PROTOCOLS: ProtocolInfo[] = [
    {
        name: 'Scallop',
        envVar: 'SUI_SCALLOP_PACKAGE_ID',
        // Add known addresses from Scallop docs: https://docs.scallop.io
        knownAddresses: [],
    },
    {
        name: 'Cetus',
        envVar: 'SUI_CETUS_PACKAGE_ID',
        // Add known addresses from Cetus docs: https://docs.cetus.xyz
        knownAddresses: [],
    },
    {
        name: 'Navi',
        envVar: 'SUI_NAVI_PACKAGE_ID',
        knownAddresses: [],
    },
    {
        name: 'Kriya',
        envVar: 'SUI_KRIYA_PACKAGE_ID',
        knownAddresses: [],
    },
];

async function discoverPackage(
    client: SuiClient,
    protocol: ProtocolInfo
): Promise<string | null> {
    console.log(`\n🔍 Discovering ${protocol.name}...`);

    // Method 1: Try known addresses
    if (protocol.knownAddresses && protocol.knownAddresses.length > 0) {
        for (const address of protocol.knownAddresses) {
            try {
                const obj = await client.getObject({
                    id: address,
                    options: { showType: true, showContent: true },
                });

                if (obj.data) {
                    console.log(`  ✅ Found package at ${address}`);
                    return address;
                }
            } catch (error) {
                // Not found at this address, continue
            }
        }
    }

    // Method 2: Search by querying recent packages
    // Note: Sui doesn't have direct package search, so we'd need:
    // - Official protocol documentation
    // - Sui Explorer queries
    // - Community-maintained lists

    console.log(`  ⚠️  ${protocol.name} package not found`);
    console.log(`  💡 Check ${protocol.name} documentation for testnet package ID`);
    
    return null;
}

async function main() {
    console.log('🚀 Starting testnet protocol discovery...\n');
    console.log(`📡 Connecting to: ${TESTNET_RPC}\n`);

    const client = new SuiClient({ url: TESTNET_RPC });
    const discovered: Record<string, string> = {};

    // Discover all protocols
    for (const protocol of PROTOCOLS) {
        const packageId = await discoverPackage(client, protocol);
        if (packageId) {
            discovered[protocol.envVar] = packageId;
        }
    }

    // Update .env file
    const envPath = join(process.cwd(), '.env.local');
    let envContent = '';

    if (existsSync(envPath)) {
        envContent = readFileSync(envPath, 'utf-8');
    }

    // Update or add package IDs
    for (const [envVar, packageId] of Object.entries(discovered)) {
        const regex = new RegExp(`^${envVar}=.*$`, 'm');
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${envVar}=${packageId}`);
            console.log(`  ✏️  Updated ${envVar} in .env.local`);
        } else {
            envContent += `\n${envVar}=${packageId}`;
            console.log(`  ➕ Added ${envVar} to .env.local`);
        }
    }

    if (Object.keys(discovered).length > 0) {
        writeFileSync(envPath, envContent);
        console.log(`\n✅ Updated .env.local with discovered package IDs`);
    } else {
        console.log(`\n⚠️  No packages discovered. Please add package IDs manually:`);
        PROTOCOLS.forEach((p) => {
            console.log(`  ${p.envVar}=<package_id>`);
        });
    }

    console.log('\n📚 Resources:');
    console.log('  - Scallop: https://docs.scallop.io');
    console.log('  - Cetus: https://docs.cetus.xyz');
    console.log('  - Sui Explorer: https://suiexplorer.com/?network=testnet');
}

main().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});

