# Backend Authentication - Quick Start Guide

Get the DayFlow backend authentication system running in 5 minutes! 🚀

---

## Prerequisites

- Node.js v18+ installed
- PostgreSQL 13+ (or Docker)

---

## Step 1: Install PostgreSQL with Docker (Easiest)

```bash
# Pull PostgreSQL image
docker pull postgres:15

# Run PostgreSQL container
docker run --name dayflow-postgres \
  -e POSTGRES_PASSWORD=dayflow123 \
  -e POSTGRES_USER=dayflow \
  -e POSTGRES_DB=dayflow_dev \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

---

## Step 2: Configure Environment

Create `.env` file in `backend/` directory:

```bash
cd taskmanager1/backend
```

Create `.env` file with this content:

```env
# Database
DATABASE_URL="postgresql://dayflow:dayflow123@localhost:5432/dayflow_dev"

# JWT Secret (replace with your own random string)
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"

# Server
PORT=3000
NODE_ENV=development
```

**🔐 Generate secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 3: Install Dependencies

```bash
npm install
```

---

## Step 4: Run Database Migration

```bash
npm run migrate
```

Expected output:
```
✔ Generated Prisma Client
✔ Applied migration: 20250107_init
```

---

## Step 5: Start the Server

```bash
npm run dev
```

Expected output:
```
[INFO] Environment variables validated successfully
[INFO] Database connected successfully
[INFO] Server running on port 3000
[INFO] Environment: development
[INFO] CORS: Permissive (*)
```

🎉 **Server is now running at http://localhost:3000**

---

## Test the API

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-07T10:30:15.123Z"
}
```

---

### Test 2: Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

**Expected response (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Test User",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Test 3: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

**Expected response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Test User",
    "email": "test@example.com",
    "avatarUrl": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Test 4: Verify Database

```bash
# Connect to PostgreSQL
docker exec -it dayflow-postgres psql -U dayflow -d dayflow_dev

# Check users table
SELECT id, email, name, created_at FROM users;

# Verify password is hashed (should start with $2a$ or $2b$)
SELECT substring(password, 1, 10) FROM users;

# Exit
\q
```

---

## Common Issues

### 🐛 "Port 3000 already in use"

**Solution:** Change port in `.env`:
```env
PORT=3001
```

---

### 🐛 "Database connection failed"

**Solution 1:** Check PostgreSQL is running:
```bash
docker ps
```

**Solution 2:** Verify DATABASE_URL in `.env` matches your PostgreSQL credentials

**Solution 3:** Test connection manually:
```bash
docker exec -it dayflow-postgres psql -U dayflow -d dayflow_dev -c "SELECT 1"
```

---

### 🐛 "Migration failed"

**Solution:** Reset database (this deletes all data):
```bash
npx prisma migrate reset
npm run migrate
```

---

### 🐛 "JWT_SECRET must be at least 32 characters"

**Solution:** Generate a longer secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste into `.env` as `JWT_SECRET`

---

## Stop the Server

Press `Ctrl+C` in the terminal running the server.

To stop PostgreSQL:
```bash
docker stop dayflow-postgres
```

To start PostgreSQL again:
```bash
docker start dayflow-postgres
```

---

## Next Steps

Once everything is working:
1. ✅ Backend authentication is complete
2. ⏭️ Move to Task B2: Protected endpoints (tasks CRUD)
3. ⏭️ Connect mobile app to backend
4. ⏭️ Deploy to production

---

## Need Help?

- **Full Documentation:** See `README.md`
- **Requirements:** See `.kiro/specs/backend-auth/requirements.md`
- **Design:** See `.kiro/specs/backend-auth/design.md`
- **Implementation:** See `.kiro/specs/backend-auth/tasks.md`

---

**Tip:** Use Postman or Insomnia for easier API testing with a GUI!

🎉 Happy coding!
