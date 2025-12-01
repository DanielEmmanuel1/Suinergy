// TODO: Uncomment when implementing event indexing
// import { suiClient } from '../lib/sui-client';
// import { prisma } from '../lib/prisma';
// import { eventQueue } from '../jobs/queues';
import { config } from '../config';
import { logger } from '../utils/logger';

export class SuiIndexer {
    private isRunning = false;
    private currentCheckpoint: string;

    constructor() {
        this.currentCheckpoint = config.indexer.startCheckpoint.toString();
    }

    async start() {
        if (this.isRunning) {
            logger.warn('Indexer already running');
            return;
        }

        this.isRunning = true;
        logger.info('Starting Sui indexer');

        this.poll();
    }

    async stop() {
        this.isRunning = false;
        logger.info('Stopping Sui indexer');
    }

    private async poll() {
        while (this.isRunning) {
            try {
                await this.indexEvents();
                await this.sleep(config.indexer.pollInterval);
            } catch (error) {
                logger.error('Indexer error:', error);
                await this.sleep(config.indexer.pollInterval * 2);
            }
        }
    }

    private async indexEvents() {
        // Event indexing logic will be implemented here
        // This will query Sui blockchain for events related to:
        // - Deposits
        // - Withdrawals
        // - Strategy allocations
        // - Yield distributions

        logger.debug(`Indexing from checkpoint: ${this.currentCheckpoint}`);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const indexer = new SuiIndexer();
