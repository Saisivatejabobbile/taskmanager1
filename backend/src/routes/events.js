/**
 * Event routes
 * Handles CRUD operations for calendar events
 * 
 * Requirements: 3.1-3.10, 8.1-8.5, 13.1-13.5
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
 * POST /api/events - Create new event
 * Requirements: 3.1, 8.1-8.5, 13.3-13.4, 14.1
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const validation = validationService.validateEvent(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { title, eventDate, alertDaysBefore, repeatsYearly, category } = validation.data;

    // Prepare data for database
    const eventData = {
      userId: req.user.id, // Auto-assign from JWT token
      title,
      eventDate: new Date(eventDate),
      alertDaysBefore,
      repeatsYearly,
      category: category || null,
    };

    // Create event in database
    const event = await prisma.event.create({
      data: eventData,
    });

    logger.info(`Event created: ${event.id} by user ${req.user.id}`);
    res.status(201).json(event);

  } catch (error) {
    logger.error(`Error creating event: ${error.message}`);
    next(error);
  }
});

/**
 * GET /api/events - List all user's events
 * Requirements: 3.2, 13.1, 14.3
 */
router.get('/', async (req, res, next) => {
  try {
    // Fetch only user's events
    const events = await prisma.event.findMany({
      where: { userId: req.user.id },
      orderBy: { eventDate: 'asc' },
    });

    logger.info(`Fetched ${events.length} events for user ${req.user.id}`);
    res.status(200).json(events);

  } catch (error) {
    logger.error(`Error fetching events: ${error.message}`);
    next(error);
  }
});

/**
 * GET /api/events/:id - Get event by ID
 * Requirements: 3.3-3.4, 3.9, 13.1-13.2, 14.2
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validationService.validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Fetch event
    const event = await prisma.event.findUnique({
      where: { id },
    });

    // Check if event exists
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify ownership
    if (event.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to access event ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(event);

  } catch (error) {
    logger.error(`Error fetching event: ${error.message}`);
    next(error);
  }
});

/**
 * PUT /api/events/:id - Update event
 * Requirements: 3.5-3.6, 8.1-8.5, 13.5, 14.4
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validationService.validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Validate request body
    const validation = validationService.validateEvent(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check if event exists and verify ownership
    const existing = await prisma.event.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existing.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to update event ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, eventDate, alertDaysBefore, repeatsYearly, category } = validation.data;

    // Prepare update data
    const updateData = {
      title,
      eventDate: new Date(eventDate),
      alertDaysBefore,
      repeatsYearly,
      category: category || null,
    };

    // Update event
    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Event updated: ${id} by user ${req.user.id}`);
    res.status(200).json(updated);

  } catch (error) {
    logger.error(`Error updating event: ${error.message}`);
    next(error);
  }
});

/**
 * DELETE /api/events/:id - Delete event
 * Requirements: 3.7-3.8, 13.5, 14.5
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validationService.validateUUID(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Check if event exists and verify ownership
    const existing = await prisma.event.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existing.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to delete event ${id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete event
    await prisma.event.delete({
      where: { id },
    });

    logger.info(`Event deleted: ${id} by user ${req.user.id}`);
    res.status(204).send();

  } catch (error) {
    logger.error(`Error deleting event: ${error.message}`);
    next(error);
  }
});

module.exports = router;
