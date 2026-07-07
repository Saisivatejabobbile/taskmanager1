/**
 * Authentication Middleware Unit Tests
 * 
 * Tests JWT token validation, header parsing, and error handling
 */

const { authenticateToken } = require('../../src/middleware/auth');
const jwtService = require('../../src/services/jwt');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('../../src/services/jwt');
jest.mock('../../src/utils/logger');

describe('Authentication Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request object
    mockReq = {
      headers: {},
    };

    // Mock response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock next function
    mockNext = jest.fn();
  });

  describe('Successful Authentication', () => {
    test('should authenticate valid token and attach user to request', () => {
      const mockDecodedToken = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockReq.headers.authorization = 'Bearer valid-token-123';
      jwtService.verify.mockReturnValue(mockDecodedToken);

      authenticateToken(mockReq, mockRes, mockNext);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token-123');
      expect(mockReq.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
      });
      expect(logger.info).toHaveBeenCalledWith('User authenticated: test@example.com');
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should handle token with extra payload fields', () => {
      const mockDecodedToken = {
        id: 'user-456',
        email: 'admin@example.com',
        role: 'admin',
        exp: 1234567890,
      };

      mockReq.headers.authorization = 'Bearer token-with-extra-fields';
      jwtService.verify.mockReturnValue(mockDecodedToken);

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual({
        id: 'user-456',
        email: 'admin@example.com',
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Missing Authorization Header', () => {
    test('should return 401 when Authorization header is missing', () => {
      authenticateToken(mockReq, mockRes, mockNext);

      expect(logger.warn).toHaveBeenCalledWith('Authentication attempt without Authorization header');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 when Authorization header is undefined', () => {
      mockReq.headers.authorization = undefined;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
    });

    test('should return 401 when Authorization header is empty string', () => {
      mockReq.headers.authorization = '';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
    });
  });

  describe('Malformed Authorization Header', () => {
    test('should return 401 when Bearer keyword is missing', () => {
      mockReq.headers.authorization = 'token-without-bearer';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(logger.warn).toHaveBeenCalledWith('Malformed Authorization header format');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 when Bearer is lowercase', () => {
      mockReq.headers.authorization = 'bearer token-123';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
    });

    test('should return 401 when token is missing after Bearer', () => {
      mockReq.headers.authorization = 'Bearer';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
    });

    test('should return 401 when Authorization has extra parts', () => {
      mockReq.headers.authorization = 'Bearer token-123 extra-part';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
    });

    test('should return 401 when Authorization header is only spaces', () => {
      mockReq.headers.authorization = '   ';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
      });
    });
  });

  describe('Invalid or Expired Token', () => {
    test('should return 401 when token verification returns null', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      jwtService.verify.mockReturnValue(null);

      authenticateToken(mockReq, mockRes, mockNext);

      expect(jwtService.verify).toHaveBeenCalledWith('invalid-token');
      expect(logger.warn).toHaveBeenCalledWith('Invalid or expired token provided');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 when token signature is invalid', () => {
      mockReq.headers.authorization = 'Bearer tampered-token';
      jwtService.verify.mockReturnValue(null);

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
    });

    test('should return 401 when token is expired', () => {
      mockReq.headers.authorization = 'Bearer expired-token';
      jwtService.verify.mockReturnValue(null); // verify returns null for expired tokens

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle JWT service throwing an error', () => {
      mockReq.headers.authorization = 'Bearer problematic-token';
      jwtService.verify.mockImplementation(() => {
        throw new Error('JWT verification failed');
      });

      authenticateToken(mockReq, mockRes, mockNext);

      expect(logger.error).toHaveBeenCalledWith('Authentication error: JWT verification failed');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle decoded token missing id field', () => {
      mockReq.headers.authorization = 'Bearer token-without-id';
      jwtService.verify.mockReturnValue({
        email: 'test@example.com',
      });

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual({
        id: undefined,
        email: 'test@example.com',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle decoded token missing email field', () => {
      mockReq.headers.authorization = 'Bearer token-without-email';
      jwtService.verify.mockReturnValue({
        id: 'user-789',
      });

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual({
        id: 'user-789',
        email: undefined,
      });
      expect(mockNext).toHaveBeenCalled();
    });

    test('should not expose sensitive error details', () => {
      mockReq.headers.authorization = 'Bearer error-token';
      jwtService.verify.mockImplementation(() => {
        throw new Error('Database connection string: postgres://user:password@host/db');
      });

      authenticateToken(mockReq, mockRes, mockNext);

      const jsonCall = mockRes.json.mock.calls[0][0];
      expect(jsonCall.error).toBe('Invalid or expired token');
      expect(jsonCall.error).not.toContain('password');
      expect(jsonCall.error).not.toContain('Database');
    });

    test('should handle token with special characters', () => {
      const specialToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.signature';
      const mockDecodedToken = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockReq.headers.authorization = `Bearer ${specialToken}`;
      jwtService.verify.mockReturnValue(mockDecodedToken);

      authenticateToken(mockReq, mockRes, mockNext);

      expect(jwtService.verify).toHaveBeenCalledWith(specialToken);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
