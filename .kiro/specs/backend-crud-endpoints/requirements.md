# Requirements Document

## Introduction

The DayFlow mobile app currently operates with local mock data storage. To enable multi-device synchronization and persistent data storage, we need to create protected RESTful API endpoints for Tasks, Calendar Events, Expenses, and Categories. These endpoints will integrate with the existing JWT authentication system (Task B1) and ensure users can only access their own data. The mobile app will transition from local mock data to backend API calls, enabling data persistence across app restarts and synchronization across multiple devices for the same user.

## Glossary

- **API**: The DayFlow Backend REST API that provides CRUD endpoints
- **JWT_Token**: JSON Web Token for authenticating API requests
- **User**: An authenticated user with a valid JWT token
- **Task**: A to-do item with title, notes, due date, priority, category, status, recurrence, resource links, and subtasks
- **Event**: A calendar event with title, date, alert settings, yearly repeat option, and category
- **Expense**: A financial transaction with amount, direction (debit/credit), category, note, timestamp, and recurrence
- **Category**: A classification for tasks or expenses with name, type, and color
- **Subtask**: A nested checklist item within a Task
- **Resource_Link**: A URL reference attached to a Task
- **Database**: The SQLite database managed by Prisma ORM
- **Authorization_Header**: HTTP header containing "Bearer <JWT_Token>"
- **Request_Body**: JSON payload sent with POST/PUT requests
- **User_ID**: The unique identifier extracted from the JWT token
- **Foreign_Key**: Database relationship linking resources to their owning user

## Requirements

### Requirement 1: JWT Authentication Enforcement

**User Story:** As a system administrator, I want all data endpoints to require valid JWT tokens, so that only authenticated users can access the API

#### Acceptance Criteria

1. WHEN a request is made to any CRUD endpoint without an Authorization header, THEN THE API SHALL return HTTP status 401 with error message "Authentication required"
2. WHEN a request is made with an invalid JWT_Token, THEN THE API SHALL return HTTP status 401 with error message "Invalid or expired token"
3. WHEN a request is made with a valid JWT_Token, THEN THE API SHALL extract the User_ID from the token and proceed with the request
4. THE API SHALL validate JWT_Token signature using the same JWT_SECRET from the authentication system
5. WHEN a JWT_Token is expired, THEN THE API SHALL return HTTP status 401 with error message "Token expired"

### Requirement 2: Task CRUD Operations

**User Story:** As a mobile app user, I want to create, read, update, and delete tasks via the backend API, so that my tasks persist across devices and app restarts

#### Acceptance Criteria

1. WHEN an authenticated User sends POST /api/tasks with valid Task data, THEN THE API SHALL create a new Task associated with the User_ID and return HTTP status 201 with the created Task
2. WHEN an authenticated User sends GET /api/tasks, THEN THE API SHALL return HTTP status 200 with an array of all Tasks belonging to that User_ID
3. WHEN an authenticated User sends GET /api/tasks/:id for a Task they own, THEN THE API SHALL return HTTP status 200 with the Task details
4. WHEN an authenticated User sends GET /api/tasks/:id for a Task they do not own, THEN THE API SHALL return HTTP status 403 with error message "Access denied"
5. WHEN an authenticated User sends PUT /api/tasks/:id with valid data for a Task they own, THEN THE API SHALL update the Task and return HTTP status 200 with the updated Task
6. WHEN an authenticated User sends PUT /api/tasks/:id for a Task they do not own, THEN THE API SHALL return HTTP status 403 with error message "Access denied"
7. WHEN an authenticated User sends DELETE /api/tasks/:id for a Task they own, THEN THE API SHALL delete the Task and return HTTP status 204
8. WHEN an authenticated User sends DELETE /api/tasks/:id for a Task they do not own, THEN THE API SHALL return HTTP status 403 with error message "Access denied"
9. WHEN a GET /api/tasks/:id request references a non-existent Task ID, THEN THE API SHALL return HTTP status 404 with error message "Task not found"
10. THE API SHALL store Tasks in the Database with a Foreign_Key to the User table

### Requirement 3: Event CRUD Operations

**User Story:** As a mobile app user, I want to create, read, update, and delete calendar events via the backend API, so that my events persist across devices and app restarts

#### Acceptance Criteria

1. WHEN an authenticated User sends POST /api/events with valid Event data, THEN THE API SHALL create a new Event associated with the User_ID and return HTTP status 201 with the created Event
2. WHEN an authenticated User sends GET /api/events, THEN THE API SHALL return HTTP status 200 with an array of all Events belonging to that User_ID
3. WHEN an authenticated User sends GET /api/events/:id for an Event they own, THEN THE API SHALL return HTTP status 200 with the Event details
4. WHEN an authenticated User sends GET /api/events/:id for an Event they do not own, THEN THE API SHALL return HTTP status 403 with error message "Access denied"
5. WHEN an authenticated User sends PUT /api/events/:id with valid data for an Event they own, THEN THE API SHALL update the Event and return HTTP status 200 with the updated Event
6. WHEN an authenticated User sends PUT /api/events/:id for an Event they do not own, THEN THE API SHALL return HTTP status 403 with error message "Access denied"
7. WHEN an authenticated User sends DELETE /api/events/:id for an Event they own, THEN THE API SHALL delete the Event and return HTTP status 204
8. WHEN an authenticated User sends DELETE /api/events/:id for an Event they do not own, THEN THE API SHALL return HTTP status 403 with error message "Access denied"
9. WHEN a GET /api/events/:id request references a non-existent Event ID, THEN THE API SHALL return HTTP status 404 with error message "Event not found"
10. THE API SHALL store Events in the Database with a Foreign_Key to the User table

### Requirement 4: Expense CRUD Operations

**User Story:** As a mobile app user, I want to create, read, update, and delete expenses via the backend API, so that my financial data persists across devices and app restarts

#### Acceptance Criteria

1. WHEN an authenticated User sends POST /api/expenses with valid Expense data, THEN THE API SHALL create a new Expense associated with the User_ID and return HTTP status 201 with the created Expense
2. WHEN an authenticated User sends GET /api/expenses, THEN THE API SHALL return HTTP status 200 with an array of all Expenses belonging to that User_ID
3. WHEN an authenticated User sends GET /api/expenses/:id for an Expense they own, THEN THE API SHALL return HTTP status 200 with the Expense details
4. WHEN an authenticated User sends GET /api/expenses/:id for an Expense they do not own, THEN THE API SHALL return HTTP status 403 with error message "Access denied"
5. WHEN an authenticated User sends PUT /api/expenses/:id with valid data for an Expense they own, THEN THE API SHALL update the Expense and return HTTP status 200 with the updated Expense
6. WHEN an authenticated User sends PUT /api/expenses/:id for an Expense they do not own, THEN THE API SHALL return HTTP status 403 with error message "Access denied"
7. WHEN an authenticated User sends DELETE /api/expenses/:id for an Expense they own, THEN THE API SHALL delete the Expense and return HTTP status 204
8. WHEN an authenticated User sends DELETE /api/expenses/:id for an Expense they do not own, THEN THE API SHALL return HTTP status 403 with error message "Access denied"
9. WHEN a GET /api/expenses/:id request references a non-existent Expense ID, THEN THE API SHALL return HTTP status 404 with error message "Expense not found"
10. THE API SHALL store Expenses in the Database with a Foreign_Key to the User table

### Requirement 5: Category CRUD Operations

**User Story:** As a mobile app user, I want to create, read, update, and delete categories via the backend API, so that I can organize my tasks and expenses consistently across devices

#### Acceptance Criteria

1. WHEN an authenticated User sends POST /api/categories with valid Category data, THEN THE API SHALL create a new Category associated with the User_ID and return HTTP status 201 with the created Category
2. WHEN an authenticated User sends GET /api/categories, THEN THE API SHALL return HTTP status 200 with an array of all Categories belonging to that User_ID
3. WHEN an authenticated User sends GET /api/categories/:id for a Category they own, THEN THE API SHALL return HTTP status 200 with the Category details
4. WHEN an authenticated User sends GET /api/categories/:id for a Category they do not own, THEN THE API SHALL return HTTP status 403 with error message "Access denied"
5. WHEN an authenticated User sends PUT /api/categories/:id with valid data for a Category they own, THEN THE API SHALL update the Category and return HTTP status 200 with the updated Category
6. WHEN an authenticated User sends PUT /api/categories/:id for a Category they do not own, THEN THE API SHALL return HTTP status 403 with error message "Access denied"
7. WHEN an authenticated User sends DELETE /api/categories/:id for a Category they own, THEN THE API SHALL delete the Category and return HTTP status 204
8. WHEN an authenticated User sends DELETE /api/categories/:id for a Category they do not own, THEN THE API SHALL return HTTP status 403 with error message "Access denied"
9. WHEN a GET /api/categories/:id request references a non-existent Category ID, THEN THE API SHALL return HTTP status 404 with error message "Category not found"
10. THE API SHALL store Categories in the Database with a Foreign_Key to the User table

### Requirement 6: Request Body Validation

**User Story:** As a system administrator, I want all incoming data to be validated, so that invalid data cannot be stored in the database

#### Acceptance Criteria

1. WHEN a POST or PUT request contains missing required fields, THEN THE API SHALL return HTTP status 400 with error message listing the missing fields
2. WHEN a Task Request_Body contains invalid priority value (not 'high', 'medium', or 'low'), THEN THE API SHALL return HTTP status 400 with error message "Invalid priority value"
3. WHEN a Task Request_Body contains invalid status value (not 'pending' or 'completed'), THEN THE API SHALL return HTTP status 400 with error message "Invalid status value"
4. WHEN an Event Request_Body contains negative alertDaysBefore value, THEN THE API SHALL return HTTP status 400 with error message "Alert days must be non-negative"
5. WHEN an Expense Request_Body contains invalid direction value (not 'debit' or 'credit'), THEN THE API SHALL return HTTP status 400 with error message "Invalid direction value"
6. WHEN an Expense Request_Body contains negative amount, THEN THE API SHALL return HTTP status 400 with error message "Amount must be positive"
7. WHEN a Category Request_Body contains invalid type value (not 'task' or 'expense'), THEN THE API SHALL return HTTP status 400 with error message "Invalid category type"
8. WHEN a Request_Body contains invalid date format, THEN THE API SHALL return HTTP status 400 with error message "Invalid date format"
9. WHEN a Request_Body contains fields exceeding maximum length (title > 200 chars, note > 2000 chars), THEN THE API SHALL return HTTP status 400 with error message indicating the field and limit
10. THE API SHALL trim whitespace from string fields before validation

### Requirement 7: Task Data Structure Support

**User Story:** As a mobile app developer, I want the API to support the complete Task data structure including nested subtasks and resource links, so that all features work correctly

#### Acceptance Criteria

1. WHEN creating or updating a Task, THE API SHALL accept and store an array of Subtask objects with id, title, and done fields
2. WHEN creating or updating a Task, THE API SHALL accept and store an array of Resource_Link objects with url and label fields
3. WHEN creating or updating a Task, THE API SHALL accept and store recurrenceRule as a string in iCalendar RRULE format or null
4. WHEN retrieving a Task, THE API SHALL return the complete Task object including all Subtask and Resource_Link arrays
5. THE API SHALL validate that each Subtask has required fields (id, title, done)
6. THE API SHALL validate that each Resource_Link has required fields (url, label)
7. WHEN a Request_Body contains invalid URL format in Resource_Link, THEN THE API SHALL return HTTP status 400 with error message "Invalid URL format"
8. THE API SHALL store Subtask and Resource_Link data as JSON fields in the Task table

### Requirement 8: Event Data Structure Support

**User Story:** As a mobile app developer, I want the API to support the complete Event data structure including yearly repetition, so that calendar features work correctly

#### Acceptance Criteria

1. WHEN creating or updating an Event, THE API SHALL accept and store repeatsYearly as a boolean value
2. WHEN creating or updating an Event, THE API SHALL accept and store alertDaysBefore as an integer
3. WHEN creating or updating an Event, THE API SHALL accept and store category as a string
4. WHEN creating or updating an Event, THE API SHALL accept and store eventDate as an ISO 8601 date string
5. WHEN retrieving an Event, THE API SHALL return the complete Event object with all fields

### Requirement 9: Expense Data Structure Support

**User Story:** As a mobile app developer, I want the API to support the complete Expense data structure including recurrence rules, so that recurring expenses work correctly

#### Acceptance Criteria

1. WHEN creating or updating an Expense, THE API SHALL accept and store recurrenceRule as a string in iCalendar RRULE format or null
2. WHEN creating or updating an Expense, THE API SHALL accept and store direction as either 'debit' or 'credit'
3. WHEN creating or updating an Expense, THE API SHALL accept and store categoryId as a string or null (for uncategorized expenses)
4. WHEN creating or updating an Expense, THE API SHALL accept and store occurredAt as an ISO 8601 date string
5. WHEN retrieving an Expense, THE API SHALL return the complete Expense object with all fields

### Requirement 10: Error Response Consistency

**User Story:** As a mobile app developer, I want all error responses to follow a consistent format, so that I can handle errors uniformly in the client code

#### Acceptance Criteria

1. WHEN any error occurs, THE API SHALL return a JSON response with an "error" field containing a descriptive message
2. THE API SHALL use appropriate HTTP status codes (400 for validation errors, 401 for authentication errors, 403 for authorization errors, 404 for not found, 500 for server errors)
3. WHEN a server error occurs, THE API SHALL log the full error stack trace but return only a generic error message to the client
4. THE API SHALL return error responses in the format: `{"error": "Error message"}`
5. WHEN multiple validation errors exist, THE API SHALL return all errors in a single response

### Requirement 11: Database Schema Design

**User Story:** As a database administrator, I want the database schema to efficiently store all resource types with proper relationships, so that data integrity is maintained

#### Acceptance Criteria

1. THE Database SHALL have a Task table with columns for id, userId (Foreign_Key), title, notes, dueDate, priority, categoryId, status, recurrenceRule, resourceLinks (JSON), subtasks (JSON), createdAt, updatedAt
2. THE Database SHALL have an Event table with columns for id, userId (Foreign_Key), title, eventDate, alertDaysBefore, repeatsYearly, category, createdAt, updatedAt
3. THE Database SHALL have an Expense table with columns for id, userId (Foreign_Key), amount, direction, categoryId, note, occurredAt, recurrenceRule, createdAt, updatedAt
4. THE Database SHALL have a Category table with columns for id, userId (Foreign_Key), name, type, color, createdAt, updatedAt
5. THE Database SHALL enforce Foreign_Key constraints to the User table for all resource tables
6. THE Database SHALL use UUID format for all id fields
7. THE Database SHALL automatically set createdAt timestamp when a record is created
8. THE Database SHALL automatically update updatedAt timestamp when a record is modified
9. THE Database SHALL create indexes on userId fields for efficient querying
10. THE Database SHALL allow null values for optional fields (categoryId, recurrenceRule, resourceLinks, subtasks)

### Requirement 12: Authentication Middleware Integration

**User Story:** As a backend developer, I want reusable authentication middleware, so that I can protect routes consistently without duplicating code

#### Acceptance Criteria

1. THE API SHALL implement an authentication middleware function that extracts and validates JWT_Token from Authorization_Header
2. WHEN the middleware validates a JWT_Token successfully, THE middleware SHALL attach the User_ID to the request object for use by route handlers
3. WHEN the middleware encounters an invalid token, THE middleware SHALL call the error handler with appropriate error information
4. THE middleware SHALL be applied to all routes except /health and root endpoints
5. THE middleware SHALL support the "Bearer <token>" format in the Authorization_Header
6. THE middleware SHALL handle missing Authorization_Header by returning HTTP status 401

### Requirement 13: Data Ownership Verification

**User Story:** As a security engineer, I want all resource access to be verified against the authenticated user, so that users cannot access or modify other users' data

#### Acceptance Criteria

1. WHEN a User requests a resource by ID, THE API SHALL verify that the resource's userId matches the authenticated User_ID before returning data
2. WHEN a User attempts to access a resource they do not own, THE API SHALL return HTTP status 403 without revealing whether the resource exists
3. WHEN a User creates a resource, THE API SHALL automatically set the userId field to the authenticated User_ID
4. THE API SHALL ignore any userId field provided in the Request_Body and always use the authenticated User_ID
5. WHEN a User updates a resource, THE API SHALL verify ownership before applying changes

### Requirement 14: API Response Format

**User Story:** As a mobile app developer, I want consistent response formats for all successful operations, so that I can parse responses reliably

#### Acceptance Criteria

1. WHEN a POST request creates a resource, THE API SHALL return the complete created resource including all generated fields (id, createdAt, updatedAt)
2. WHEN a GET request retrieves a single resource, THE API SHALL return the complete resource object
3. WHEN a GET request retrieves multiple resources, THE API SHALL return an array of resource objects
4. WHEN a PUT request updates a resource, THE API SHALL return the complete updated resource including the new updatedAt timestamp
5. WHEN a DELETE request succeeds, THE API SHALL return an empty response body with HTTP status 204
6. THE API SHALL exclude sensitive fields (password, internal IDs) from all responses
7. THE API SHALL return dates in ISO 8601 format

### Requirement 15: Logging and Monitoring

**User Story:** As a system administrator, I want comprehensive logging of API operations, so that I can troubleshoot issues and monitor system health

#### Acceptance Criteria

1. WHEN any CRUD operation is performed, THE API SHALL log the operation type, resource type, User_ID, and timestamp
2. WHEN an authorization failure occurs, THE API SHALL log the User_ID, resource type, resource ID, and reason
3. WHEN a validation error occurs, THE API SHALL log the error details and request payload
4. WHEN a server error occurs, THE API SHALL log the full error stack trace
5. THE API SHALL use the existing logger utility for consistent log formatting
6. THE API SHALL log at appropriate levels (info for successful operations, warn for authorization failures, error for server errors)

