/**
 * DayFlow Backend Authentication Server
 * Main application entry point
 * 
 * Requirements: 1.1-1.8, 10.1-10.8, 11.1-11.6
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./config/database');
const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const eventsRoutes = require('./routes/events');
const expensesRoutes = require('./routes/expenses');
const categoriesRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');
const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Environment variable validation
function validateEnvironment() {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  // JWT_SECRET must be strong in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    logger.error('JWT_SECRET must be at least 32 characters in production');
    process.exit(1);
  }

  logger.info('Environment variables validated successfully');
}

// Validate environment before starting
validateEnvironment();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    : '*',
  credentials: true
};

// Middleware stack
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Body parser with size limit
app.use(requestLogger); // Request/response logging

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check at root level
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'DayFlow Backend Authentication API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      tasks: 'CRUD at /api/tasks',
      events: 'CRUD at /api/events',
      expenses: 'CRUD at /api/expenses',
      categories: 'CRUD at /api/categories',
      dashboard: {
        stats: 'GET /api/dashboard/stats',
        weeklySummary: 'GET /api/dashboard/weekly-summary',
        budgets: 'GET /api/dashboard/budgets',
        focusStats: 'GET /api/dashboard/focus-stats'
      }
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Database connection and server startup
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${NODE_ENV}`);
      logger.info(`CORS: ${NODE_ENV === 'production' ? 'Restricted' : 'Permissive (*)'}`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      // Close HTTP server
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Disconnect Prisma
        await prisma.$disconnect();
        logger.info('Database disconnected');
        
        logger.info('Shutdown complete');
        process.exit(0);
      });

      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app; // Export for testing
