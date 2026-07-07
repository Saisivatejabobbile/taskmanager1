/**
 * Authentication routes
 * Handles user registration, login, and health check endpoints
 * 
 * Requirements: 2.1-2.12, 3.1-3.10, 9.1-9.7
 */

const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const passwordService = require('../services/password');
const jwtService = require('../services/jwt');
const validationService = require('../services/validation');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Create a new user account
 * 
 * Requirements: 2.1-2.12
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    const validation = validationService.validateRegistration({ name, email, password });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await passwordService.hash(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwtService.sign({
      id: user.id,
      email: user.email
    });

    logger.info(`User registered successfully: ${user.email}`);

    // Return user and token (exclude password)
    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * 
 * Requirements: 3.1-3.10
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validation = validationService.validateLogin({ email, password });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    // Verify password (return same error for security)
    if (!user || !(await passwordService.verify(password, user.password))) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwtService.sign({
      id: user.id,
      email: user.email
    });

    logger.info(`User logged in successfully: ${user.email}`);

    // Return user and token (exclude password)
    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || null
      },
      token
    });

  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
});

/**
 * GET /health
 * Health check endpoint
 * 
 * Requirements: 1.8
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
