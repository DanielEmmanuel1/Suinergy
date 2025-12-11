import express from 'express'
import { adapterRegistryService } from '../services/adapter-registry.service'
import { logger } from '../utils/logger'

const router = express.Router()

/**
 * GET /api/adapter-registry
 * Get full adapter registry state
 */
router.get('/', async (_req, res, next) => {
    try {
        const state = await adapterRegistryService.getRegistryState()
        res.json(state)
    } catch (error) {
        logger.error('Failed to fetch adapter registry', error)
        next(error)
    }
})

/**
 * GET /api/adapter-registry/strategy/:strategyId
 * Get adapter bindings for a specific strategy
 */
router.get('/strategy/:strategyId', async (req, res, next) => {
    try {
        const { strategyId } = req.params
        const info = await adapterRegistryService.getStrategyAdapters(strategyId)
        res.json(info)
    } catch (error) {
        logger.error(`Failed to fetch adapters for strategy ${req.params.strategyId}`, error)
        next(error)
    }
})

/**
 * POST /api/adapter-registry/discover
 * Discover real Testnet adapters (admin only in production)
 */
router.post('/discover', async (_req, res, next) => {
    try {
        const discovered = await adapterRegistryService.discoverTestnetAdapters()
        res.json({ discovered })
    } catch (error) {
        logger.error('Failed to discover adapters', error)
        next(error)
    }
})

/**
 * POST /api/adapter-registry/verify
 * Verify a candidate Testnet adapter
 */
router.post('/verify', async (req, res, next) => {
    try {
        const { packageId, adapterObjectId, verificationFunctions } = req.body
        const verified = await adapterRegistryService.verifyTestnetAdapter(
            packageId,
            adapterObjectId,
            verificationFunctions || []
        )
        res.json({ verified })
    } catch (error) {
        logger.error('Failed to verify adapter', error)
        next(error)
    }
})

export default router

