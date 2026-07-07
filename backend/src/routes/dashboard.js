const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const dashboardService = require('../services/dashboardService');
const logger = require('../utils/logger');

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics (tasks due, next event, streak, spending)
 */
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.id;
    logger.info(`Fetching dashboard stats for user ${userId}`);

    const stats = await dashboardService.getDashboardStats(userId);
    
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    next(error);
  }
});

/**
 * GET /api/dashboard/weekly-summary
 * Get weekly summary with analytics
 * Query params:
 *   - week (optional): ISO week string (e.g., "2026-W27")
 */
router.get('/weekly-summary', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const week = req.query.week;

    logger.info(`Fetching weekly summary for user ${userId}, week: ${week || 'current'}`);

    const summary = await dashboardService.getWeeklySummary(userId, week);
    
    res.json(summary);
  } catch (error) {
    if (error.message.includes('Invalid week format')) {
      return res.status(400).json({ error: error.message });
    }
    logger.error('Error fetching weekly summary:', error);
    next(error);
  }
});

/**
 * GET /api/dashboard/budgets
 * Get budget status for all categories
 * Query params:
 *   - month (optional): Month string (e.g., "2026-07")
 */
router.get('/budgets', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const month = req.query.month;

    logger.info(`Fetching budget status for user ${userId}, month: ${month || 'current'}`);

    const budgets = await dashboardService.getBudgetStatus(userId, month);
    
    res.json(budgets);
  } catch (error) {
    if (error.message.includes('Invalid month format')) {
      return res.status(400).json({ error: error.message });
    }
    logger.error('Error fetching budget status:', error);
    next(error);
  }
});

/**
 * GET /api/dashboard/focus-stats
 * Get focus analytics
 * Query params:
 *   - period (optional): "day", "week", or "month" (default: "week")
 */
router.get('/focus-stats', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || 'week';

    // Validate period
    if (!['day', 'week', 'month'].includes(period)) {
      return res.status(400).json({ error: 'Period must be "day", "week", or "month"' });
    }

    logger.info(`Fetching focus stats for user ${userId}, period: ${period}`);

    const stats = await dashboardService.getFocusAnalytics(userId, period);
    
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching focus stats:', error);
    next(error);
  }
});

module.exports = router;
