import express from 'express'
import { positionService } from '../services/position.service'
import { logger } from '../utils/logger'

const router = express.Router()

/**
 * GET /api/vaults/:vaultId/positions
 * Get all protocol positions for a vault with their current values and allocations
 */
router.get('/vaults/:vaultId/positions', async (req, res, next) => {
    try {
        const { vaultId } = req.params
        const registryId = req.query.registryId as string | undefined
        
        const positions = await positionService.getVaultPositions(vaultId, registryId)
        res.json(positions)
    } catch (error) {
        logger.error(`Failed to fetch positions for vault ${req.params.vaultId}`, error)
        next(error)
    }
})

/**
 * GET /api/vaults/:vaultId/user/:address/positions
 * Get user's proportional share of each position in the vault
 */
router.get('/vaults/:vaultId/user/:address/positions', async (req, res, next) => {
    try {
        const { vaultId, address } = req.params
        const registryId = req.query.registryId as string | undefined
        
        const positions = await positionService.getUserVaultPositions(vaultId, address, registryId)
        res.json(positions)
    } catch (error) {
        logger.error(`Failed to fetch user positions for vault ${req.params.vaultId}`, error)
        next(error)
    }
})

/**
 * GET /api/vaults/:vaultId/allocations
 * Get current allocation breakdown after withdrawals
 */
router.get('/vaults/:vaultId/allocations', async (req, res, next) => {
    try {
        const { vaultId } = req.params
        const registryId = req.query.registryId as string | undefined
        
        const allocations = await positionService.getVaultAllocations(vaultId, registryId)
        res.json(allocations)
    } catch (error) {
        logger.error(`Failed to fetch allocations for vault ${req.params.vaultId}`, error)
        next(error)
    }
})

export default router
