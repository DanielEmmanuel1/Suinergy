import cron from 'node-cron';
import { config } from '../config';
import { logger } from '../utils/logger';
import { apyQueue, loyaltyQueue } from './queues';

export function initializeCronJobs() {
    if (!config.cron.enabled) {
        logger.info('Cron jobs disabled');
        return;
    }

    // APY update job
    cron.schedule(config.cron.apyUpdateSchedule, async () => {
        logger.info('Running scheduled APY update');
        await apyQueue.add('update-apy', {
            timestamp: new Date().toISOString(),
        });
    });

    // Loyalty score update job
    cron.schedule(config.cron.loyaltyUpdateSchedule, async () => {
        logger.info('Running scheduled loyalty update');
        await loyaltyQueue.add('update-loyalty', {
            timestamp: new Date().toISOString(),
        });
    });

    logger.info('Cron jobs initialized');
}
