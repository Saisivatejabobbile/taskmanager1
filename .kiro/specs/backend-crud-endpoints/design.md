# Design Document: Backend CRUD Endpoints

## Overview

This design document specifies the technical implementation for protected RESTful API endpoints that enable CRUD operations for Tasks, Calendar Events, Expenses, and Categories in the DayFlow backend. The system integrates with the existing JWT authentication infrastructure (Task B1) and enforces data ownership to ensure users can only access their own resources.

### Goals

- Provide secure, authenticated CRUD endpoints for all core DayFlow data types
- Enforce user data isolation through JWT authentication and ownership verification
- Support complex data structures including nested subtasks, resource links, and recurrence rules
- Maintain consistency with existing authentication, validation, and error handling patterns
- Enable mobile app transition from local mock data to persistent backend storage

### Non-Goals

- Real-time data synchronization (WebSocket/SSE)
- Data migration from existing local storage
- Batch operations or bulk endpoints
- Search, filtering, or pagination capabilities
- Offline conflict resolution

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile App (Client)                       │
└────────────┬────────────────────────────────────────────────────┘
             │ HTTP Requests (Authorization: Bearer <JWT>)
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express.js Server                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Middleware Stack                                         │   │
│  │  1. CORS                                                  │   │
│  │  2. Body Parser (JSON)                                    │   │
│  │  3. Request Logger                                        │   │
│  │  4. Auth Middleware (JWT validation) ←─────────────────┐ │   │
│  └──────────────────────────────────────────────────────────┘ │   │
│                                                               │   │
│  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  Route Handlers                                          │ │   │
│  │  • /api/tasks                                            │ │   │
│  │  • /api/events                                           │ │   │
│  │  • /api/expenses                                         │ │   │
│  │  • /api/categories                                       │ │   │
│  │                                                          │ │   │
│  │  Each handler:                                           │ │   │
│  │  1. Validates request body                               │ │   │
│  │  2. Verifies data ownership (userId from JWT)            │ │   │
│  │  3. Performs database operation                          │ │   │
│  │  4. Returns formatted response                           │ │   │
│  └──────────────────────────────────────────────────────────┘ │   │
│                                                               │   │
│  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  Error Handler (Last middleware)                         │ │   │
│  └──────────────────────────────────────────────────────────┘ │   │
└───────────────────────┬───────────────────────────────────────┘   │
                        │                                           │
                        ▼                                           │
┌─────────────────────────────────────────────────────────────┐   │
│                    Prisma ORM                                │   │
└────────────┬────────────────────────────────────────────────┘   │
             │                                                     │
             ▼                                                     │
┌─────────────────────────────────────────────────────────────┐   │
│                  SQLite Database                             │   │
│  Tables: User, Task, Event, Expense, Category                │   │
└─────────────────────────────────────────────────────────────┘   │
                                                                   │
     JWT Validation Flow: ─────────────────────────────────────────┘
     1. Extract token from Authorization header
     2. Verify signature with JWT_SECRET
     3. Check expiration
     4. Attach userId to req.user
```

### Request Flow

**Authenticated CRUD Request Flow:**

```
1. Client Request
   ↓
2. CORS Middleware (validate origin)
   ↓
3. Body Parser (parse JSON payload)
   ↓
4. Request Logger (log incoming request)
   ↓
5. Auth Middleware
   - Extract "Bearer <token>" from Authorization header
   - Verify JWT signature and expiration
   - Decode userId and attach to req.user
   - Reject if invalid (401) or missing (401)
   ↓
6. Route Handler
   - Validate request body against schema
   - For GET/PUT/DELETE by ID: verify resource ownership
   - For POST: auto-assign userId from req.user
   - Execute database operation via Prisma
   - Format response
   ↓
7. Response sent to client
   ↓
8. Request Logger (log response status)
```

**Error Handling Flow:**

```
Error occurs in any layer
   ↓
Express error handler (next(error))
   ↓
Error Handler Middleware
   - Log full error with stack trace
   - Classify error type (validation, auth, not found, server)
   - Return appropriate HTTP status code
   - Return safe error message (never expose internals)
   ↓
Client receives formatted error response
```

## Components and Interfaces

### 1. Authentication Middleware

**Purpose:** Validate JWT tokens and extract user identity for all protected routes.

**Location:** `src/middleware/auth.js`

**Interface:**

```javascript
/**
 * Authentication middleware
 * Validates JWT token and attaches user ID to request
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
function authenticateToken(req, res, next)
```

**Behavior:**

- **Input:** HTTP request with `Authorization: Bearer <token>` header
- **Process:**
  1. Extract token from Authorization header
  2. Call `jwtService.verify(token)` to validate
  3. If valid: attach `req.user = { id: userId, email: userEmail }` and call `next()`
  4. If missing: return 401 "Authentication required"
  5. If invalid/expired: return 401 "Invalid or expired token"
- **Output:** Enriched request object with `req.user` or error response

**Integration Points:**
- Uses existing `src/services/jwt.js` for token verification
- Applied to all routes except `/health` and `/`
- Reuses error response format from existing error handler

### 2. Validation Service Extension

**Purpose:** Extend existing validation service to support CRUD request validation.

**Location:** `src/services/validation.js` (extend existing)

**New Functions:**

```javascript
// Task validation
function validateTask(data)
function validateSubtask(subtask)
function validateResourceLink(link)

// Event validation
function validateEvent(data)

// Expense validation
function validateExpense(data)

// Category validation
function validateCategory(data)

// Common validators
function validateUUID(id)
function validateDateISO8601(dateString)
function validateRRULE(rruleString)
function validateURL(urlString)
```

**Validation Rules:**

**Task:**
- `title`: required, string, 1-200 characters, trimmed
- `notes`: optional, string, max 2000 characters, trimmed
- `dueDate`: optional, ISO 8601 date string
- `priority`: required, enum ['high', 'medium', 'low']
- `categoryId`: optional, UUID or null
- `status`: required, enum ['pending', 'completed']
- `recurrenceRule`: optional, RRULE string or null
- `subtasks`: optional, array of `{ id: UUID, title: string, done: boolean }`
- `resourceLinks`: optional, array of `{ url: URL string, label: string }`

**Event:**
- `title`: required, string, 1-200 characters, trimmed
- `eventDate`: required, ISO 8601 date string
- `alertDaysBefore`: required, non-negative integer
- `repeatsYearly`: required, boolean
- `category`: optional, string, max 50 characters

**Expense:**
- `amount`: required, positive number
- `direction`: required, enum ['debit', 'credit']
- `categoryId`: optional, UUID or null
- `note`: optional, string, max 2000 characters, trimmed
- `occurredAt`: required, ISO 8601 date string
- `recurrenceRule`: optional, RRULE string or null

**Category:**
- `name`: required, string, 1-50 characters, trimmed
- `type`: required, enum ['task', 'expense']
- `color`: required, string, hex color format (#RRGGBB)

**Error Response Format:**
```json
{
  "error": "Validation failed",
  "details": [
    "Field 'title' is required",
    "Field 'priority' must be one of: high, medium, low"
  ]
}
```

### 3. Route Handlers

**Purpose:** Implement CRUD operations for each resource type.

**Location:** 
- `src/routes/tasks.js`
- `src/routes/events.js`
- `src/routes/expenses.js`
- `src/routes/categories.js`

**Common Pattern for All Routes:**

```javascript
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const validationService = require('../services/validation');
const logger = require('../utils/logger');

// Apply auth middleware to all routes
router.use(authenticateToken);

// CREATE: POST /api/<resource>
router.post('/', async (req, res, next) => {
  try {
    // 1. Validate request body
    const validation = validationService.validate<Resource>(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // 2. Create resource with userId from token
    const resource = await prisma.<resource>.create({
      data: {
        ...validation.data,
        userId: req.user.id  // Auto-assign from JWT
      }
    });

    // 3. Log and return
    logger.info(`Resource created: ${resource.id} by user ${req.user.id}`);
    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
});

// READ ALL: GET /api/<resource>
router.get('/', async (req, res, next) => {
  try {
    // Fetch only user's resources
    const resources = await prisma.<resource>.findMany({
      where: { userId: req.user.id }
    });

    logger.info(`Fetched ${resources.length} resources for user ${req.user.id}`);
    res.status(200).json(resources);
  } catch (error) {
    next(error);
  }
});

// READ ONE: GET /api/<resource>/:id
router.get('/:id', async (req, res, next) => {
  try {
    // 1. Validate ID format
    if (!validationService.validateUUID(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // 2. Fetch resource
    const resource = await prisma.<resource>.findUnique({
      where: { id: req.params.id }
    });

    // 3. Check existence
    if (!resource) {
      return res.status(404).json({ error: '<Resource> not found' });
    }

    // 4. Verify ownership
    if (resource.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to access resource ${req.params.id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(resource);
  } catch (error) {
    next(error);
  }
});

// UPDATE: PUT /api/<resource>/:id
router.put('/:id', async (req, res, next) => {
  try {
    // 1. Validate ID format
    if (!validationService.validateUUID(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // 2. Validate request body
    const validation = validationService.validate<Resource>(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // 3. Fetch resource to verify ownership
    const existing = await prisma.<resource>.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: '<Resource> not found' });
    }

    if (existing.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to update resource ${req.params.id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    // 4. Update resource
    const updated = await prisma.<resource>.update({
      where: { id: req.params.id },
      data: validation.data
    });

    logger.info(`Resource updated: ${updated.id} by user ${req.user.id}`);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

// DELETE: DELETE /api/<resource>/:id
router.delete('/:id', async (req, res, next) => {
  try {
    // 1. Validate ID format
    if (!validationService.validateUUID(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // 2. Fetch resource to verify ownership
    const existing = await prisma.<resource>.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: '<Resource> not found' });
    }

    if (existing.userId !== req.user.id) {
      logger.warn(`Access denied: user ${req.user.id} attempted to delete resource ${req.params.id}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    // 3. Delete resource
    await prisma.<resource>.delete({
      where: { id: req.params.id }
    });

    logger.info(`Resource deleted: ${req.params.id} by user ${req.user.id}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

### 4. Ownership Verification Helper

**Purpose:** Centralize ownership verification logic to avoid duplication.

**Location:** `src/utils/ownership.js`

**Interface:**

```javascript
/**
 * Verify that a resource belongs to the authenticated user
 * 
 * @param {object} resource - The database resource object
 * @param {string} userId - The authenticated user's ID
 * @param {string} resourceType - Resource type for logging (e.g., 'Task')
 * @returns {object} { authorized: boolean, error?: string }
 */
function verifyOwnership(resource, userId, resourceType)
```

**Implementation:**

```javascript
function verifyOwnership(resource, userId, resourceType) {
  if (!resource) {
    return {
      authorized: false,
      statusCode: 404,
      error: `${resourceType} not found`
    };
  }

  if (resource.userId !== userId) {
    return {
      authorized: false,
      statusCode: 403,
      error: 'Access denied'
    };
  }

  return { authorized: true };
}
```

## Data Models

### Database Schema (Prisma)

**Extended `schema.prisma`:**

```prisma
// Existing User model (from backend-auth)
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  tasks      Task[]
  events     Event[]
  expenses   Expense[]
  categories Category[]

  @@index([email])
  @@map("users")
}

// Task model with nested JSON structures
model Task {
  id             String   @id @default(uuid())
  userId         String
  title          String   // 1-200 characters
  notes          String?  // Max 2000 characters
  dueDate        DateTime?
  priority       String   // enum: 'high', 'medium', 'low'
  categoryId     String?
  status         String   // enum: 'pending', 'completed'
  recurrenceRule String?  // iCalendar RRULE format
  subtasks       String?  // JSON array: [{ id, title, done }]
  resourceLinks  String?  // JSON array: [{ url, label }]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, status])
  @@index([userId, dueDate])
  @@map("tasks")
}

// Event model for calendar entries
model Event {
  id               String   @id @default(uuid())
  userId           String
  title            String   // 1-200 characters
  eventDate        DateTime
  alertDaysBefore  Int      // Non-negative integer
  repeatsYearly    Boolean  @default(false)
  category         String?  // Max 50 characters
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, eventDate])
  @@map("events")
}

// Expense model for financial tracking
model Expense {
  id             String   @id @default(uuid())
  userId         String
  amount         Float    // Positive number
  direction      String   // enum: 'debit', 'credit'
  categoryId     String?
  note           String?  // Max 2000 characters
  occurredAt     DateTime
  recurrenceRule String?  // iCalendar RRULE format
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, occurredAt])
  @@index([userId, direction])
  @@map("expenses")
}

// Category model for organizing tasks and expenses
model Category {
  id        String   @id @default(uuid())
  userId    String
  name      String   // 1-50 characters
  type      String   // enum: 'task', 'expense'
  color     String   // Hex format: #RRGGBB
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, type])
  @@map("categories")
}
```

### Data Type Representations

**JSON Field Formats:**

**Task.subtasks** (stored as JSON string):
```json
[
  {
    "id": "uuid-string",
    "title": "Subtask description",
    "done": false
  }
]
```

**Task.resourceLinks** (stored as JSON string):
```json
[
  {
    "url": "https://example.com/resource",
    "label": "Resource description"
  }
]
```

**Handling in Code:**
```javascript
// When creating/updating:
const task = await prisma.task.create({
  data: {
    ...taskData,
    subtasks: JSON.stringify(subtasksArray),
    resourceLinks: JSON.stringify(linksArray)
  }
});

// When reading:
const task = await prisma.task.findUnique({ where: { id } });
const parsedTask = {
  ...task,
  subtasks: task.subtasks ? JSON.parse(task.subtasks) : [],
  resourceLinks: task.resourceLinks ? JSON.parse(task.resourceLinks) : []
};
```

### Migration Strategy

1. Create migration file: `prisma migrate dev --name add_crud_tables`
2. Migration will:
   - Create Task, Event, Expense, Category tables
   - Add foreign key constraints to User table
   - Create indexes for performance
3. Apply to production: `prisma migrate deploy`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before writing properties, I need to perform prework analysis to determine which requirements are testable as properties:


### Property 1: Invalid Token Rejection

*For any* JWT token that is malformed, has an invalid signature, or uses a different secret, the authentication middleware SHALL reject the request and return HTTP status 401 with error message "Invalid or expired token"

**Validates: Requirements 1.2, 1.4**

### Property 2: Data Ownership Isolation

*For any* authenticated user and any resource (Task, Event, Expense, Category) owned by a different user, when the user attempts to GET, PUT, or DELETE that resource by ID, the API SHALL return HTTP status 403 with error message "Access denied" without revealing whether the resource exists

**Validates: Requirements 2.4, 2.6, 2.8, 3.4, 3.6, 3.8, 4.4, 4.6, 4.8, 5.4, 5.6, 5.8, 13.1, 13.2, 13.5**

### Property 3: User Data Isolation

*For any* authenticated user, when retrieving the full list of any resource type (GET /api/tasks, /api/events, /api/expenses, /api/categories), the API SHALL return only resources where the userId matches the authenticated user's ID, and SHALL NOT include any resources belonging to other users

**Validates: Requirements 2.2, 3.2, 4.2, 5.2**

### Property 4: Automatic User ID Assignment

*For any* authenticated user creating a resource (POST to /api/tasks, /api/events, /api/expenses, /api/categories), regardless of whether a userId field is included in the request body, the API SHALL set the resource's userId to the authenticated user's ID extracted from the JWT token and SHALL ignore any userId provided in the request body

**Validates: Requirements 13.3, 13.4**

### Property 5: Resource Creation Round-Trip

*For any* valid resource data (Task, Event, Expense, Category) submitted to a POST endpoint, the API SHALL return HTTP status 201 with a response object that contains all submitted fields plus generated fields (id, userId, createdAt, updatedAt), and the stored values SHALL match the submitted values

**Validates: Requirements 2.1, 3.1, 4.1, 5.1, 14.1**

### Property 6: Resource Update Preservation

*For any* valid update data submitted to a PUT endpoint for an owned resource, the API SHALL update only the specified fields, preserve unmodified fields, update the updatedAt timestamp, and return the complete updated resource with HTTP status 200

**Validates: Requirements 2.5, 3.5, 4.5, 5.5, 14.4**

### Property 7: Validation - Missing Required Fields

*For any* POST or PUT request where required fields are missing from the request body, the API SHALL return HTTP status 400 with an error response listing all missing required fields

**Validates: Requirements 6.1**

### Property 8: Validation - Enum Field Values

*For any* request containing enum fields (Task.priority, Task.status, Expense.direction, Category.type) with values outside the allowed set, the API SHALL return HTTP status 400 with an error message indicating the invalid value and allowed options

**Validates: Requirements 6.2, 6.3, 6.5, 6.7**

### Property 9: Validation - Numeric Boundaries

*For any* request containing numeric fields (Event.alertDaysBefore, Expense.amount) that violate boundary constraints (negative alertDaysBefore, negative or zero amount), the API SHALL return HTTP status 400 with an error message indicating the constraint violation

**Validates: Requirements 6.4, 6.6**

### Property 10: Validation - String Length Limits

*For any* request containing string fields that exceed maximum length constraints (title > 200 characters, notes > 2000 characters, Category.name > 50 characters), the API SHALL return HTTP status 400 with an error message indicating the field and maximum length

**Validates: Requirements 6.9**

### Property 11: Validation - Date Format

*For any* request containing date fields (Task.dueDate, Event.eventDate, Expense.occurredAt) with invalid ISO 8601 format, the API SHALL return HTTP status 400 with error message "Invalid date format"

**Validates: Requirements 6.8**

### Property 12: String Field Normalization

*For any* request containing string fields with leading or trailing whitespace, the API SHALL trim the whitespace before validation and storage, and the stored value SHALL NOT contain leading or trailing whitespace

**Validates: Requirements 6.10**

### Property 13: Nested Structure Round-Trip

*For any* Task created or updated with subtasks array or resourceLinks array, the API SHALL serialize the arrays as JSON, store them in the database, and when retrieved, SHALL deserialize them back to arrays with all original field values preserved

**Validates: Requirements 7.1, 7.2, 7.4**

### Property 14: Subtask Validation

*For any* Task creation or update request containing subtasks, if any subtask object is missing required fields (id, title, done), the API SHALL return HTTP status 400 with an error message indicating the missing fields

**Validates: Requirements 7.5**

### Property 15: Resource Link Validation

*For any* Task creation or update request containing resourceLinks, if any resource link object is missing required fields (url, label) or contains an invalid URL format, the API SHALL return HTTP status 400 with an appropriate error message

**Validates: Requirements 7.6, 7.7**

### Property 16: Error Response Format Consistency

*For any* error condition (validation, authentication, authorization, not found, server error), the API SHALL return a JSON response containing an "error" field with a descriptive message, using the appropriate HTTP status code (400, 401, 403, 404, 500)

**Validates: Requirements 10.1, 10.2, 10.4**

### Property 17: Multiple Validation Errors Aggregation

*For any* request containing multiple validation errors (e.g., missing required fields and invalid enum values), the API SHALL return HTTP status 400 with an error response that includes all validation errors in a single response

**Validates: Requirements 10.5**

### Property 18: ISO 8601 Date Serialization

*For any* resource created or updated containing date fields (Task.dueDate, Event.eventDate, Expense.occurredAt, createdAt, updatedAt), the API SHALL return those dates in ISO 8601 format in all response payloads

**Validates: Requirements 14.7**

## Error Handling

### Error Categories and Responses

**1. Authentication Errors (401 Unauthorized)**

- Missing Authorization header
- Malformed token (not "Bearer <token>" format)
- Invalid token signature
- Expired token
- Token from wrong JWT_SECRET

Response format:
```json
{
  "error": "Authentication required"
}
// or
{
  "error": "Invalid or expired token"
}
```

**2. Authorization Errors (403 Forbidden)**

- Attempting to access resource owned by another user
- Attempting to modify resource owned by another user

Response format:
```json
{
  "error": "Access denied"
}
```

**3. Validation Errors (400 Bad Request)**

- Missing required fields
- Invalid enum values
- Invalid date formats
- Invalid URL formats
- Field length violations
- Negative values where positive required
- Malformed JSON in request body

Response format:
```json
{
  "error": "Validation failed",
  "details": [
    "Field 'title' is required",
    "Field 'priority' must be one of: high, medium, low"
  ]
}
// or simple single error
{
  "error": "Invalid priority value"
}
```

**4. Not Found Errors (404 Not Found)**

- Resource ID does not exist in database
- Note: Also returned for non-owned resources to prevent information leakage

Response format:
```json
{
  "error": "Task not found"
}
```

**5. Server Errors (500 Internal Server Error)**

- Database connection failures
- Unexpected exceptions
- Prisma errors

Response format:
```json
{
  "error": "Internal server error"
}
```

**Logging:** Full stack trace logged server-side, but never exposed to client

### Error Handling Flow

```javascript
// In route handlers
try {
  // Validation
  const validation = validationService.validateTask(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // Ownership check
  const resource = await prisma.task.findUnique({ where: { id } });
  if (!resource) {
    return res.status(404).json({ error: 'Task not found' });
  }
  if (resource.userId !== req.user.id) {
    logger.warn(`Access denied: user ${req.user.id} attempted to access task ${id}`);
    return res.status(403).json({ error: 'Access denied' });
  }

  // Business logic
  const result = await performOperation();
  res.json(result);

} catch (error) {
  // Unexpected errors caught by global error handler
  next(error);
}
```

### Prisma Error Handling

Prisma-specific errors are caught and translated:

```javascript
catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    return res.status(409).json({ error: 'Resource already exists' });
  }
  if (error.code === 'P2025') {
    // Record not found
    return res.status(404).json({ error: 'Resource not found' });
  }
  // Other errors pass to global handler
  next(error);
}
```

## Testing Strategy

This feature requires a comprehensive testing approach combining unit tests, property-based tests, and integration tests.

### 1. Unit Tests (Example-Based)

**Purpose:** Test specific examples, edge cases, and integration points

**Scope:**
- Authentication middleware with missing/valid/expired tokens
- Single resource CRUD operations (happy paths)
- Specific error cases (404 for non-existent ID, 403 for wrong user)
- DELETE returns 204 with empty body
- Middleware attachment and header parsing
- Event and Expense field handling with specific valid values

**Tools:** Jest, Supertest

**Example Test Structure:**
```javascript
describe('GET /api/tasks/:id', () => {
  it('should return 404 for non-existent task ID', async () => {
    const token = generateValidToken(userId);
    const response = await request(app)
      .get('/api/tasks/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Task not found' });
  });

  it('should return 401 when Authorization header is missing', async () => {
    const response = await request(app)
      .get('/api/tasks/some-id');
    
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Authentication required' });
  });
});
```

### 2. Property-Based Tests

**Purpose:** Verify universal properties hold across all valid inputs

**Library:** fast-check (JavaScript property-based testing library)

**Configuration:** Minimum 100 iterations per property test

**Tag Format:** Each test must include a comment referencing the design property

```javascript
/**
 * Feature: backend-crud-endpoints, Property 2: Data Ownership Isolation
 * For any authenticated user and any resource owned by a different user,
 * the API SHALL return 403 without revealing resource existence
 */
```

**Property Test Structure:**

```javascript
const fc = require('fast-check');

/**
 * Feature: backend-crud-endpoints, Property 2: Data Ownership Isolation
 */
describe('Property 2: Data Ownership Isolation', () => {
  it('should deny access to resources owned by other users', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          resourceType: fc.constantFrom('task', 'event', 'expense', 'category'),
          ownerUserId: fc.uuid(),
          requestingUserId: fc.uuid(),
          resourceData: fc.object()
        }),
        async ({ resourceType, ownerUserId, requestingUserId, resourceData }) => {
          // Ensure different users
          fc.pre(ownerUserId !== requestingUserId);

          // Create resource as owner
          const resource = await createResource(resourceType, ownerUserId, resourceData);

          // Attempt access as different user
          const token = generateValidToken(requestingUserId);
          const response = await request(app)
            .get(`/api/${resourceType}s/${resource.id}`)
            .set('Authorization', `Bearer ${token}`);

          expect(response.status).toBe(403);
          expect(response.body).toEqual({ error: 'Access denied' });
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: backend-crud-endpoints, Property 8: Validation - Enum Field Values
 */
describe('Property 8: Validation - Enum Field Values', () => {
  it('should reject invalid priority values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter(s => !['high', 'medium', 'low'].includes(s)),
        async (invalidPriority) => {
          const token = generateValidToken(userId);
          const response = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
              title: 'Test Task',
              priority: invalidPriority,
              status: 'pending'
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toContain('Invalid priority');
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: backend-crud-endpoints, Property 13: Nested Structure Round-Trip
 */
describe('Property 13: Nested Structure Round-Trip', () => {
  it('should preserve subtasks and resourceLinks through create/retrieve cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          subtasks: fc.array(fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            done: fc.boolean()
          })),
          resourceLinks: fc.array(fc.record({
            url: fc.webUrl(),
            label: fc.string({ minLength: 1, maxLength: 100 })
          }))
        }),
        async ({ subtasks, resourceLinks }) => {
          const token = generateValidToken(userId);
          
          // Create task
          const createResponse = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
              title: 'Test Task',
              priority: 'medium',
              status: 'pending',
              subtasks,
              resourceLinks
            });

          expect(createResponse.status).toBe(201);
          const taskId = createResponse.body.id;

          // Retrieve task
          const getResponse = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);

          expect(getResponse.status).toBe(200);
          expect(getResponse.body.subtasks).toEqual(subtasks);
          expect(getResponse.body.resourceLinks).toEqual(resourceLinks);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 3. Integration Tests

**Purpose:** Test infrastructure, database schema, and end-to-end flows

**Scope:**
- Database schema verification (foreign keys, indexes, column types)
- Prisma cascading deletes (when user is deleted, all resources are deleted)
- JSON field storage and retrieval
- Logging verification (operations are logged with correct levels)
- Complete request/response cycle through all middleware layers

**Tools:** Jest, Supertest, SQLite test database

**Example:**
```javascript
describe('Database Schema Integration', () => {
  it('should have foreign key constraint from Task to User', async () => {
    const schema = await prisma.$queryRaw`PRAGMA foreign_key_list(tasks)`;
    expect(schema).toContainEqual(
      expect.objectContaining({
        table: 'users',
        from: 'userId',
        to: 'id'
      })
    );
  });

  it('should cascade delete tasks when user is deleted', async () => {
    const user = await prisma.user.create({ data: userData });
    const task = await prisma.task.create({
      data: { ...taskData, userId: user.id }
    });

    await prisma.user.delete({ where: { id: user.id } });

    const deletedTask = await prisma.task.findUnique({
      where: { id: task.id }
    });
    expect(deletedTask).toBeNull();
  });
});
```

### Test Coverage Goals

- **Unit Tests:** Cover all specific examples and error cases
- **Property Tests:** Cover all 18 correctness properties with 100+ iterations each
- **Integration Tests:** Verify database schema and end-to-end flows
- **Overall Coverage:** Aim for >90% code coverage
- **Critical Paths:** 100% coverage for authentication and ownership verification

### Testing Workflow

1. **Development:** Write unit tests alongside implementation
2. **Property Implementation:** Implement each correctness property as a separate property test
3. **Integration Verification:** Run integration tests against test database
4. **CI Pipeline:** Run all tests on each commit
5. **Pre-deployment:** Full test suite must pass

## Implementation Plan

### Phase 1: Database Schema and Migrations

1. Update `prisma/schema.prisma` with new models (Task, Event, Expense, Category)
2. Create migration: `npx prisma migrate dev --name add_crud_tables`
3. Verify migration applies cleanly
4. Test database relationships and cascade deletes

### Phase 2: Authentication Middleware

1. Create `src/middleware/auth.js`
2. Implement JWT extraction from Authorization header
3. Implement token validation using existing `jwtService`
4. Add user attachment to request object
5. Write unit tests for middleware
6. Integrate with existing error handler

### Phase 3: Validation Service Extension

1. Add validation functions to `src/services/validation.js`
2. Implement validation for each resource type:
   - Task validation (with nested structures)
   - Event validation
   - Expense validation
   - Category validation
3. Implement field validators:
   - UUID validation
   - Date format validation
   - URL validation
   - RRULE validation (basic format check)
4. Write property tests for validation logic

### Phase 4: Route Handlers - Tasks

1. Create `src/routes/tasks.js`
2. Implement CRUD endpoints:
   - POST /api/tasks
   - GET /api/tasks
   - GET /api/tasks/:id
   - PUT /api/tasks/:id
   - DELETE /api/tasks/:id
3. Add JSON serialization/deserialization for subtasks and resourceLinks
4. Write unit tests and property tests
5. Integrate with authentication middleware

### Phase 5: Route Handlers - Events, Expenses, Categories

1. Create `src/routes/events.js`, `src/routes/expenses.js`, `src/routes/categories.js`
2. Implement CRUD endpoints for each (following Task pattern)
3. Write unit tests and property tests for each
4. Integrate with authentication middleware

### Phase 6: Integration and Testing

1. Mount all routes in `src/index.js`
2. Run full integration test suite
3. Verify property tests pass with 100+ iterations
4. Test manual scenarios with Postman/curl
5. Review error handling consistency
6. Verify logging completeness

### Phase 7: Documentation and Deployment

1. Update API documentation
2. Create example requests for each endpoint
3. Update environment variable requirements
4. Run migration in production: `npx prisma migrate deploy`
5. Deploy backend with new endpoints
6. Monitor logs for errors

## Dependencies

### Existing Dependencies
- `express`: Web framework
- `@prisma/client`: ORM for database operations
- `jsonwebtoken`: JWT token handling (already installed)
- `cors`: CORS middleware
- `dotenv`: Environment variable management

### Development Dependencies
- `jest`: Testing framework
- `supertest`: HTTP testing
- `fast-check`: Property-based testing library (NEW - need to install)

### Installation
```bash
npm install --save-dev fast-check
```

## Configuration Requirements

### Environment Variables

No new environment variables required. Uses existing:
- `DATABASE_URL`: SQLite database connection string
- `JWT_SECRET`: Secret for JWT token validation
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)

### Database Migration

```bash
# Development
npx prisma migrate dev --name add_crud_tables

# Production
npx prisma migrate deploy
```

## API Endpoint Summary

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List user's tasks
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Events
- `POST /api/events` - Create event
- `GET /api/events` - List user's events
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - List user's expenses
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Categories
- `POST /api/categories` - Create category
- `GET /api/categories` - List user's categories
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

All endpoints require `Authorization: Bearer <token>` header.

## Security Considerations

### Data Isolation
- All queries filter by `userId` to prevent cross-user data access
- Ownership verified before any modification or deletion
- 403 returned for non-owned resources (doesn't reveal existence)

### Input Sanitization
- All string fields trimmed before validation and storage
- User-provided `userId` in request body ignored
- Validated enum values prevent SQL injection
- URL validation prevents XSS via resource links

### Token Security
- JWT tokens validated on every protected request
- Expired tokens rejected with 401
- Invalid signatures rejected with 401
- Token secret never exposed in responses

### Error Handling
- Internal errors never expose stack traces to clients
- Generic "Internal server error" returned for server errors
- Full details logged server-side for debugging
- 404 used for both non-existent and non-owned resources (information hiding)

### Database Security
- Foreign key constraints enforce referential integrity
- Cascade deletes prevent orphaned records
- Indexes on `userId` optimize query performance without security trade-offs
- Prisma parameterized queries prevent SQL injection

## Performance Considerations

### Database Indexes

Indexes are created on high-query fields:
- `userId` on all resource tables (for filtering user data)
- `(userId, status)` on Task table (for filtering by status)
- `(userId, dueDate)` on Task table (for date-based queries)
- `(userId, eventDate)` on Event table
- `(userId, occurredAt)` on Expense table
- `(userId, direction)` on Expense table
- `(userId, type)` on Category table

### Query Optimization

- Use `findMany()` with `where: { userId }` instead of fetching all and filtering
- Use `select` to retrieve only needed fields when appropriate
- Leverage Prisma's query optimization

### JSON Field Performance

- Subtasks and resourceLinks stored as JSON strings
- Parsed on read, serialized on write
- Acceptable for arrays <100 items
- Consider separate tables if arrays grow large (future optimization)

### Caching Strategy (Future Enhancement)

Not implemented in this phase, but consider:
- Redis caching for frequently accessed resources
- Cache invalidation on updates
- Short TTL (5-10 minutes) for user resource lists

## Monitoring and Observability

### Logging

All operations logged with:
- Operation type (CREATE, READ, UPDATE, DELETE)
- Resource type (Task, Event, Expense, Category)
- User ID
- Resource ID
- Timestamp
- Result (success/error)

### Metrics to Track

- Request count by endpoint
- Response time percentiles (p50, p95, p99)
- Error rate by type (401, 403, 404, 500)
- Database query performance
- Authentication failures

### Health Check

Existing `/health` endpoint returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Consider adding database connectivity check:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

---

**Design Document Version:** 1.0  
**Last Updated:** 2024-01-15  
**Status:** Ready for Implementation
