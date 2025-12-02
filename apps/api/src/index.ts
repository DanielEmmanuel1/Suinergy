import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './utils/logger';

const app: express.Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = config.corsOrigin.split(',').map(o => o.trim());
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
import adapterRegistryRoutes from './routes/adapter-registry.routes'
import positionsRoutes from './routes/positions.routes'
import transactionsRoutes from './routes/transactions.routes'

app.use('/api/adapter-registry', adapterRegistryRoutes)
app.use('/api/positions', positionsRoutes)
app.use('/api/transactions', transactionsRoutes)
// app.use('/api/v1/strategies', strategyRoutes);
// app.use('/api/v1/deposits', depositRoutes);
// app.use('/api/v1/analytics', analyticsRoutes);

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error(err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
        },
    });
});

const PORT = config.port;

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
});

export default app;
