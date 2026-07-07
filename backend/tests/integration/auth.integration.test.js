/**
 * Authentication Middleware Integration Tests
 * 
 * Tests auth middleware integration with Express routes
 */

const express = require('express');
const request = require('supertest');
const { authenticateToken } = require('../../src/middleware/auth');
const jwtService = require('../../src/services/jwt');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('../../src/services/jwt');
jest.mock('../../src/utils/logger');

describe('Authentication Middleware Integration', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a test Express app
    app = express();
    app.use(express.json());

    // Add a public route (no auth required)
    app.get('/public', (req, res) => {
      res.status(200).json({ message: 'Public endpoint' });
    });

    // Add a protected route (auth required)
    app.get('/protected', authenticateToken, (req, res) => {
      res.status(200).json({
        message: 'Protected data',
        user: req.user
      });
    });

    // Add a protected POST route
    app.post('/protected/create', authenticateToken, (req, res) => {
      res.status(201).json({
        message: 'Resource created',
        userId: req.user.id,
        data: req.body
      });
    });
  });

  describe('Public Routes', () => {
    test('should access public route without authentication', async () => {
      const response = await request(app)
        .get('/public')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        message: 'Public endpoint'
      });
    });
  });

  describe('Protected Routes with Valid Token', () => {
    test('should access protected route with valid Bearer token', async () => {
      const mockDecodedToken = {
        id: 'user-123',
        email: 'test@example.com',
      };

      jwtService.verify.mockReturnValue(mockDecodedToken);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer valid-token-abc')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        message: 'Protected data',
        user: {
          id: 'user-123',
          email: 'test@example.com'
        }
      });

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token-abc');
      expect(logger.info).toHaveBeenCalledWith('User authenticated: test@example.com');
    });

    test('should access protected POST route with valid token', async () => {
      const mockDecodedToken = {
        id: 'user-456',
        email: 'admin@example.com',
      };

      jwtService.verify.mockReturnValue(mockDecodedToken);

      const response = await request(app)
        .post('/protected/create')
        .set('Authorization', 'Bearer valid-token-xyz')
        .send({ title: 'Test Task', priority: 'high' })
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        message: 'Resource created',
        userId: 'user-456',
        data: {
          title: 'Test Task',
          priority: 'high'
        }
      });

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token-xyz');
    });

    test('should handle multiple authenticated requests', async () => {
      const mockUser1 = { id: 'user-1', email: 'user1@example.com' };
      const mockUser2 = { id: 'user-2', email: 'user2@example.com' };

      // First request
      jwtService.verify.mockReturnValueOnce(mockUser1);
      const response1 = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer token-1')
        .expect(200);

      expect(response1.body.user).toEqual(mockUser1);

      // Second request
      jwtService.verify.mockReturnValueOnce(mockUser2);
      const response2 = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer token-2')
        .expect(200);

      expect(response2.body.user).toEqual(mockUser2);
    });
  });

  describe('Protected Routes without Authentication', () => {
    test('should reject request without Authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        error: 'Authentication required'
      });

      expect(logger.warn).toHaveBeenCalledWith('Authentication attempt without Authorization header');
      expect(jwtService.verify).not.toHaveBeenCalled();
    });

    test('should reject POST request without Authorization header', async () => {
      const response = await request(app)
        .post('/protected/create')
        .send({ title: 'Test Task' })
        .expect(401);

      expect(response.body).toEqual({
        error: 'Authentication required'
      });
    });
  });

  describe('Protected Routes with Malformed Authorization', () => {
    test('should reject request with token missing Bearer prefix', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'just-a-token')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Authentication required'
      });

      expect(logger.warn).toHaveBeenCalledWith('Malformed Authorization header format');
    });

    test('should reject request with lowercase bearer', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'bearer token-123')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Authentication required'
      });
    });

    test('should reject request with empty token after Bearer', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer ')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Authentication required'
      });
    });
  });

  describe('Protected Routes with Invalid Token', () => {
    test('should reject request with invalid token', async () => {
      jwtService.verify.mockReturnValue(null);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Invalid or expired token'
      });

      expect(jwtService.verify).toHaveBeenCalledWith('invalid-token');
      expect(logger.warn).toHaveBeenCalledWith('Invalid or expired token provided');
    });

    test('should reject request with expired token', async () => {
      jwtService.verify.mockReturnValue(null);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer expired-token')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Invalid or expired token'
      });
    });

    test('should reject request when JWT service throws error', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('JWT verification error');
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer problematic-token')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Invalid or expired token'
      });

      expect(logger.error).toHaveBeenCalledWith('Authentication error: JWT verification error');
    });
  });

  describe('Error Response Format', () => {
    test('should return consistent error format for missing auth', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Authentication required');
      expect(response.body).not.toHaveProperty('message');
      expect(response.body).not.toHaveProperty('stack');
    });

    test('should return consistent error format for invalid token', async () => {
      jwtService.verify.mockReturnValue(null);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer bad-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid or expired token');
      expect(response.body).not.toHaveProperty('message');
      expect(response.body).not.toHaveProperty('stack');
    });

    test('should set correct Content-Type header', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('User Context in Route Handlers', () => {
    test('should attach user id and email to request object', async () => {
      const mockDecodedToken = {
        id: 'user-789',
        email: 'context@example.com',
      };

      jwtService.verify.mockReturnValue(mockDecodedToken);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer context-token')
        .expect(200);

      expect(response.body.user).toEqual({
        id: 'user-789',
        email: 'context@example.com'
      });
    });

    test('should preserve user context across middleware chain', async () => {
      const mockDecodedToken = {
        id: 'user-abc',
        email: 'preserve@example.com',
      };

      jwtService.verify.mockReturnValue(mockDecodedToken);

      const response = await request(app)
        .post('/protected/create')
        .set('Authorization', 'Bearer preserve-token')
        .send({ data: 'test' })
        .expect(201);

      expect(response.body.userId).toBe('user-abc');
    });
  });
});
