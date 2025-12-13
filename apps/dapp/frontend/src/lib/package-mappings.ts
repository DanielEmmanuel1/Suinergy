/**
 * Package Version Mappings
 * 
 * This file maps package IDs to their respective vault IDs across different deployments.
 * When a user has positions from multiple package versions, the frontend uses this
 * mapping to determine which vault ID to use for withdrawals.
 */

export interface VaultMapping {
    SUI: string
    USDC: string
    protocolConfigId?: string
}

export const PACKAGE_VAULT_MAPPINGS: Record<string, VaultMapping> = {
    // v4 (Current - Fresh Deployment with withdraw<T>)
    '0x24df8687d7140f69d475f8c0a3d1ab0b2626f0791fbf54e65424578422b40e86': {
        SUI: '0x3bf74a7eebce194ce13ca2583c74d52df0765072cf289a034bc5a928c28d01fe',
        USDC: '0x16d47da8ca130f69e3a2fea9701294f6a951aa764488e78c00d5facedaec44e8',
        protocolConfigId: '0x37f865d3e6048399fc9b4d7b1ec19ba9b14880442a098aae5d537a65e8259064',
    },

    // v3 (Previous Deployment)
    '0xf9905c6611e02cd1834a5f3b966276085d314037b1d6c2e56a6c20be2ea6b620': {
        SUI: '0x0cdf99a21b5d2512a03248db836886d1d6526125863704fa2fbcd8f76a1c7674',
        USDC: '0x0beb6af7b2b9dbe9d31a7f3df90638a3d3dd2b7b3461af5d1964f8ae3862f326',
    },

    // v2 (Old Deployment)
    '0xb18e10c0d4cd763ae8f2d2972a6397d0d92f1638840a6f868f06d52683bf3d58': {
        SUI: '0x0a40ef0c750be9e67b885933b13b7ae212df2732fb33a0165fbe991217cc5bf9',
        USDC: '0x13b13f28f4096c897381f14cc9eec2c7e393b08b666daf5a7aa1f753b2437403',
        protocolConfigId: '0x7a1b696b29feb33c286b90791be4d7a5121b89d1bc63124827ffc921dd3f07e3',
    },
}

/**
 * Get vault ID for a specific token type and package ID
 */
export function getVaultIdForPackage(
    packageId: string,
    tokenType: 'SUI' | 'USDC'
): string | null {
    const mapping = PACKAGE_VAULT_MAPPINGS[packageId]
    if (!mapping) return null

    return mapping[tokenType] || null
}

/**
 * Get protocol config ID for a package
 */
export function getProtocolConfigForPackage(packageId: string): string | null {
    const mapping = PACKAGE_VAULT_MAPPINGS[packageId]
    return mapping?.protocolConfigId || null
}

/**
 * Extract package ID from a UserPosition type string
 * Example: "0xabc...::position::UserPosition" => "0xabc..."
 */
export function extractPackageIdFromType(typeString: string): string | null {
    const match = typeString.match(/^(0x[a-f0-9]+)::/i)
    return match ? match[1] : null
}
