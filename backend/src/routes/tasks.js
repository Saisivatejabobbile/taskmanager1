/**
 * Task routes
 * Handles CRUD operations for tasks
 * 
 * Requirements: 2.1-2.9, 6.1-6.10, 7.1-7.7, 13.1-13.5, 14.1-14.5
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
 * POST /api/tasks - Create new task
 * Requirements: 2.1, 6.1-6.3, 6.9-6.10, 7.1-7.2, 7.5-7.7, 13.3-13.4, 14.1
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const validation = validationService.validateTask(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { title, notes, dueDate, priority, categoryId, status, recurrenceRule, subtasks, resourceLinks } = validation.data;

    // Prepare data for database (serialize JSON fields)
    const taskData = {
      userId: req.user.id, // Auto-assign from JWT token
      title,
      priority,
      status,
      notes: notes || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      categoryId: categoryId || null,
      recurrenceRule: recurrenceRule || null,
      subtasks: subtasks ? JSON.stringify(subtasks) : null,
      resourceLinks: resourceLinks ? JSON.stringify(resourceLinks) : null,
    };

    // Create task in database
    const task = await prisma.task.create({
      data: taskData,
    });

    // Deserialize JSON fields for response
    const responseTask = {
      ...task,
      subtasks: task.subtasks ? JSON.parse(task.subtasks) : null,
      resourceLinks: task.resourceLinks ? JSON.parse(task.resourceLinks) : null,
    };

    logger.info(`Task created: ${task.id} by user ${req.user.id}`);
    res.status(201).json(responseTask);

  } catch (error) {
    logger.error(`Error creating task: ${error.message}`);
    next(error);
  }
});

/**
 * GET /api/tasks - List all user's tasks
 * Requirements: 2.2, 13.1, 14.3
 */
router.get('/', async (req, res, next) => {
  try {
    // Fetch only user's tasks
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Deserialize JSON fields for each task
    const responseTasks = tasks.map(task => ({
      ...task,
      subtasks: task.subtasks ? JSON.parse(task.subtasks) : null,
      resourceLinks: task.resourceLinks ? JSON.parse(task.resourceLinks) : null,
    }));

    logger.info(`Fetched ${tasks.length} tasks for user ${req.user.id}`);
    res.status(200).json(responseTasks);

  } catch (error) {
    logger.error(`Error fetching tasks: ${error.message}`);
    next(error);
  }
});

/**
 * GET /api/tasks/:id - Get task by ID
 * Requirements: 2.3-2.4, 2.9, 13.1-13.2, 14.2
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validationService.validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Fetch task
    const task = await prisma.task.findUnique({
      where: { id },
    });

    // Check if task exists
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify ownership
    if (task.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to access task ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    // Deserialize JSON fields
    const responseTask = {
      ...task,
      subtasks: task.subtasks ? JSON.parse(task.subtasks) : null,
      resourceLinks: task.resourceLinks ? JSON.parse(task.resourceLinks) : null,
    };

    res.status(200).json(responseTask);

  } catch (error) {
    logger.error(`Error fetching task: ${error.message}`);
    next(error);
  }
});

/**
 * PUT /api/tasks/:id - Update task
 * Requirements: 2.5-2.6, 6.1-6.3, 6.9-6.10, 7.1-7.2, 13.5, 14.4
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validationService.validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Validate request body
    const validation = validationService.validateTask(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check if task exists and verify ownership
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existing.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to update task ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, notes, dueDate, priority, categoryId, status, recurrenceRule, subtasks, resourceLinks } = validation.data;

    // Prepare update data
    const updateData = {
      title,
      priority,
      status,
      notes: notes || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      categoryId: categoryId || null,
      recurrenceRule: recurrenceRule || null,
      subtasks: subtasks ? JSON.stringify(subtasks) : null,
      resourceLinks: resourceLinks ? JSON.stringify(resourceLinks) : null,
    };

    // Update task
    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // Deserialize JSON fields
    const responseTask = {
      ...updated,
      subtasks: updated.subtasks ? JSON.parse(updated.subtasks) : null,
      resourceLinks: updated.resourceLinks ? JSON.parse(updated.resourceLinks) : null,
    };

    logger.info(`Task updated: ${id} by user ${req.user.id}`);
    res.status(200).json(responseTask);

  } catch (error) {
    logger.error(`Error updating task: ${error.message}`);
    next(error);
  }
});

/**
 * DELETE /api/tasks/:id - Delete task
 * Requirements: 2.7-2.8, 13.5, 14.5
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validationService.validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Check if task exists and verify ownership
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existing.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to delete task ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete task
    await prisma.task.delete({
      where: { id },
    });

    logger.info(`Task deleted: ${id} by user ${req.user.id}`);
    res.status(204).send();

  } catch (error) {
    logger.error(`Error deleting task: ${error.message}`);
    next(error);
  }
});

module.exports = router;
