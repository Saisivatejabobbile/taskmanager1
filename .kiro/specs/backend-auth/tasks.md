# Implementation Plan: Backend Authentication System

## Overview

This implementation plan provides step-by-step coding tasks to build the DayFlow backend authentication system using Node.js with Express, Prisma ORM, and PostgreSQL. The system provides secure user registration, login, and JWT-based session management with bcrypt password hashing.

**Implementation Language:** JavaScript (Node.js)

**Key Technologies:**
- Express.js for HTTP server
- Prisma ORM for database access
- PostgreSQL for data persistence
- bcrypt for password hashing
- jsonwebtoken for JWT operations
- fast-check for property-based testing

## Tasks

### 1. Project Setup and Configuration

- [x] 1.1 Initialize Node.js project and install dependencies
  - Create `package.json` with npm init
  - Install production dependencies: express, @prisma/client, bcrypt, jsonwebtoken, dotenv, cors
  - Install dev dependencies: prisma, nodemon, jest, fast-check
  - Configure npm scripts: start, dev, migrate, test
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_

- [x] 1.2 Create project structure and configuration files
  - Create directory structure: src/, src/routes/, src/services/, src/middleware/, src/config/, src/utils/, prisma/, tests/unit/, tests/integration/
  - Create .gitignore file (exclude node_modules, .env, .prisma)
  - Create .env.example with DATABASE_URL, JWT_SECRET, PORT, NODE_ENV
  - Create README.md with setup instructions
  - _Requirements: 13.9, 13.10, 14.2, 14.3_

### 2. Database Schema and Configuration

- [x] 2.1 Define Prisma schema and User model
  - Create `prisma/schema.prisma` file
  - Configure PostgreSQL provider and DATABASE_URL
  - Define User model with fields: id (UUID), email (unique), name, password, avatarUrl (optional), createdAt, updatedAt
  - Add email index for efficient lookups
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [x] 2.2 Create Prisma client configuration
  - Create `src/config/database.js` with Prisma client singleton
  - Configure logging and error formatting
  - Export prisma instance for use in services
  - _Requirements: 1.4, 1.6_

- [ ] 2.3 Run initial database migration
  - Run `npx prisma migrate dev --name init` to create initial migration
  - Run `npx prisma generate` to generate Prisma Client
  - Verify User table created in PostgreSQL
  - _Requirements: 14.5_

### 3. Service Layer - Password Security

- [x] 3.1 Implement Password Service
  - Create `src/services/password.js`
  - Implement `hash(password)` function using bcrypt with 10 salt rounds
  - Implement `verify(password, hash)` function using bcrypt.compare
  - Add error handling for bcrypt operations
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ]* 3.2 Write property test for Password Service
  - **Property 2: Password hash uniqueness**
  - **Property 3: Password verification round-trip**
  - **Validates: Requirements 2.8, 5.1, 5.2, 5.4, 3.6, 5.5, 5.6**
  - Use fast-check to generate random passwords (min 8 chars)
  - Verify hash(password) produces different outputs each time
  - Verify verify(password, hash(password)) returns true
  - Verify verify(differentPassword, hash(password)) returns false
  - Configure minimum 100 iterations
  - Tag: "Feature: backend-auth, Property 2 & 3"

- [ ]* 3.3 Write unit tests for Password Service
  - Test hash() with various password inputs
  - Test verify() with correct and incorrect passwords
  - Test error handling for invalid inputs
  - _Requirements: 5.1, 5.5, 5.6_

### 4. Service Layer - JWT Token Management

- [x] 4.1 Implement JWT Service
  - Create `src/services/jwt.js`
  - Implement `sign(payload)` function using HS256 algorithm
  - Include id, email in payload with 7-day expiration (604800 seconds)
  - Implement `verify(token)` function to decode and validate tokens
  - Load JWT_SECRET from environment, throw error if missing
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ]* 4.2 Write property test for JWT Service
  - **Property 4: JWT token round-trip preservation**
  - **Validates: Requirements 2.10, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 4.7**
  - Use fast-check to generate random UUIDs and emails
  - Verify sign(payload) produces valid JWT string
  - Verify verify(sign(payload)) returns original id and email
  - Verify exp - iat equals 604800 seconds (7 days)
  - Configure minimum 100 iterations
  - Tag: "Feature: backend-auth, Property 4"

- [ ]* 4.3 Write unit tests for JWT Service
  - Test token generation with various payloads
  - Test token verification with valid/invalid tokens
  - Test expiration handling
  - Test missing JWT_SECRET throws error
  - _Requirements: 4.1, 4.6, 4.7_

### 5. Service Layer - Input Validation

- [x] 5.1 Implement Validation Service
  - Create `src/services/validation.js`
  - Implement `validateEmail(email)` using RFC 5322 regex pattern
  - Implement `validatePassword(password)` checking min 8 characters
  - Implement `validateName(name)` checking non-empty after trim
  - Implement `validateRegistration(data)` combining all validations
  - Implement `validateLogin(data)` for email and password
  - Return { valid: boolean, error?: string } format
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [ ]* 5.2 Write property test for Validation Service
  - **Property 1: Email validation correctness**
  - **Validates: Requirements 2.4, 3.4, 6.1, 6.2**
  - Use fast-check to generate various string inputs
  - Test with leading/trailing whitespace (should trim)
  - Test with empty strings (should reject)
  - Test with special characters and multiple @ symbols
  - Test with valid email formats (should accept)
  - Configure minimum 100 iterations
  - Tag: "Feature: backend-auth, Property 1"

- [ ]* 5.3 Write unit tests for Validation Service
  - Test validateEmail with valid/invalid formats
  - Test validatePassword with various lengths
  - Test validateName with whitespace/empty strings
  - Test validateRegistration with complete request data
  - Test validateLogin with complete request data
  - _Requirements: 6.1, 6.6, 6.7_

### 6. Middleware Implementation

- [x] 6.1 Implement logging utilities
  - Create `src/utils/logger.js`
  - Implement structured logging functions: info(), warn(), error()
  - Include timestamp, log level, and message in format
  - _Requirements: 8.4, 8.5, 8.8_

- [x] 6.2 Implement request logger middleware
  - Create `src/middleware/logger.js`
  - Log incoming requests with method, path, timestamp
  - Log outgoing responses with status code and response time
  - Use logger utility from src/utils/logger.js
  - _Requirements: 1.7, 8.4, 8.5_

- [x] 6.3 Implement error handler middleware
  - Create `src/middleware/errorHandler.js`
  - Catch unhandled errors and log stack traces
  - Return status 500 with generic error message "Internal server error"
  - Never expose database errors or sensitive information to client
  - _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7_

### 7. Authentication Routes Implementation

- [x] 7.1 Implement registration endpoint
  - Create `src/routes/auth.js`
  - Define POST /api/auth/register endpoint
  - Validate request body using Validation Service
  - Check if email already exists in database
  - Hash password using Password Service
  - Create user in database using Prisma
  - Generate JWT token using JWT Service
  - Return 201 with user object (id, name, email) and token
  - Handle errors: 400 (validation), 409 (duplicate email), 500 (server error)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 9.1, 9.3, 9.4, 9.5, 9.7_

- [ ]* 7.2 Write integration tests for registration endpoint
  - Test successful registration with valid data
  - Test duplicate email returns 409
  - Test missing fields return 400 with appropriate messages
  - Test invalid email format returns 400
  - Test password too short returns 400
  - Test user data persists in database
  - Test password is hashed (not plaintext)
  - Test token is valid JWT
  - _Requirements: 2.1-2.12_

- [x] 7.3 Implement login endpoint
  - Add POST /api/auth/login endpoint to `src/routes/auth.js`
  - Validate request body using Validation Service
  - Find user by email in database
  - Verify password using Password Service
  - Return 401 "Invalid credentials" for both non-existent email and wrong password
  - Generate JWT token using JWT Service
  - Return 200 with user object (id, name, email, avatarUrl) and token
  - Handle errors: 400 (validation), 401 (invalid credentials), 500 (server error)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ]* 7.4 Write integration tests for login endpoint
  - Test successful login with correct credentials
  - Test login with wrong password returns 401
  - Test login with non-existent email returns 401
  - Test missing fields return 400 with appropriate messages
  - Test token is valid JWT
  - Test avatarUrl is included in response (null if not set)
  - _Requirements: 3.1-3.10_

- [x] 7.5 Implement health check endpoint
  - Add GET /health endpoint to `src/routes/auth.js`
  - Return status 200 with { status: "ok", timestamp: ISO8601 }
  - _Requirements: 1.8_

### 8. Express Server Setup

- [x] 8.1 Implement Express application initialization
  - Create `src/index.js`
  - Initialize Express app
  - Load environment variables using dotenv
  - Configure CORS middleware (allow all origins in dev, whitelist in production)
  - Configure JSON body parser with 10mb limit
  - Add request logger middleware
  - Mount auth routes at /api/auth
  - Add error handler middleware (must be last)
  - _Requirements: 1.1, 1.2, 1.3, 1.7, 10.1, 10.2, 10.3, 10.4, 10.7, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 8.2 Implement server startup and database connection
  - Initialize Prisma database connection on startup
  - Log successful connection and listening port
  - Handle Prisma connection failures (log error and exit with non-zero status)
  - Start HTTP server on configured PORT (default 3000)
  - Log environment (development/production)
  - _Requirements: 1.1, 1.4, 1.5, 1.6, 10.3, 10.4_

- [x] 8.3 Implement environment variable validation
  - Check for required variables: DATABASE_URL, JWT_SECRET
  - Throw error if JWT_SECRET missing in production
  - Throw error if DATABASE_URL missing
  - Do not log sensitive values (JWT_SECRET, DATABASE_URL)
  - _Requirements: 10.1, 10.2, 10.5, 10.6, 10.8_

- [x] 8.4 Implement graceful shutdown
  - Handle SIGTERM and SIGINT signals
  - Disconnect Prisma client on shutdown
  - Close HTTP server gracefully
  - Log shutdown event

### 9. Checkpoint - Verify Core Functionality

- [ ] 9.1 Manual testing and verification
  - Ensure all tests pass (unit and integration)
  - Start server with `npm run dev`
  - Test registration endpoint with curl or Postman
  - Test login endpoint with valid credentials
  - Test health check endpoint
  - Verify database contains user records
  - Verify passwords are hashed in database
  - Verify JWT tokens can be decoded
  - Ask the user if questions arise

### 10. Documentation and Deployment Preparation

- [ ] 10.1 Complete README documentation
  - Add API endpoint documentation with request/response examples
  - Add setup instructions (npm install, environment variables, migrations)
  - Add development instructions (npm run dev)
  - Add testing instructions (npm test)
  - Document minimum Node.js version requirement (v18+)
  - Add troubleshooting section
  - _Requirements: 14.2, 14.4, 14.5, 14.7_

- [ ] 10.2 Finalize configuration files
  - Review and update .env.example with all required variables
  - Ensure .gitignore excludes sensitive files
  - Add comments to schema.prisma explaining model fields
  - _Requirements: 14.3_

- [ ] 10.3 Final checkpoint - Production readiness
  - Run full test suite with `npm test`
  - Verify all property-based tests pass (100+ iterations each)
  - Check code for hardcoded secrets or credentials
  - Verify CORS configuration for production
  - Ensure error handling doesn't expose sensitive information
  - Test with production-like PostgreSQL database
  - Ask the user if questions arise

## Implementation Notes

### Property-Based Testing

This authentication system includes 4 property-based tests using fast-check:

1. **Property 1**: Email validation correctness across various string inputs
2. **Property 2**: Password hash uniqueness (same password produces different hashes)
3. **Property 3**: Password verification round-trip (hash → verify preserves correctness)
4. **Property 4**: JWT token round-trip (sign → verify preserves payload data)

All property tests are marked as optional sub-tasks (postfixed with `*`) and can be skipped for faster MVP delivery. However, they provide strong correctness guarantees for security-critical operations.

### Testing Strategy

- **Unit tests**: Test individual services (password, jwt, validation) in isolation
- **Integration tests**: Test API endpoints with database operations
- **Property tests**: Test universal properties across wide input spaces

### Security Considerations

- Never log passwords, JWT secrets, or sensitive data
- Return generic error messages for authentication failures
- Use HTTPS in production
- Store JWT_SECRET securely (AWS Secrets Manager, etc.)
- Rotate JWT_SECRET periodically in production

### Task Dependencies

- Tasks must be completed in order within each section
- Section 2 (Database) must be completed before Section 7 (Routes)
- Section 3, 4, 5 (Services) must be completed before Section 7 (Routes)
- Section 6 (Middleware) must be completed before Section 8 (Server)

### Code Examples Language

All code examples and implementations should use **JavaScript (Node.js)** with:
- ES6+ syntax (async/await, arrow functions, const/let)
- CommonJS modules (require/module.exports) for Node.js compatibility
- JSDoc comments for function documentation
- Consistent error handling with try/catch

## Requirements Traceability

Every task references specific requirements from requirements.md to ensure complete coverage. All 14 requirements (covering 125+ acceptance criteria) are mapped to implementation tasks.

