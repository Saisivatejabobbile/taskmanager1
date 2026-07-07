/**
 * Expense routes
 * Handles CRUD operations for expenses
 * 
 * Requirements: 4.1-4.10, 9.1-9.5, 13.1-13.5
 */

const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const validationService = require('../services/validation');
const logger = require('../utils/logger');

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * POST /api/expenses - Create new expense
 * Requirements: 4.1, 9.1-9.5, 13.3-13.4, 14.1
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const validation = validationService.validateExpense(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { amount, direction, categoryId, note, occurredAt, recurrenceRule } = validation.data;

    // Prepare data for database
    const expenseData = {
      userId: req.user.id, // Auto-assign from JWT token
      amount,
      direction,
      categoryId: categoryId || null,
      note: note || null,
      occurredAt: new Date(occurredAt),
      recurrenceRule: recurrenceRule || null,
    };

    // Create expense in database
    const expense = await prisma.expense.create({
      data: expenseData,
    });

    logger.info(`Expense created: ${expense.id} by user ${req.user.id}`);
    res.status(201).json(expense);

  } catch (error) {
    logger.error(`Error creating expense: ${error.message}`);
    next(error);
  }
});

/**
 * GET /api/expenses - List all user's expenses
 * Requirements: 4.2, 13.1, 14.3
 */
router.get('/', async (req, res, next) => {
  try {
    // Fetch only user's expenses
    const expenses = await prisma.expense.findMany({
      where: { userId: req.user.id },
      orderBy: { occurredAt: 'desc' },
    });

    logger.info(`Fetched ${expenses.length} expenses for user ${req.user.id}`);
    res.status(200).json(expenses);

  } catch (error) {
    logger.error(`Error fetching expenses: ${error.message}`);
    next(error);
  }
});

/**
 * GET /api/expenses/:id - Get expense by ID
 * Requirements: 4.3-4.4, 4.9, 13.1-13.2, 14.2
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validationService.validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Fetch expense
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    // Check if expense exists
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Verify ownership
    if (expense.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to access expense ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(expense);

  } catch (error) {
    logger.error(`Error fetching expense: ${error.message}`);
    next(error);
  }
});

/**
 * PUT /api/expenses/:id - Update expense
 * Requirements: 4.5-4.6, 9.1-9.5, 13.5, 14.4
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validationService.validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Validate request body
    const validation = validationService.validateExpense(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check if expense exists and verify ownership
    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (existing.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to update expense ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    const { amount, direction, categoryId, note, occurredAt, recurrenceRule } = validation.data;

    // Prepare update data
    const updateData = {
      amount,
      direction,
      categoryId: categoryId || null,
      note: note || null,
      occurredAt: new Date(occurredAt),
      recurrenceRule: recurrenceRule || null,
    };

    // Update expense
    const updated = await prisma.expense.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Expense updated: ${id} by user ${req.user.id}`);
    res.status(200).json(updated);

  } catch (error) {
    logger.error(`Error updating expense: ${error.message}`);
    next(error);
  }
});

/**
 * DELETE /api/expenses/:id - Delete expense
 * Requirements: 4.7-4.8, 13.5, 14.5
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validationService.validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Check if expense exists and verify ownership
    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (existing.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to delete expense ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete expense
    await prisma.expense.delete({
      where: { id },
    });

    logger.info(`Expense deleted: ${id} by user ${req.user.id}`);
    res.status(204).send();

  } catch (error) {
    logger.error(`Error deleting expense: ${error.message}`);
    next(error);
  }
});

module.exports = router;
