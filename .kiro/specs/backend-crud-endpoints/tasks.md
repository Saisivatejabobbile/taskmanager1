# Implementation Plan: Backend CRUD Endpoints

## Overview

This implementation plan breaks down the Backend CRUD Endpoints feature into discrete, incremental coding tasks. The feature will add protected RESTful API endpoints for Tasks, Events, Expenses, and Categories, integrating with the existing JWT authentication system and ensuring users can only access their own data.

The implementation follows a 7-phase approach: (1) Database Schema and Migrations, (2) Authentication Middleware, (3) Validation Service Extension, (4) Route Handlers for Tasks, (5) Route Handlers for Events, Expenses, and Categories, (6) Integration and Testing, and (7) Documentation.

## Tasks

- [x] 1. Database Schema and Migrations
  - [x] 1.1 Extend Prisma schema with Task, Event, Expense, and Category models
    - Add Task model with fields: id, userId, title, notes, dueDate, priority, categoryId, status, recurrenceRule, subtasks (JSON), resourceLinks (JSON), createdAt, updatedAt
    - Add Event model with fields: id, userId, title, eventDate, alertDaysBefore, repeatsYearly, category, createdAt, updatedAt
    - Add Expense model with fields: id, userId, amount, direction, categoryId, note, occurredAt, recurrenceRule, createdAt, updatedAt
    - Add Category model with fields: id, userId, name, type, color, createdAt, updatedAt
    - Add foreign key relations to existing User model
    - Add indexes on userId fields and composite indexes for common query patterns
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10_

  - [x] 1.2 Create and apply database migration
    - Run `npx prisma migrate dev --name add_crud_tables` to generate migration
    - Verify migration SQL creates all tables with correct columns and constraints
    - Test migration rollback and reapply to ensure reversibility
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 1.3 Write integration tests for database schema
    - Test foreign key constraints exist from all resource tables to User table
    - Test cascade delete behavior (deleting user deletes all their resources)
    - Test indexes are created on userId fields
    - Test UUID format for id fields
    - Test automatic createdAt and updatedAt timestamps
    - _Requirements: 11.5, 11.6, 11.7, 11.8, 11.9_

- [ ] 2. Authentication Middleware
  - [x] 2.1 Create authentication middleware in src/middleware/auth.js
    - Implement authenticateToken function that extracts JWT from Authorization header
    - Parse "Bearer <token>" format from header
    - Call existing jwtService.verify() to validate token
    - On success: attach req.user = { id, email } from decoded token and call next()
    - On missing header: return 401 with error message "Authentication required"
    - On invalid/expired token: return 401 with error message "Invalid or expired token"
    - Handle edge cases: missing header, malformed format, invalid signature
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 12.1, 12.2, 12.3, 12.5, 12.6_

  - [ ]* 2.2 Write unit tests for authentication middleware
    - Test with missing Authorization header (expect 401)
    - Test with malformed token format (expect 401)
    - Test with valid token (expect req.user populated and next() called)
    - Test with expired token (expect 401)
    - Test with invalid signature (expect 401)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.3 Write property test for authentication middleware
    - **Property 1: Invalid Token Rejection**
    - **Validates: Requirements 1.2, 1.4**
    - Generate random invalid tokens (malformed, wrong signature, wrong secret)
    - Verify all return 401 with "Invalid or expired token"
    - _Requirements: 1.2, 1.4_

- [ ] 3. Validation Service Extension
  - [x] 3.1 Add common validators to src/services/validation.js
    - Implement validateUUID(id) - check UUID v4 format
    - Implement validateDateISO8601(dateString) - check ISO 8601 format
    - Implement validateURL(urlString) - check valid URL format
    - Implement validateRRULE(rruleString) - basic RRULE format check
    - Implement trimFields(data, fields) - trim whitespace from string fields
    - _Requirements: 6.8, 6.10, 7.7_

  - [x] 3.2 Add Task validation functions
    - Implement validateTask(data) to validate all Task fields
    - Validate required fields: title, priority, status
    - Validate optional fields: notes, dueDate, categoryId, recurrenceRule
    - Validate title length (1-200 characters)
    - Validate notes length (max 2000 characters)
    - Validate priority enum ('high', 'medium', 'low')
    - Validate status enum ('pending', 'completed')
    - Trim whitespace from title and notes
    - _Requirements: 6.1, 6.2, 6.3, 6.9, 6.10_

  - [ ] 3.3 Add Task nested structure validators
    - Implement validateSubtask(subtask) - check id, title, done fields
    - Implement validateResourceLink(link) - check url and label fields, validate URL format
    - Update validateTask to validate subtasks array if provided
    - Update validateTask to validate resourceLinks array if provided
    - _Requirements: 7.1, 7.2, 7.5, 7.6, 7.7_

  - [ ] 3.4 Add Event validation function
    - Implement validateEvent(data) to validate all Event fields
    - Validate required fields: title, eventDate, alertDaysBefore, repeatsYearly
    - Validate optional fields: category
    - Validate title length (1-200 characters)
    - Validate category length (max 50 characters)
    - Validate alertDaysBefore is non-negative integer
    - Validate repeatsYearly is boolean
    - Validate eventDate is ISO 8601 format
    - Trim whitespace from title and category
    - _Requirements: 6.1, 6.4, 6.8, 6.9, 6.10, 8.1, 8.2, 8.3, 8.4_

  - [ ] 3.5 Add Expense validation function
    - Implement validateExpense(data) to validate all Expense fields
    - Validate required fields: amount, direction, occurredAt
    - Validate optional fields: categoryId, note, recurrenceRule
    - Validate amount is positive number
    - Validate direction enum ('debit', 'credit')
    - Validate note length (max 2000 characters)
    - Validate occurredAt is ISO 8601 format
    - Trim whitespace from note
    - _Requirements: 6.1, 6.5, 6.6, 6.8, 6.9, 6.10, 9.1, 9.2, 9.3, 9.4_

  - [ ] 3.6 Add Category validation function
    - Implement validateCategory(data) to validate all Category fields
    - Validate required fields: name, type, color
    - Validate name length (1-50 characters)
    - Validate type enum ('task', 'expense')
    - Validate color is hex format (#RRGGBB)
    - Trim whitespace from name
    - _Requirements: 6.1, 6.7, 6.9, 6.10_

  - [ ]* 3.7 Write property tests for validation service
    - **Property 7: Validation - Missing Required Fields**
    - **Validates: Requirements 6.1**
    - Generate objects with missing required fields, verify 400 response with field list
    - **Property 8: Validation - Enum Field Values**
    - **Validates: Requirements 6.2, 6.3, 6.5, 6.7**
    - Generate invalid enum values, verify 400 response with error message
    - **Property 9: Validation - Numeric Boundaries**
    - **Validates: Requirements 6.4, 6.6**
    - Generate negative values for alertDaysBefore and amount, verify 400 response
    - **Property 10: Validation - String Length Limits**
    - **Validates: Requirements 6.9**
    - Generate strings exceeding max length, verify 400 response with field and limit
    - **Property 11: Validation - Date Format**
    - **Validates: Requirements 6.8**
    - Generate invalid date formats, verify 400 response
    - **Property 12: String Field Normalization**
    - **Validates: Requirements 6.10**
    - Generate strings with leading/trailing whitespace, verify trimmed in response

- [ ] 4. Checkpoint - Validation and auth middleware complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Route Handlers - Tasks
  - [ ] 5.1 Create Task route handler file and setup
    - Create src/routes/tasks.js with Express router
    - Import dependencies: express, prisma, authenticateToken, validationService, logger
    - Apply authenticateToken middleware to all routes
    - _Requirements: 12.4_

  - [ ] 5.2 Implement POST /api/tasks - Create task
    - Validate request body using validationService.validateTask()
    - Return 400 with validation errors if invalid
    - If subtasks provided, validate each subtask and serialize to JSON string
    - If resourceLinks provided, validate each link and serialize to JSON string
    - Create task in database with userId from req.user.id (ignore any userId in body)
    - Return 201 with complete created task including id, createdAt, updatedAt
    - Deserialize subtasks and resourceLinks back to arrays in response
    - Log operation with userId and task id
    - _Requirements: 2.1, 6.1, 6.2, 6.3, 6.9, 6.10, 7.1, 7.2, 7.5, 7.6, 7.7, 13.3, 13.4, 14.1_

  - [ ] 5.3 Implement GET /api/tasks - List user's tasks
    - Query database for all tasks where userId matches req.user.id
    - Deserialize subtasks and resourceLinks from JSON strings to arrays for each task
    - Return 200 with array of task objects
    - Log operation with userId and count of tasks returned
    - _Requirements: 2.2, 13.1, 14.3_

  - [ ] 5.4 Implement GET /api/tasks/:id - Get task by ID
    - Validate id parameter is valid UUID format, return 400 if invalid
    - Query database for task with given id
    - If task not found, return 404 with error "Task not found"
    - If task.userId !== req.user.id, return 403 with error "Access denied" and log warning
    - Deserialize subtasks and resourceLinks from JSON strings to arrays
    - Return 200 with complete task object
    - _Requirements: 2.3, 2.4, 2.9, 13.1, 13.2, 14.2_

  - [ ] 5.5 Implement PUT /api/tasks/:id - Update task
    - Validate id parameter is valid UUID format, return 400 if invalid
    - Validate request body using validationService.validateTask()
    - Return 400 with validation errors if invalid
    - Query database to check if task exists and verify ownership
    - If task not found, return 404 with error "Task not found"
    - If task.userId !== req.user.id, return 403 with error "Access denied" and log warning
    - If subtasks provided, serialize to JSON string
    - If resourceLinks provided, serialize to JSON string
    - Update task in database with validated data
    - Deserialize subtasks and resourceLinks back to arrays in response
    - Return 200 with complete updated task including new updatedAt timestamp
    - Log operation with userId and task id
    - _Requirements: 2.5, 2.6, 6.1, 6.2, 6.3, 6.9, 6.10, 7.1, 7.2, 13.5, 14.4_

  - [ ] 5.6 Implement DELETE /api/tasks/:id - Delete task
    - Validate id parameter is valid UUID format, return 400 if invalid
    - Query database to check if task exists and verify ownership
    - If task not found, return 404 with error "Task not found"
    - If task.userId !== req.user.id, return 403 with error "Access denied" and log warning
    - Delete task from database
    - Return 204 with empty response body
    - Log operation with userId and task id
    - _Requirements: 2.7, 2.8, 13.5, 14.5_

  - [ ]* 5.7 Write unit tests for Task routes
    - Test POST creates task and returns 201 with complete object
    - Test GET /api/tasks returns only user's tasks
    - Test GET /api/tasks/:id returns 404 for non-existent task
    - Test GET /api/tasks/:id returns 403 for task owned by different user
    - Test PUT updates task and returns updated object
    - Test DELETE returns 204 with empty body
    - Test all validation error cases return 400
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [ ]* 5.8 Write property tests for Task routes
    - **Property 2: Data Ownership Isolation**
    - **Validates: Requirements 2.4, 2.6, 2.8, 13.1, 13.2, 13.5**
    - Generate tasks owned by different users, verify 403 when accessing
    - **Property 3: User Data Isolation**
    - **Validates: Requirements 2.2**
    - Create tasks for multiple users, verify GET /api/tasks returns only own tasks
    - **Property 4: Automatic User ID Assignment**
    - **Validates: Requirements 13.3, 13.4**
    - Create tasks with userId in body, verify stored userId is from JWT token
    - **Property 5: Resource Creation Round-Trip**
    - **Validates: Requirements 2.1, 14.1**
    - Create tasks with various data, verify response matches input plus generated fields
    - **Property 6: Resource Update Preservation**
    - **Validates: Requirements 2.5, 14.4**
    - Update tasks with partial data, verify only specified fields changed
    - **Property 13: Nested Structure Round-Trip**
    - **Validates: Requirements 7.1, 7.2, 7.4**
    - Create tasks with subtasks and resourceLinks, verify preserved through create/retrieve
    - **Property 14: Subtask Validation**
    - **Validates: Requirements 7.5**
    - Create tasks with invalid subtasks (missing fields), verify 400 response
    - **Property 15: Resource Link Validation**
    - **Validates: Requirements 7.6, 7.7**
    - Create tasks with invalid resourceLinks (missing fields, invalid URLs), verify 400

- [ ] 6. Route Handlers - Events
  - [ ] 6.1 Create Event route handler file and implement CRUD endpoints
    - Create src/routes/events.js with Express router
    - Apply authenticateToken middleware
    - Implement POST /api/events (create with validation, auto-assign userId)
    - Implement GET /api/events (list user's events only)
    - Implement GET /api/events/:id (get with ownership verification)
    - Implement PUT /api/events/:id (update with ownership verification)
    - Implement DELETE /api/events/:id (delete with ownership verification)
    - Follow same ownership and validation patterns as Task routes
    - Log all operations
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 8.1, 8.2, 8.3, 8.4, 8.5, 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 6.2 Write unit tests for Event routes
    - Test all CRUD operations (create, list, get, update, delete)
    - Test ownership verification (403 for non-owned events)
    - Test validation errors (400 for invalid data)
    - Test 404 for non-existent events
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [ ]* 6.3 Write property tests for Event routes
    - **Property 2: Data Ownership Isolation** (for Events)
    - **Property 3: User Data Isolation** (for Events)
    - **Property 4: Automatic User ID Assignment** (for Events)
    - **Property 5: Resource Creation Round-Trip** (for Events)
    - **Property 6: Resource Update Preservation** (for Events)
    - _Validates: Requirements 3.4, 3.6, 3.8, 13.1, 13.2, 13.3, 13.4, 13.5, 14.1, 14.4_

- [ ] 7. Route Handlers - Expenses
  - [ ] 7.1 Create Expense route handler file and implement CRUD endpoints
    - Create src/routes/expenses.js with Express router
    - Apply authenticateToken middleware
    - Implement POST /api/expenses (create with validation, auto-assign userId)
    - Implement GET /api/expenses (list user's expenses only)
    - Implement GET /api/expenses/:id (get with ownership verification)
    - Implement PUT /api/expenses/:id (update with ownership verification)
    - Implement DELETE /api/expenses/:id (delete with ownership verification)
    - Follow same ownership and validation patterns as Task routes
    - Log all operations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 9.1, 9.2, 9.3, 9.4, 9.5, 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 7.2 Write unit tests for Expense routes
    - Test all CRUD operations (create, list, get, update, delete)
    - Test ownership verification (403 for non-owned expenses)
    - Test validation errors (400 for invalid data)
    - Test 404 for non-existent expenses
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 7.3 Write property tests for Expense routes
    - **Property 2: Data Ownership Isolation** (for Expenses)
    - **Property 3: User Data Isolation** (for Expenses)
    - **Property 4: Automatic User ID Assignment** (for Expenses)
    - **Property 5: Resource Creation Round-Trip** (for Expenses)
    - **Property 6: Resource Update Preservation** (for Expenses)
    - _Validates: Requirements 4.4, 4.6, 4.8, 13.1, 13.2, 13.3, 13.4, 13.5, 14.1, 14.4_

- [ ] 8. Route Handlers - Categories
  - [ ] 8.1 Create Category route handler file and implement CRUD endpoints
    - Create src/routes/categories.js with Express router
    - Apply authenticateToken middleware
    - Implement POST /api/categories (create with validation, auto-assign userId)
    - Implement GET /api/categories (list user's categories only)
    - Implement GET /api/categories/:id (get with ownership verification)
    - Implement PUT /api/categories/:id (update with ownership verification)
    - Implement DELETE /api/categories/:id (delete with ownership verification)
    - Follow same ownership and validation patterns as Task routes
    - Log all operations
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 8.2 Write unit tests for Category routes
    - Test all CRUD operations (create, list, get, update, delete)
    - Test ownership verification (403 for non-owned categories)
    - Test validation errors (400 for invalid data)
    - Test 404 for non-existent categories
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ]* 8.3 Write property tests for Category routes
    - **Property 2: Data Ownership Isolation** (for Categories)
    - **Property 3: User Data Isolation** (for Categories)
    - **Property 4: Automatic User ID Assignment** (for Categories)
    - **Property 5: Resource Creation Round-Trip** (for Categories)
    - **Property 6: Resource Update Preservation** (for Categories)
    - _Validates: Requirements 5.4, 5.6, 5.8, 13.1, 13.2, 13.3, 13.4, 13.5, 14.1, 14.4_

- [ ] 9. Checkpoint - All route handlers complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Integration and Error Handling
  - [ ] 10.1 Mount all route handlers in src/index.js
    - Import all route modules (tasks, events, expenses, categories)
    - Mount routes: app.use('/api/tasks', tasksRouter)
    - Mount routes: app.use('/api/events', eventsRouter)
    - Mount routes: app.use('/api/expenses', expensesRouter)
    - Mount routes: app.use('/api/categories', categoriesRouter)
    - Ensure routes are mounted after body parser but before error handler
    - _Requirements: 12.4_

  - [ ] 10.2 Verify error response consistency across all endpoints
    - Ensure all validation errors return 400 with { error: "message", details?: [] }
    - Ensure all auth errors return 401 with { error: "message" }
    - Ensure all authorization errors return 403 with { error: "Access denied" }
    - Ensure all not found errors return 404 with { error: "Resource not found" }
    - Ensure all server errors return 500 with { error: "Internal server error" }
    - Verify error handler logs full stack trace but returns generic message to client
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 10.3 Add Prisma error handling
    - Catch Prisma P2002 error (unique constraint) and return 409 with appropriate message
    - Catch Prisma P2025 error (record not found) and return 404 with appropriate message
    - Catch other Prisma errors and pass to global error handler
    - _Requirements: 10.2, 10.3_

  - [ ]* 10.4 Write integration tests for complete request flow
    - Test complete request flow through all middleware layers (CORS, body parser, logger, auth, route handler, error handler)
    - Test database connectivity and error handling
    - Test logging at info, warn, and error levels
    - Verify all operations are logged with correct format
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [ ]* 10.5 Write property tests for error handling
    - **Property 16: Error Response Format Consistency**
    - **Validates: Requirements 10.1, 10.2, 10.4**
    - Generate various error conditions, verify consistent format and status codes
    - **Property 17: Multiple Validation Errors Aggregation**
    - **Validates: Requirements 10.5**
    - Submit requests with multiple validation errors, verify all returned in single response
    - **Property 18: ISO 8601 Date Serialization**
    - **Validates: Requirements 14.7**
    - Create/update resources with dates, verify ISO 8601 format in all responses

- [ ] 11. Final Testing and Verification
  - [ ]* 11.1 Run full test suite and verify coverage
    - Run all unit tests with coverage report
    - Run all property tests with 100+ iterations
    - Run all integration tests
    - Verify >90% code coverage overall
    - Verify 100% coverage for authentication and ownership verification
    - _Requirements: All_

  - [ ]* 11.2 Manual testing with API client
    - Test all endpoints manually using Postman or curl
    - Test happy paths for all CRUD operations
    - Test error cases (invalid tokens, missing fields, wrong ownership)
    - Test edge cases (empty arrays, null optional fields, long strings)
    - Verify response formats match specification
    - _Requirements: All_

- [ ] 12. Documentation
  - [ ] 12.1 Update API documentation with endpoint details
    - Document all endpoints with request/response examples
    - Document authentication requirements (Authorization header format)
    - Document error responses and status codes
    - Document validation rules for each resource type
    - Document nested structure formats (subtasks, resourceLinks)
    - Create example curl commands for each endpoint

  - [ ] 12.2 Create migration guide
    - Document how to run migrations in development: `npx prisma migrate dev`
    - Document how to run migrations in production: `npx prisma migrate deploy`
    - Document rollback procedure if needed
    - List all environment variables required (DATABASE_URL, JWT_SECRET)

  - [ ] 12.3 Update README with new endpoints
    - Add section listing all available CRUD endpoints
    - Add authentication setup instructions
    - Add testing instructions (how to run unit tests, property tests, integration tests)
    - Add troubleshooting section for common issues

- [ ] 13. Final checkpoint - Feature complete
  - Ensure all tests pass, documentation is complete, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end flows and infrastructure
- The implementation uses JavaScript/Node.js with Express.js and Prisma ORM
- All routes require JWT authentication via Authorization: Bearer <token> header
- Checkpoints ensure incremental validation and provide opportunities for user feedback
