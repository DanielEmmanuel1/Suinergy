import express from 'express'
import { transactionService } from '../services/transaction.service'
import { logger } from '../utils/logger'

const router = express.Router()

/**
 * GET /api/transactions/:address
 * Get all transactions for a user
 * Query params: ?strategyId=xxx (optional)
 */
router.get('/:address', async (req, res, next) => {
    try {
        const { address } = req.params
        const strategyId = req.query.strategyId as string | undefined
        const transactions = await transactionService.getUserTransactions(address, strategyId)
        res.json(transactions)
    } catch (error) {
        logger.error(`Failed to fetch transactions for ${req.params.address}`, error)
        next(error)
    }
})

export default router

