# Design Document: Backend Authentication System

## Overview

This document specifies the design for the DayFlow backend authentication system, which provides secure user registration, login, and JWT-based session management. The system is built using Node.js with Express framework, Prisma ORM for database access, and PostgreSQL for data persistence.

### Purpose

The authentication system serves as the foundation for Track B (Backend) development, enabling:
- Secure user account creation and management
- Stateless session management via JWT tokens
- Password security through bcrypt hashing
- Input validation and error handling
- Foundation for protected API endpoints in subsequent tasks (B2, B3, B4)

### Scope

**In Scope:**
- User registration with name, email, and password
- User login with email and password
- JWT token generation and signing
- Password hashing with bcrypt
- Input validation for all fields
- Database persistence via Prisma + PostgreSQL
- CORS configuration for mobile client
- Health check endpoint
- Error handling and logging

**Out of Scope:**
- Password reset functionality
- Email verification
- Refresh tokens
- OAuth/social login
- Multi-factor authentication
- Rate limiting
- Account lockout mechanisms

### Key Design Decisions

1. **JWT for Session Management**: Stateless authentication using JWT tokens eliminates need for session storage and scales horizontally
2. **bcrypt with 10 Salt Rounds**: Industry-standard password hashing with balanced security/performance trade-off
3. **Prisma ORM**: Type-safe database queries with automatic migrations and schema management
4. **Express Middleware Pattern**: Modular request handling with clear separation of concerns
5. **Service Layer Architecture**: Business logic isolated in services for testability and reusability
6. **UUID for User IDs**: Universally unique identifiers prevent enumeration attacks
7. **7-Day JWT Expiration**: Balance between user convenience and security for mobile app context

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Mobile Client                          │
│                   (React Native - Expo)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         │ JSON (camelCase)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Express HTTP Server                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Middleware Stack                         │  │
│  │  • CORS                                               │  │
│  │  • JSON Body Parser (10mb limit)                     │  │
│  │  • Request Logger                                     │  │
│  │  • Error Handler                                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Route Layer                              │  │
│  │  • POST /api/auth/register                           │  │
│  │  • POST /api/auth/login                              │  │
│  │  • GET /health                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Service Layer                            │  │
│  │  • Validation Service                                 │  │
│  │  • Password Service (bcrypt)                         │  │
│  │  • JWT Service                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Data Access Layer (Prisma Client)            │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  Tables: User (id, email, name, password, avatarUrl, ...)  │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

#### Registration Flow
```
Client → POST /api/auth/register
  ↓
Middleware: Parse JSON body
  ↓
Validation Service: Validate name, email, password
  ↓
User Repository: Check if email exists
  ↓
Password Service: Hash password with bcrypt (10 rounds)
  ↓
User Repository: Create user in database
  ↓
JWT Service: Generate token (7-day expiration)
  ↓
Response: { user: {...}, token: "..." }
```

#### Login Flow
```
Client → POST /api/auth/login
  ↓
Middleware: Parse JSON body
  ↓
Validation Service: Validate email, password
  ↓
User Repository: Find user by email
  ↓
Password Service: Verify password against hash
  ↓
JWT Service: Generate token (7-day expiration)
  ↓
Response: { user: {...}, token: "..." }
```

### Layered Architecture

**Layer 1 - HTTP Layer (Express)**
- Handles HTTP requests/responses
- Middleware configuration
- CORS and body parsing
- Request logging

**Layer 2 - Route Layer**
- Maps HTTP endpoints to handlers
- Request/response formatting
- Delegates to services

**Layer 3 - Service Layer**
- Business logic and validation
- JWT operations
- Password hashing/verification
- Reusable across routes

**Layer 4 - Data Access Layer (Prisma)**
- Database queries and mutations
- Transaction management
- Schema validation

**Layer 5 - Data Layer (PostgreSQL)**
- Data persistence
- Constraints and indexes
- Relational integrity

---

## Components and Interfaces

### 1. Express Server (`src/index.js`)

**Responsibilities:**
- Initialize Express application
- Configure middleware stack
- Mount route handlers
- Initialize Prisma connection
- Start HTTP server
- Handle graceful shutdown

**Configuration:**
```javascript
{
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS 
      : '*',
    credentials: true
  },
  bodyParser: {
    limit: '10mb'
  }
}
```

### 2. Authentication Routes (`src/routes/auth.js`)

**Endpoints:**

#### POST /api/auth/register
```
Request:
{
  "name": string (required, non-empty),
  "email": string (required, valid email format),
  "password": string (required, min 8 chars)
}

Success Response (201):
{
  "user": {
    "id": string (UUID),
    "name": string,
    "email": string
  },
  "token": string (JWT)
}

Error Responses:
400 - Validation error
409 - Email already registered
500 - Server error
```

#### POST /api/auth/login
```
Request:
{
  "email": string (required, valid email format),
  "password": string (required)
}

Success Response (200):
{
  "user": {
    "id": string (UUID),
    "name": string,
    "email": string,
    "avatarUrl": string | null
  },
  "token": string (JWT)
}

Error Responses:
400 - Validation error
401 - Invalid credentials
500 - Server error
```

#### GET /health
```
Success Response (200):
{
  "status": "ok",
  "timestamp": string (ISO 8601)
}
```

### 3. Validation Service (`src/services/validation.js`)

**Interface:**
```javascript
class ValidationService {
  // Validate email format (RFC 5322 compliant)
  validateEmail(email: string): { valid: boolean, error?: string }
  
  // Validate password requirements
  validatePassword(password: string): { valid: boolean, error?: string }
  
  // Validate name field
  validateName(name: string): { valid: boolean, error?: string }
  
  // Validate registration request
  validateRegistration(data: object): { valid: boolean, errors?: object }
  
  // Validate login request
  validateLogin(data: object): { valid: boolean, errors?: object }
}
```

**Validation Rules:**
- Email: RFC 5322 regex pattern, trimmed, required
- Password: String type, min 8 characters, required
- Name: String type, non-empty after trim, required

### 4. Password Service (`src/services/password.js`)

**Interface:**
```javascript
class PasswordService {
  // Hash a plaintext password
  async hash(password: string): Promise<string>
  
  // Verify plaintext against hash
  async verify(password: string, hash: string): Promise<boolean>
}
```

**Implementation Details:**
- Algorithm: bcrypt
- Salt Rounds: 10
- Hash format: bcrypt standard ($2a$10$...)
- Async operations (CPU-intensive)

### 5. JWT Service (`src/services/jwt.js`)

**Interface:**
```javascript
class JWTService {
  // Generate signed JWT token
  sign(payload: object): string
  
  // Verify and decode JWT token
  verify(token: string): object | null
}
```

**Token Structure:**
```javascript
{
  id: string,        // User UUID
  email: string,     // User email
  iat: number,       // Issued at (Unix timestamp)
  exp: number        // Expiration (Unix timestamp, 7 days)
}
```

**Configuration:**
- Algorithm: HS256 (HMAC-SHA256)
- Secret: process.env.JWT_SECRET (required)
- Expiration: 7 days (604800 seconds)

### 6. Prisma Client (`src/config/database.js`)

**Interface:**
```javascript
// Singleton Prisma Client instance
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty'
})

// User operations
prisma.user.create(data)
prisma.user.findUnique({ where: { email } })
prisma.user.findUnique({ where: { id } })
```

**Connection Management:**
- Single instance per application
- Automatic connection pooling
- Graceful disconnect on shutdown

### 7. Error Handler Middleware (`src/middleware/errorHandler.js`)

**Interface:**
```javascript
function errorHandler(err, req, res, next) {
  // Log error with stack trace
  // Return appropriate error response
  // Never expose sensitive information
}
```

**Error Response Format:**
```javascript
{
  "error": string  // User-friendly error message
}
```

### 8. Request Logger Middleware (`src/middleware/logger.js`)

**Interface:**
```javascript
function requestLogger(req, res, next) {
  // Log: timestamp, method, path, IP
  // Log: response status, response time
}
```

**Log Format:**
```
[2025-01-07T10:30:15.123Z] INFO POST /api/auth/register - 201 - 145ms
[2025-01-07T10:30:16.456Z] ERROR POST /api/auth/login - 401 - 52ms
```

---

## Data Models

### User Model (Prisma Schema)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String   // bcrypt hash
  avatarUrl String?  // Optional profile picture URL
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@map("users")
}
```

**Field Specifications:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (UUID) | Primary Key, Auto-generated | Unique user identifier |
| email | String | Unique, Required, Indexed | User email address |
| name | String | Required | User display name |
| password | String | Required | bcrypt hashed password |
| avatarUrl | String | Optional, Nullable | Profile picture URL |
| createdAt | DateTime | Auto-set on creation | Account creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

**Database Indexes:**
- Primary: `id` (auto-created)
- Unique: `email` (for login lookups)
- Standard: `email` (for query optimization)

### JWT Token Payload

```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",  // User UUID
  email: "user@example.com",                    // User email
  iat: 1704628800,                              // Issued at (Unix timestamp)
  exp: 1705233600                               // Expires at (Unix timestamp)
}
```

### API Response Models

**User Response Object:**
```javascript
{
  id: string,           // UUID
  name: string,         // Display name
  email: string,        // Email address
  avatarUrl: string | null  // Optional avatar URL
}
```

**Registration Success Response:**
```javascript
{
  user: {
    id: string,
    name: string,
    email: string
  },
  token: string  // JWT token
}
```

**Login Success Response:**
```javascript
{
  user: {
    id: string,
    name: string,
    email: string,
    avatarUrl: string | null
  },
  token: string  // JWT token
}
```

**Error Response:**
```javascript
{
  error: string  // User-friendly error message
}
```

---

## Error Handling

### Error Categories

**1. Validation Errors (400 Bad Request)**
- Missing required fields
- Invalid email format
- Password too short
- Invalid data types

**2. Authentication Errors (401 Unauthorized)**
- Invalid credentials (wrong email or password)
- Email not found

**3. Conflict Errors (409 Conflict)**
- Email already registered

**4. Server Errors (500 Internal Server Error)**
- Database connection failures
- Bcrypt hashing errors
- Unexpected exceptions

### Error Handling Strategy

**Validation Errors:**
```javascript
// Early validation in route handlers
const validation = validationService.validateRegistration(req.body)
if (!validation.valid) {
  return res.status(400).json({ error: validation.error })
}
```

**Authentication Errors:**
```javascript
// Consistent error message for security
if (!user || !await passwordService.verify(password, user.password)) {
  return res.status(401).json({ error: 'Invalid credentials' })
}
```

**Database Errors:**
```javascript
try {
  await prisma.user.create({ data: userData })
} catch (error) {
  logger.error('Database error:', error)
  return res.status(500).json({ error: 'Registration failed' })
}
```

**Global Error Handler:**
```javascript
app.use((err, req, res, next) => {
  logger.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack
  })
  
  res.status(500).json({ error: 'Internal server error' })
})
```

### Error Logging

**Log Levels:**
- **INFO**: Successful requests, server startup
- **WARN**: Validation failures, authentication failures
- **ERROR**: Database errors, unexpected exceptions

**Log Format:**
```javascript
{
  timestamp: ISO 8601 string,
  level: 'INFO' | 'WARN' | 'ERROR',
  message: string,
  context: {
    method: string,
    path: string,
    statusCode: number,
    responseTime: number (ms),
    error: string (if applicable)
  }
}
```

**Security Considerations:**
- Never log passwords or JWT secrets
- Never expose database error details to client
- Use generic messages for authentication failures
- Log stack traces only on server side

---

## Testing Strategy

### Testing Approach

This authentication system requires both property-based testing and integration testing to ensure correctness and security.

### Property-Based Testing

Property-based testing (PBT) is **highly appropriate** for this authentication system because:
- JWT operations are pure functions with clear input/output
- Password hashing has universal properties (non-reversibility, uniqueness)
- Validation logic has universal rules across all inputs
- Email format validation has deterministic patterns

**Property-Based Test Library:**
- Use **fast-check** for JavaScript/Node.js property-based testing
- Configure minimum 100 iterations per property test
- Tag each test with feature name and property reference

### Unit Tests

**Password Service:**
- Test bcrypt hashing with various password inputs
- Test password verification with correct/incorrect passwords
- Test error handling for invalid inputs

**JWT Service:**
- Test token generation with various payloads
- Test token verification with valid/invalid tokens
- Test expiration handling

**Validation Service:**
- Test email validation with valid/invalid formats
- Test password validation with various lengths
- Test name validation with whitespace/empty strings

### Integration Tests

**Registration Endpoint:**
- Test successful registration with valid data
- Test duplicate email returns 409
- Test missing fields return 400
- Test invalid email format returns 400
- Test password too short returns 400

**Login Endpoint:**
- Test successful login with correct credentials
- Test login with incorrect password returns 401
- Test login with non-existent email returns 401
- Test missing fields return 400

**Database Integration:**
- Test user creation persists data correctly
- Test email uniqueness constraint is enforced
- Test timestamps are set correctly

### Error Condition Tests

- Test database connection failure handling
- Test missing environment variables prevent startup
- Test invalid JWT secret throws error
- Test all validation error paths

### Security Testing

- Verify passwords are never stored in plaintext
- Verify passwords are never included in responses
- Verify JWT tokens expire after 7 days
- Verify bcrypt salt rounds are configured correctly

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This authentication system is well-suited for property-based testing because it contains pure functions with clear input/output behavior (JWT signing/verification, password hashing/verification, email validation) and universal properties that should hold across wide input spaces.

### Property 1: Email Validation Correctness

*For any* string input, the validation service SHALL correctly identify whether it matches RFC 5322 email format, and SHALL handle edge cases including:
- Strings with leading/trailing whitespace (should trim before validation)
- Empty strings (should reject)
- Strings with special characters
- Strings with multiple @ symbols
- Valid email formats (should accept)

**Validates: Requirements 2.4, 3.4, 6.1, 6.2**

### Property 2: Password Hash Uniqueness

*For any* password string, hashing it multiple times SHALL produce different hash strings on each invocation due to bcrypt's random salt generation, ensuring that identical passwords in the database cannot be identified by comparing hashes.

**Validates: Requirements 2.8, 5.1, 5.2, 5.4**

### Property 3: Password Verification Round-Trip

*For any* password string, the following SHALL hold:
1. `hash(password)` produces a valid bcrypt hash
2. `verify(password, hash(password))` returns `true`
3. `verify(differentPassword, hash(password))` returns `false`

This round-trip property ensures password hashing and verification are inverse operations for correct passwords.

**Validates: Requirements 3.6, 5.5, 5.6**

### Property 4: JWT Token Round-Trip Preservation

*For any* valid user payload containing `id` (UUID string) and `email` (valid email string), the following SHALL hold:
1. `sign(payload)` produces a valid JWT string
2. `verify(sign(payload))` returns a payload object
3. The returned payload contains the original `id` and `email` values
4. The returned payload contains `iat` and `exp` timestamps
5. `exp - iat` equals 7 days in seconds (604800)

This round-trip property ensures JWT signing and verification preserve user data integrity.

**Validates: Requirements 2.10, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 4.7**

---

## Security Considerations

### Password Security

**Hashing Algorithm:**
- bcrypt with 10 salt rounds provides strong protection against brute-force attacks
- Each password hash includes a random salt, preventing rainbow table attacks
- Passwords are never stored in plaintext or reversible encryption

**Password Requirements:**
- Minimum 8 characters (enforced at validation layer)
- No maximum length (bcrypt handles truncation internally)
- No complexity requirements in this initial implementation (future enhancement)

**Timing Attack Mitigation:**
- Use bcrypt's constant-time comparison for password verification
- Return identical error messages for "user not found" and "wrong password"

### JWT Token Security

**Token Signing:**
- HS256 (HMAC-SHA256) algorithm with secret key
- Secret key must be cryptographically random (min 256 bits)
- Secret key stored in environment variable, never committed to code

**Token Expiration:**
- 7-day expiration balances security and user experience
- Client must handle token expiration and re-authentication
- No refresh token mechanism (future enhancement)

**Token Storage (Client Responsibility):**
- Mobile client should store token in secure storage (Expo SecureStore)
- Token transmitted over HTTPS only
- Token should be included in Authorization header: `Bearer <token>`

### Input Validation Security

**Injection Prevention:**
- All inputs validated and sanitized before processing
- Prisma ORM provides parameterized queries (prevents SQL injection)
- Email validation prevents header injection
- No eval() or dynamic code execution

**Data Sanitization:**
- Trim whitespace from name and email
- Validate data types before processing
- Reject unexpected fields (explicit field whitelisting)

### Error Handling Security

**Information Disclosure Prevention:**
- Generic error messages for authentication failures
- Never expose database error details to client
- Never indicate whether email exists during login
- Log sensitive errors server-side only

**Error Response Examples:**
```
❌ Bad: "User with email user@example.com not found"
✅ Good: "Invalid credentials"

❌ Bad: "Database connection to postgres://user:pass@host failed"
✅ Good: "Registration failed"
```

### CORS Security

**Development Mode:**
- Accept all origins (*) for local development
- Allow credentials for cookie/header support

**Production Mode:**
- Whitelist specific origins from ALLOWED_ORIGINS environment variable
- Reject requests from unknown origins
- Validate Origin header

### Environment Variables

**Required Secrets:**
- `JWT_SECRET`: Min 32 characters, cryptographically random
- `DATABASE_URL`: Contains database credentials

**Security Practices:**
- Never commit .env files to version control
- Use different secrets for dev/staging/production
- Rotate JWT_SECRET periodically (invalidates all tokens)
- Use secret management service in production (AWS Secrets Manager, etc.)

---

## Project Structure and File Organization

```
backend-auth/
├── .env.example              # Example environment variables (no values)
├── .gitignore                # Excludes node_modules, .env, .prisma
├── package.json              # Dependencies and scripts
├── README.md                 # Setup instructions and API docs
├── prisma/
│   ├── schema.prisma         # Database schema definition
│   └── migrations/           # Database migration files
├── src/
│   ├── index.js              # Application entry point
│   ├── config/
│   │   └── database.js       # Prisma client singleton
│   ├── middleware/
│   │   ├── errorHandler.js   # Global error handler
│   │   └── logger.js         # Request/response logger
│   ├── routes/
│   │   └── auth.js           # Authentication endpoints
│   ├── services/
│   │   ├── jwt.js            # JWT signing/verification
│   │   ├── password.js       # Password hashing/verification
│   │   └── validation.js     # Input validation
│   └── utils/
│       └── logger.js         # Logging utility functions
└── tests/
    ├── unit/
    │   ├── jwt.test.js       # JWT service unit tests
    │   ├── password.test.js  # Password service unit tests
    │   └── validation.test.js # Validation service unit tests
    └── integration/
        ├── register.test.js  # Registration endpoint tests
        └── login.test.js     # Login endpoint tests
```

### File Responsibilities

**`src/index.js`** - Application Entry Point
- Initialize Express app
- Configure middleware (CORS, body-parser, logger, error handler)
- Mount routes
- Initialize Prisma connection
- Start HTTP server
- Handle graceful shutdown

**`src/config/database.js`** - Database Configuration
- Export singleton Prisma Client instance
- Configure connection logging
- Handle connection errors

**`src/routes/auth.js`** - Authentication Routes
- Define POST /api/auth/register endpoint
- Define POST /api/auth/login endpoint
- Define GET /health endpoint
- Handle request/response formatting
- Delegate business logic to services

**`src/services/jwt.js`** - JWT Service
- `sign(payload)`: Generate signed JWT token
- `verify(token)`: Verify and decode JWT token
- Load JWT_SECRET from environment
- Configure token expiration

**`src/services/password.js`** - Password Service
- `hash(password)`: Hash password with bcrypt
- `verify(password, hash)`: Verify password against hash
- Configure salt rounds (10)

**`src/services/validation.js`** - Validation Service
- `validateEmail(email)`: Validate email format
- `validatePassword(password)`: Validate password requirements
- `validateName(name)`: Validate name field
- `validateRegistration(data)`: Validate registration request
- `validateLogin(data)`: Validate login request

**`src/middleware/errorHandler.js`** - Error Handler
- Catch unhandled errors
- Log errors with stack traces
- Return generic error responses
- Prevent information disclosure

**`src/middleware/logger.js`** - Request Logger
- Log incoming requests (method, path, timestamp)
- Log outgoing responses (status, response time)
- Structured log format

**`src/utils/logger.js`** - Logger Utility
- Centralized logging functions
- Log levels: INFO, WARN, ERROR
- Structured JSON logging
- Timestamp formatting

### NPM Scripts

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "migrate": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "prisma:generate": "prisma generate",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Dependencies

**Production Dependencies:**
```json
{
  "express": "^4.18.2",
  "@prisma/client": "^5.7.0",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5"
}
```

**Development Dependencies:**
```json
{
  "prisma": "^5.7.0",
  "nodemon": "^3.0.2",
  "jest": "^29.7.0",
  "fast-check": "^3.15.0"
}
```

---

## API Endpoint Specifications

### POST /api/auth/register

**Description:** Create a new user account with name, email, and password.

**Request:**
```http
POST /api/auth/register HTTP/1.1
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (201 Created):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

400 Bad Request - Missing or invalid fields:
```json
{
  "error": "Name is required"
}
```

409 Conflict - Email already registered:
```json
{
  "error": "Email already registered"
}
```

500 Internal Server Error:
```json
{
  "error": "Registration failed"
}
```

**Validation Rules:**
- `name`: Required, non-empty after trim
- `email`: Required, valid RFC 5322 format
- `password`: Required, minimum 8 characters

### POST /api/auth/login

**Description:** Authenticate an existing user with email and password.

**Request:**
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "avatarUrl": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

400 Bad Request - Missing or invalid fields:
```json
{
  "error": "Email is required"
}
```

401 Unauthorized - Invalid credentials:
```json
{
  "error": "Invalid credentials"
}
```

500 Internal Server Error:
```json
{
  "error": "Login failed"
}
```

**Validation Rules:**
- `email`: Required, valid RFC 5322 format
- `password`: Required

**Security Note:** The same error message ("Invalid credentials") is returned for both "user not found" and "wrong password" to prevent email enumeration attacks.

### GET /health

**Description:** Health check endpoint to verify server is running.

**Request:**
```http
GET /health HTTP/1.1
```

**Success Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-01-07T10:30:15.123Z"
}
```

---

## Implementation Sequence

### Phase 1: Project Setup
1. Initialize Node.js project with `npm init`
2. Install dependencies (express, prisma, bcrypt, jsonwebtoken, etc.)
3. Create project structure (src/, prisma/, tests/)
4. Configure .gitignore and .env.example
5. Create README.md with setup instructions

### Phase 2: Database Setup
1. Create prisma/schema.prisma with User model
2. Configure PostgreSQL connection in .env
3. Run `prisma migrate dev` to create initial migration
4. Create src/config/database.js with Prisma client

### Phase 3: Service Layer Implementation
1. Implement src/services/password.js (bcrypt operations)
2. Implement src/services/jwt.js (token operations)
3. Implement src/services/validation.js (input validation)
4. Write unit tests for each service

### Phase 4: Middleware Implementation
1. Implement src/middleware/logger.js (request logging)
2. Implement src/middleware/errorHandler.js (error handling)
3. Create src/utils/logger.js (logging utilities)

### Phase 5: Routes Implementation
1. Implement src/routes/auth.js (register, login, health endpoints)
2. Write integration tests for each endpoint
3. Test error handling paths

### Phase 6: Server Setup
1. Implement src/index.js (Express app initialization)
2. Configure middleware stack
3. Mount routes
4. Implement graceful shutdown

### Phase 7: Testing and Documentation
1. Write property-based tests using fast-check
2. Run all tests and verify coverage
3. Complete API documentation in README.md
4. Create example .env.example file
5. Write deployment instructions

---

## Integration Points

### Mobile App Integration (Track A)

The mobile app will integrate with these endpoints to replace mock authentication:

**Registration Flow:**
1. User fills registration form in `SignUpScreen.js`
2. App sends POST request to `/api/auth/register`
3. On success (201), store token in Expo SecureStore
4. Navigate to HomeScreen

**Login Flow:**
1. User fills login form in `SignInScreen.js`
2. App sends POST request to `/api/auth/login`
3. On success (200), store token in Expo SecureStore
4. Navigate to HomeScreen

**Token Storage:**
```javascript
import * as SecureStore from 'expo-secure-store';

// Store token after successful authentication
await SecureStore.setItemAsync('authToken', token);

// Retrieve token for authenticated requests
const token = await SecureStore.getItemAsync('authToken');
```

**Authenticated Requests (Future - Task B2):**
```javascript
const response = await fetch('https://api.dayflow.com/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Future Backend Tasks

**Task B2 - Core Data API:**
- Use JWT authentication middleware to protect endpoints
- Decode JWT token to get user ID
- Scope all queries to authenticated user

**Task B3 - Notification Backend:**
- Authenticate users before sending push notifications
- Use user ID from JWT token

**Task B4 - Dashboard Aggregation:**
- Authenticate users for analytics endpoints
- Use user ID for personalized data

---

## Testing Strategy Summary

### Property-Based Tests (using fast-check)

**Test Configuration:**
- Minimum 100 iterations per property
- Tag format: `Feature: backend-auth, Property N: <description>`

**Property 1 - Email Validation:**
```javascript
test('Feature: backend-auth, Property 1: Email validation correctness', () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      const result = validationService.validateEmail(input);
      // Test validation logic with various inputs
    }),
    { numRuns: 100 }
  );
});
```

**Property 2 - Password Hash Uniqueness:**
```javascript
test('Feature: backend-auth, Property 2: Password hash uniqueness', async () => {
  fc.assert(
    fc.asyncProperty(fc.string({ minLength: 8 }), async (password) => {
      const hash1 = await passwordService.hash(password);
      const hash2 = await passwordService.hash(password);
      expect(hash1).not.toBe(hash2); // Different hashes due to salt
    }),
    { numRuns: 100 }
  );
});
```

**Property 3 - Password Verification Round-Trip:**
```javascript
test('Feature: backend-auth, Property 3: Password verification round-trip', async () => {
  fc.assert(
    fc.asyncProperty(fc.string({ minLength: 8 }), async (password) => {
      const hash = await passwordService.hash(password);
      const isValid = await passwordService.verify(password, hash);
      expect(isValid).toBe(true);
    }),
    { numRuns: 100 }
  );
});
```

**Property 4 - JWT Round-Trip:**
```javascript
test('Feature: backend-auth, Property 4: JWT round-trip preservation', () => {
  fc.assert(
    fc.property(
      fc.uuid(),
      fc.emailAddress(),
      (id, email) => {
        const token = jwtService.sign({ id, email });
        const decoded = jwtService.verify(token);
        expect(decoded.id).toBe(id);
        expect(decoded.email).toBe(email);
        expect(decoded.exp - decoded.iat).toBe(604800); // 7 days
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Tests

**Registration Endpoint:**
- Successful registration with valid data
- Duplicate email returns 409
- Missing fields return 400
- Invalid email format returns 400
- Password too short returns 400
- Database error returns 500

**Login Endpoint:**
- Successful login with correct credentials
- Wrong password returns 401
- Non-existent email returns 401
- Missing fields return 400

**Database Persistence:**
- User data persists correctly
- Email uniqueness enforced
- Timestamps set automatically

### Example-Based Unit Tests

**Validation Service:**
- Valid email formats accepted
- Invalid email formats rejected
- Whitespace trimmed correctly
- Empty strings rejected

**Error Handling:**
- All validation error paths tested
- Database errors handled gracefully
- Generic error messages returned

---

## Deployment Considerations

### Environment Setup

**Required Environment Variables:**
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dayflow?schema=public"

# JWT
JWT_SECRET="your-256-bit-cryptographically-random-secret-key-here"

# Server
PORT=3000
NODE_ENV="production"

# CORS (production only)
ALLOWED_ORIGINS="https://app.dayflow.com,https://dayflow.com"
```

### Database Setup

**Initial Migration:**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run migrate:deploy
```

**Database Requirements:**
- PostgreSQL 13 or higher
- Database created and accessible
- User with CREATE TABLE privileges

### Server Startup

**Production:**
```bash
NODE_ENV=production npm start
```

**Development:**
```bash
npm run dev
```

### Health Checks

**Endpoint:** GET /health
**Expected Response:** 200 OK with `{"status":"ok"}`

**Monitoring:**
- Check /health endpoint every 30 seconds
- Alert if response is not 200 or takes >1s

### Logging

**Production Logging:**
- Log to stdout (capture with log aggregation service)
- Include timestamps, request IDs, status codes
- Never log passwords, tokens, or sensitive data

### Security Hardening

**Production Checklist:**
- [ ] Strong JWT_SECRET (min 32 characters, cryptographically random)
- [ ] HTTPS only (no HTTP in production)
- [ ] CORS restricted to known origins
- [ ] Database connection uses SSL
- [ ] Environment variables stored securely (AWS Secrets Manager, etc.)
- [ ] No .env files in Docker images
- [ ] Rate limiting implemented (future enhancement)
- [ ] Security headers configured (Helmet.js)

---

## Conclusion

This design document provides a comprehensive blueprint for implementing the DayFlow backend authentication system. The system follows industry best practices for security, uses well-established libraries, and maintains a clear separation of concerns through layered architecture.

**Key Design Strengths:**
- Pure functional services (JWT, password, validation) enable property-based testing
- Stateless JWT authentication scales horizontally
- bcrypt provides strong password security
- Prisma ORM offers type safety and migration management
- Modular architecture supports testing and maintenance

**Implementation Readiness:**
- All 14 requirements from requirements.md are addressed
- API contracts clearly defined with request/response formats
- Database schema specified with Prisma
- Testing strategy includes both property-based and integration tests
- Security considerations documented
- Project structure and file organization defined

**Next Steps:**
1. Review and approve this design document
2. Proceed to task creation phase
3. Implement according to the sequence outlined in Phase 1-7
4. Execute tests as specified in Testing Strategy
5. Deploy following Deployment Considerations

