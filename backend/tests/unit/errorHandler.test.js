const errorHandler = require('../../src/middleware/errorHandler');
const logger = require('../../src/utils/logger');

// Mock the logger utility
jest.mock('../../src/utils/logger');

describe('Error Handler Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request object
    mockReq = {
      method: 'POST',
      path: '/api/auth/register',
    };

    // Mock response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock next function
    mockNext = jest.fn();
  });

  test('should log error with stack trace', () => {
    const testError = new Error('Test error message');
    testError.stack = 'Error: Test error message\n    at test.js:1:1';

    errorHandler(testError, mockReq, mockRes, mockNext);

    expect(logger.error).toHaveBeenCalledWith('Unhandled error', {
      message: 'Test error message',
      stack: testError.stack,
      method: 'POST',
      path: '/api/auth/register',
    });
  });

  test('should return status 500', () => {
    const testError = new Error('Test error');

    errorHandler(testError, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('should return generic error message', () => {
    const testError = new Error('Sensitive database error with credentials');

    errorHandler(testError, mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });

  test('should not expose sensitive error details in response', () => {
    const testError = new Error('Database connection failed: password=secret123');

    errorHandler(testError, mockReq, mockRes, mockNext);

    // Verify response does not contain sensitive information
    const jsonCall = mockRes.json.mock.calls[0][0];
    expect(jsonCall.error).toBe('Internal server error');
    expect(jsonCall).not.toHaveProperty('message');
    expect(jsonCall).not.toHaveProperty('stack');
  });

  test('should handle errors with different request methods and paths', () => {
    mockReq.method = 'GET';
    mockReq.path = '/api/auth/login';
    const testError = new Error('Another error');

    errorHandler(testError, mockReq, mockRes, mockNext);

    expect(logger.error).toHaveBeenCalledWith('Unhandled error', {
      message: 'Another error',
      stack: testError.stack,
      method: 'GET',
      path: '/api/auth/login',
    });
  });

  test('should handle errors without stack trace', () => {
    const testError = new Error('Error without stack');
    delete testError.stack;

    errorHandler(testError, mockReq, mockRes, mockNext);

    expect(logger.error).toHaveBeenCalledWith('Unhandled error', {
      message: 'Error without stack',
      stack: undefined,
      method: 'POST',
      path: '/api/auth/register',
    });
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });
});
