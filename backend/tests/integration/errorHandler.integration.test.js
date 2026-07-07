const express = require('express');
const request = require('supertest');
const errorHandler = require('../../src/middleware/errorHandler');
const logger = require('../../src/utils/logger');

// Mock the logger utility
jest.mock('../../src/utils/logger');

describe('Error Handler Middleware Integration', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a test Express app
    app = express();
    app.use(express.json());

    // Add a route that throws an error
    app.get('/test-error', (req, res, next) => {
      const error = new Error('Test database connection failed');
      next(error);
    });

    // Add a route that throws an error synchronously
    app.get('/test-sync-error', (req, res) => {
      throw new Error('Synchronous error occurred');
    });

    // Add error handler as last middleware
    app.use(errorHandler);
  });

  test('should catch errors passed to next() and return 500', async () => {
    const response = await request(app)
      .get('/test-error')
      .expect(500)
      .expect('Content-Type', /json/);

    expect(response.body).toEqual({
      error: 'Internal server error',
    });
  });

  test('should log error details when handling errors', async () => {
    await request(app).get('/test-error');

    expect(logger.error).toHaveBeenCalledWith('Unhandled error', 
      expect.objectContaining({
        message: 'Test database connection failed',
        method: 'GET',
        path: '/test-error',
      })
    );
  });

  test('should not expose sensitive error information in response', async () => {
    const response = await request(app).get('/test-error');

    // Verify response only contains generic error message
    expect(response.body).toEqual({
      error: 'Internal server error',
    });

    // Verify sensitive details are not in response
    expect(response.body).not.toHaveProperty('message');
    expect(response.body).not.toHaveProperty('stack');
    expect(JSON.stringify(response.body)).not.toContain('database');
  });

  test('should handle errors from multiple routes', async () => {
    // First request
    await request(app).get('/test-error').expect(500);
    
    // Second request
    await request(app).get('/test-sync-error').expect(500);

    // Verify logger was called for both errors
    expect(logger.error).toHaveBeenCalledTimes(2);
  });

  test('should set correct Content-Type header', async () => {
    const response = await request(app).get('/test-error');

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});
