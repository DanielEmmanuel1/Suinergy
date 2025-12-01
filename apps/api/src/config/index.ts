import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    apiVersion: process.env.API_VERSION || 'v1',

    // Database
    databaseUrl: process.env.DATABASE_URL!,

    // Redis
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
    },

    // Sui Network
    sui: {
        network: process.env.SUI_NETWORK || 'testnet',
        rpcUrl: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
        websocketUrl: process.env.SUI_WEBSOCKET_URL || 'wss://fullnode.testnet.sui.io:443',
    },

    // Smart Contracts
    contracts: {
        vaultPackageId: process.env.VAULT_PACKAGE_ID,
        strategyPackageId: process.env.STRATEGY_PACKAGE_ID,
        governancePackageId: process.env.GOVERNANCE_PACKAGE_ID,
    },

    // Walrus
    walrus: {
        publisherUrl: process.env.WALRUS_PUBLISHER_URL,
        aggregatorUrl: process.env.WALRUS_AGGREGATOR_URL,
    },

    // Indexer
    indexer: {
        startCheckpoint: parseInt(process.env.INDEXER_START_CHECKPOINT || '0', 10),
        batchSize: parseInt(process.env.INDEXER_BATCH_SIZE || '100', 10),
        pollInterval: parseInt(process.env.INDEXER_POLL_INTERVAL || '5000', 10),
    },

    // Cron Jobs
    cron: {
        enabled: process.env.ENABLE_CRON_JOBS === 'true',
        apyUpdateSchedule: process.env.APY_UPDATE_CRON || '*/15 * * * *',
        loyaltyUpdateSchedule: process.env.LOYALTY_UPDATE_CRON || '0 * * * *',
    },

    // Security
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
};
