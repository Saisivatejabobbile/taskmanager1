const { PrismaClient } = require('@prisma/client');

/**
 * Prisma Client Singleton
 * 
 * Provides a single instance of Prisma Client for the entire application.
 * Configures logging and error formatting for development.
 */

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'], // Log database queries and errors
  errorFormat: 'pretty', // Pretty-print errors in development
});

/**
 * Test database connection on initialization
 */
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  });

module.exports = prisma;
