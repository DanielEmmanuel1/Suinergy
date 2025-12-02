import express from 'express'
import { positionService } from '../services/position.service'
import { logger } from '../utils/logger'

const router = express.Router()

/**
 * GET /api/positions/:address
 * Get all positions for a user
 */
router.get('/:address', async (req, res, next) => {
    try {
        const { address } = req.params
        const positions = await positionService.getUserPositions(address)
        res.json(positions)
    } catch (error) {
        logger.error(`Failed to fetch positions for ${req.params.address}`, error)
        next(error)
    }
})

export default router

