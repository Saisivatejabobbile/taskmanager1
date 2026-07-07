# DayFlow Backend Authentication System

Backend authentication system for DayFlow task management app with Express, Prisma, and PostgreSQL.

## Features

- ✅ User registration with email and password
- ✅ User login with JWT token generation
- ✅ Secure password hashing with bcrypt
- ✅ JWT-based session management (7-day expiration)
- ✅ Input validation and error handling
- ✅ PostgreSQL database with Prisma ORM
- ✅ RESTful API with Express

## Requirements

- Node.js v18.0.0 or higher
- PostgreSQL 13 or higher
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your configuration:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing (min 32 characters, cryptographically random)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### 3. Run Database Migrations

```bash
npm run migrate
```

This will:
- Create the database schema
- Generate Prisma Client

### 4. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

### 5. Start Production Server

```bash
npm start
```

## API Endpoints

### POST /api/auth/register

Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (201):**
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
- `400` - Validation error (missing/invalid fields)
- `409` - Email already registered
- `500` - Server error

### POST /api/auth/login

Authenticate an existing user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
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
- `400` - Validation error (missing/invalid fields)
- `401` - Invalid credentials
- `500` - Server error

### GET /health

Health check endpoint.

**Success Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-01-07T10:30:15.123Z"
}
```

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Project Structure

```
backend/
├── src/
│   ├── index.js              # Application entry point
│   ├── config/
│   │   └── database.js       # Prisma client configuration
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
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── tests/
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
├── .env.example              # Example environment variables
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Security

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens are signed with HS256 algorithm
- Tokens expire after 7 days
- All inputs are validated before processing
- Sensitive data is never logged or exposed in responses
- Use HTTPS in production
- Store JWT_SECRET securely (AWS Secrets Manager, etc.)

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
1. Verify PostgreSQL is running
2. Check DATABASE_URL in .env file
3. Ensure database exists
4. Check firewall/network settings

### Migration Errors

If migrations fail:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npm run prisma:generate
```

### Port Already in Use

If port 3000 is already in use:
1. Change PORT in .env file
2. Or stop the process using port 3000

## Development

### Adding New Endpoints

1. Create route handler in `src/routes/`
2. Add validation logic in `src/services/validation.js`
3. Mount route in `src/index.js`
4. Add tests in `tests/integration/`

### Database Schema Changes

1. Update `prisma/schema.prisma`
2. Run `npm run migrate` to create migration
3. Prisma Client will auto-regenerate

## License

(To be determined)

## Support

For issues and questions, please check:
- Requirements document: `.kiro/specs/backend-auth/requirements.md`
- Design document: `.kiro/specs/backend-auth/design.md`
- GitHub issues: (repository URL)
