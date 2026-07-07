/**
 * Category routes
 * Handles CRUD operations for categories
 * 
 * Requirements: 5.1-5.10, 13.1-13.5
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
 * POST /api/categories - Create new category
 * Requirements: 5.1, 6.7, 13.3-13.4, 14.1
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const validation = validationService.validateCategory(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { name, type, color } = validation.data;

    // Prepare data for database
    const categoryData = {
      userId: req.user.id, // Auto-assign from JWT token
      name,
      type,
      color,
    };

    // Create category in database
    const category = await prisma.category.create({
      data: categoryData,
    });

    logger.info(`Category created: ${category.id} by user ${req.user.id}`);
    res.status(201).json(category);

  } catch (error) {
    logger.error(`Error creating category: ${error.message}`);
    next(error);
  }
});

/**
 * GET /api/categories - List all user's categories
 * Requirements: 5.2, 13.1, 14.3
 */
router.get('/', async (req, res, next) => {
  try {
    // Fetch only user's categories
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' },
    });

    logger.info(`Fetched ${categories.length} categories for user ${req.user.id}`);
    res.status(200).json(categories);

  } catch (error) {
    logger.error(`Error fetching categories: ${error.message}`);
    next(error);
  }
});

/**
 * GET /api/categories/:id - Get category by ID
 * Requirements: 5.3-5.4, 5.9, 13.1-13.2, 14.2
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validationService.validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Fetch category
    const category = await prisma.category.findUnique({
      where: { id },
    });

    // Check if category exists
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Verify ownership
    if (category.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to access category ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(category);

  } catch (error) {
    logger.error(`Error fetching category: ${error.message}`);
    next(error);
  }
});

/**
 * PUT /api/categories/:id - Update category
 * Requirements: 5.5-5.6, 6.7, 13.5, 14.4
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validationService.validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Validate request body
    const validation = validationService.validateCategory(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check if category exists and verify ownership
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (existing.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to update category ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, type, color } = validation.data;

    // Prepare update data
    const updateData = {
      name,
      type,
      color,
    };

    // Update category
    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Category updated: ${id} by user ${req.user.id}`);
    res.status(200).json(updated);

  } catch (error) {
    logger.error(`Error updating category: ${error.message}`);
    next(error);
  }
});

/**
 * DELETE /api/categories/:id - Delete category
 * Requirements: 5.7-5.8, 13.5, 14.5
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validationService.validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Check if category exists and verify ownership
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (existing.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to delete category ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete category
    await prisma.category.delete({
      where: { id },
    });

    logger.info(`Category deleted: ${id} by user ${req.user.id}`);
    res.status(204).send();

  } catch (error) {
    logger.error(`Error deleting category: ${error.message}`);
    next(error);
  }
});

module.exports = router;
