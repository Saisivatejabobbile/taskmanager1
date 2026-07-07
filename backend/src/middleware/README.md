# Authentication Middleware

## Overview

The authentication middleware validates JWT tokens and extracts user identity for protected routes. It enforces authentication requirements for all CRUD endpoints in the DayFlow backend API.

## Usage

```javascript
const { authenticateToken } = require('./middleware/auth');

// Apply to all routes in a router
router.use(authenticateToken);

// Or apply to specific routes
router.get('/protected', authenticateToken, (req, res) => {
  // Access user info via req.user
  const userId = req.user.id;
  const userEmail = req.user.email;
  // ...
});
```

## Features

### JWT Token Validation
- Extracts JWT token from `Authorization: Bearer <token>` header
- Validates token signature using the JWT service
- Checks token expiration
- Attaches decoded user information to `req.user`

### Error Handling
- **Missing Authorization Header**: Returns 401 with `"Authentication required"`
- **Malformed Header Format**: Returns 401 with `"Authentication required"`
- **Invalid/Expired Token**: Returns 401 with `"Invalid or expired token"`
- **Unexpected Errors**: Returns 401 with `"Invalid or expired token"` and logs error

### Security Features
- Enforces strict "Bearer <token>" format (case-sensitive)
- Validates token using existing JWT service
- Never exposes sensitive error details in responses
- Logs all authentication attempts for monitoring

## Request Flow

```
1. Client Request with Authorization header
   ↓
2. Extract token from "Bearer <token>" format
   ↓
3. Validate token with jwtService.verify()
   ↓
4. If valid: attach req.user = { id, email }
   ↓
5. Call next() to proceed to route handler
   ↓
6. Route handler accesses req.user.id and req.user.email
```

## Testing

The middleware is fully tested with:
- **18 unit tests** covering all success and error scenarios
- **17 integration tests** verifying end-to-end behavior with Express routes
- **100% test coverage** of all code paths

Run tests:
```bash
npm test -- --testPathPattern="auth"
```

## Implementation Details

### Dependencies
- `jwtService` from `../services/jwt.js` - Token verification
- `logger` from `../utils/logger.js` - Logging

### Request Object Enhancement
After successful authentication, the middleware adds:
```javascript
req.user = {
  id: string,     // User ID from token
  email: string   // User email from token
}
```

### Error Response Format
All errors return consistent JSON format:
```json
{
  "error": "Error message"
}
```

## Requirements Validation

This middleware validates the following requirements:
- **1.1, 1.2, 1.3, 1.4, 1.5**: JWT authentication enforcement
- **12.1**: Authentication middleware implementation
- **12.2**: Successful validation attaches userId to request
- **12.3**: Invalid token handling with error handler
- **12.5**: Bearer token format support
- **12.6**: Missing header handling
