# Task B4 - Dashboard Aggregation Design

## Architecture Overview

### System Components

```
┌─────────────────┐
│  Mobile App     │
│  (HomeScreen,   │
│  WeeklySummary, │
│  Budgets)       │
└────────┬────────┘
         │ HTTP Requests
         ↓
┌─────────────────────────────────────┐
│  Express API Server                 │
│  ┌──────────────────────────────┐  │
│  │  Dashboard Routes            │  │
│  │  - GET /api/dashboard/stats  │  │
│  │  - GET /api/dashboard/weekly │  │
│  │  - GET /api/dashboard/budgets│  │
│  │  - GET /api/dashboard/focus  │  │
│  └──────────────────────────────┘  │
│           ↓                         │
│  ┌──────────────────────────────┐  │
│  │  Dashboard Service           │  │
│  │  (Aggregation Logic)         │  │
│  └──────────────────────────────┘  │
│           ↓                         │
│  ┌──────────────────────────────┐  │
│  │  Prisma Client               │  │
│  │  (Database Queries)          │  │
│  └──────────────────────────────┘  │
└─────────────────┬───────────────────┘
                  │
                  ↓
          ┌──────────────┐
          │   SQLite DB  │
          │   (Tasks,    │
          │   Events,    │
          │   Expenses)  │
          └──────────────┘
```

## API Design

### Endpoint Structure

**Base Path:** `/api/dashboard`

All endpoints:
- Require authentication (JWT token)
- Return JSON responses
- Use standard HTTP status codes
- Include proper error handling

### Route Definitions

#### 1. Dashboard Statistics
```javascript
GET /api/dashboard/stats
```

**Authentication:** Required  
**Query Parameters:** None  
**Response:** 200 OK

```json
{
  "tasksDue": {
    "today": 3,
    "thisWeek": 12,
    "overdue": 2
  },
  "nextEvent": {
    "daysUntil": 15,
    "title": "Project Deadline",
    "date": "2026-07-22"
  },
  "streak": {
    "current": 7,
    "longest": 14,
    "lastCompletionDate": "2026-07-06"
  },
  "spending": {
    "thisWeek": 450.00,
    "thisMonth": 1850.00,
    "lastWeek": 380.00
  }
}
```

#### 2. Weekly Summary
```javascript
GET /api/dashboard/weekly-summary
```

**Authentication:** Required  
**Query Parameters:**
- `week` (optional): ISO week string (e.g., "2026-W27"), defaults to current week

**Response:** 200 OK

#### 3. Budget Status
```javascript
GET /api/dashboard/budgets
```

**Authentication:** Required  
**Query Parameters:**
- `month` (optional): Month string (e.g., "2026-07"), defaults to current month

**Response:** 200 OK

#### 4. Focus Analytics
```javascript
GET /api/dashboard/focus-stats
```

**Authentication:** Required  
**Query Parameters:**
- `period` (optional): "day" | "week" | "month", defaults to "week"

**Response:** 200 OK

## Database Queries

### Query Strategy

**Principles:**
1. Use Prisma aggregation functions (count, sum, avg, min, max)
2. Filter by userId and date ranges in a single query
3. Minimize number of database round trips
4. Use appropriate indexes for performance

### Key Queries

#### Tasks Due Statistics
```javascript
// Tasks due today
await prisma.task.count({
  where: {
    userId,
    status: 'pending',
    dueDate: {
      gte: startOfDay(today),
      lte: endOfDay(today)
    }
  }
});

// Tasks due this week
await prisma.task.count({
  where: {
    userId,
    status: 'pending',
    dueDate: {
      gte: startOfWeek(today),
      lte: endOfWeek(today)
    }
  }
});

// Overdue tasks
await prisma.task.count({
  where: {
    userId,
    status: 'pending',
    dueDate: {
      lt: startOfDay(today)
    }
  }
});
```

#### Next Event Calculation
```javascript
// Find next upcoming event
await prisma.event.findFirst({
  where: {
    userId,
    eventDate: {
      gte: new Date()
    }
  },
  orderBy: {
    eventDate: 'asc'
  },
  select: {
    title: true,
    eventDate: true
  }
});
```

#### Streak Calculation
```javascript
// Get all completed tasks ordered by completion date
const completedTasks = await prisma.task.findMany({
  where: {
    userId,
    status: 'completed',
    updatedAt: { gte: subDays(new Date(), 90) } // Last 90 days
  },
  orderBy: {
    updatedAt: 'desc'
  },
  select: {
    updatedAt: true
  }
});

// Calculate streak in application logic
// (Check consecutive days with at least one completion)
```

#### Spending Aggregation
```javascript
// This week spending
await prisma.expense.aggregate({
  where: {
    userId,
    direction: 'debit',
    occurredAt: {
      gte: startOfWeek(today),
      lte: endOfWeek(today)
    }
  },
  _sum: {
    amount: true
  }
});

// By category
await prisma.expense.groupBy({
  by: ['categoryId'],
  where: {
    userId,
    direction: 'debit',
    occurredAt: {
      gte: startOfWeek(today),
      lte: endOfWeek(today)
    }
  },
  _sum: {
    amount: true
  }
});
```

#### Budget Tracking
```javascript
// Get all budgets with spending
const budgets = await prisma.budget.findMany({
  where: { userId },
  include: {
    category: true
  }
});

// For each budget, calculate spending
for (const budget of budgets) {
  const spent = await prisma.expense.aggregate({
    where: {
      userId,
      categoryId: budget.categoryId,
      direction: 'debit',
      occurredAt: {
        gte: startOfMonth(today),
        lte: endOfMonth(today)
      }
    },
    _sum: { amount: true }
  });
}
```

#### Focus Analytics
```javascript
// Focus sessions this week
await prisma.focusSession.findMany({
  where: {
    userId,
    startedAt: {
      gte: startOfWeek(today),
      lte: endOfWeek(today)
    },
    endedAt: { not: null } // Only completed sessions
  },
  include: {
    focusLink: true
  }
});

// Group by link
await prisma.focusSession.groupBy({
  by: ['focusLinkId'],
  where: {
    userId,
    startedAt: {
      gte: startOfWeek(today),
      lte: endOfWeek(today)
    },
    endedAt: { not: null }
  },
  _sum: {
    duration: true // Assuming duration field exists
  },
  _count: true
});
```

## Service Layer Design

### Dashboard Service (`src/services/dashboardService.js`)

**Purpose:** Encapsulate all aggregation logic and business rules

**Functions:**

```javascript
// Get dashboard statistics
async function getDashboardStats(userId) {
  // 1. Get tasks due counts
  // 2. Get next event
  // 3. Calculate streak
  // 4. Get spending totals
  // Return aggregated object
}

// Get weekly summary
async function getWeeklySummary(userId, weekString) {
  // 1. Parse week string to date range
  // 2. Get task analytics
  // 3. Get spending by category
  // 4. Get focus analytics
  // 5. Calculate comparisons
  // 6. Generate insights
  // Return summary object
}

// Get budget status
async function getBudgetStatus(userId, monthString) {
  // 1. Parse month to date range
  // 2. Get all budgets
  // 3. Calculate spending per category
  // 4. Calculate percentages and status
  // 5. Sort by status (exceeded first)
  // Return budget array
}

// Get focus analytics
async function getFocusAnalytics(userId, period) {
  // 1. Determine date range from period
  // 2. Get all sessions in range
  // 3. Calculate totals and averages
  // 4. Group by link
  // 5. Calculate streak
  // Return analytics object
}
```

### Utility Functions

```javascript
// Calculate task completion streak
function calculateStreak(completedTasks) {
  // Algorithm:
  // 1. Group tasks by completion date
  // 2. Check consecutive days
  // 3. Stop at first gap
  // 4. Return current and longest streak
}

// Generate weekly insights
function generateInsights(summary) {
  const insights = [];
  
  // Task completion insights
  if (summary.tasks.comparison.percentChange > 10) {
    insights.push(`🎉 Great week! You completed ${summary.tasks.comparison.percentChange}% more tasks than last week.`);
  }
  
  // Spending insights
  if (summary.expenses.comparison.percentChange > 20) {
    insights.push(`💰 Your spending increased by $${summary.expenses.comparison.change.toFixed(2)} this week.`);
  }
  
  // Streak insights
  if (summary.streak && summary.streak.current >= 7) {
    insights.push(`🔥 You maintained your ${summary.streak.current}-day streak!`);
  }
  
  return insights;
}

// Format currency
function formatCurrency(amount) {
  return parseFloat(amount).toFixed(2);
}

// Get budget status
function getBudgetStatusLabel(percentUsed) {
  if (percentUsed >= 100) return 'exceeded';
  if (percentUsed >= 90) return 'warning';
  return 'on-track';
}
```

## Route Handler Design

### Dashboard Routes (`src/routes/dashboard.js`)

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const dashboardService = require('../services/dashboardService');

// All routes require authentication
router.use(authenticate);

// GET /api/dashboard/stats
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await dashboardService.getDashboardStats(userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/weekly-summary
router.get('/weekly-summary', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const week = req.query.week; // Optional
    const summary = await dashboardService.getWeeklySummary(userId, week);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/budgets
router.get('/budgets', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const month = req.query.month; // Optional
    const budgets = await dashboardService.getBudgetStatus(userId, month);
    res.json(budgets);
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/focus-stats
router.get('/focus-stats', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || 'week';
    const stats = await dashboardService.getFocusAnalytics(userId, period);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

## Error Handling

### Expected Errors

| Error | Status Code | Response |
|-------|-------------|----------|
| Unauthenticated | 401 | `{ "error": "Authentication required" }` |
| Invalid week format | 400 | `{ "error": "Invalid week format. Use ISO week (e.g., 2026-W27)" }` |
| Invalid month format | 400 | `{ "error": "Invalid month format. Use YYYY-MM" }` |
| Invalid period | 400 | `{ "error": "Period must be day, week, or month" }` |
| Database error | 500 | `{ "error": "Failed to fetch dashboard data" }` |

## Date/Time Handling

### Standards
- Use ISO 8601 for all date formats
- Weeks start on Monday (ISO week date system)
- Months follow calendar months (1st to last day)
- Timezone: Server uses UTC, convert for user display

### Libraries
- **date-fns**: For all date calculations
  - `startOfWeek`, `endOfWeek`
  - `startOfMonth`, `endOfMonth`
  - `startOfDay`, `endOfDay`
  - `differenceInDays`
  - `parseISO`, `format`

### Week String Format
```javascript
// Week string: "2026-W27"
// Parse to date range:
const weekNumber = 27;
const year = 2026;
const firstDayOfWeek = startOfWeek(
  new Date(year, 0, 1 + (weekNumber - 1) * 7),
  { weekStartsOn: 1 } // Monday
);
```

## Performance Optimization

### Strategies

1. **Batch Queries**: Execute independent queries in parallel using `Promise.all()`
2. **Selective Fields**: Only select needed fields with Prisma's `select`
3. **Aggregation**: Use database aggregation instead of fetching all records
4. **Indexes**: Ensure indexes on userId, dueDate, occurredAt, eventDate
5. **Limit Historical Data**: Only query recent data (e.g., last 90 days for streaks)

### Example Parallel Execution
```javascript
async function getDashboardStats(userId) {
  const [tasksDue, nextEvent, streak, spending] = await Promise.all([
    getTasksDueStats(userId),
    getNextEvent(userId),
    calculateStreak(userId),
    getSpendingStats(userId)
  ]);
  
  return { tasksDue, nextEvent, streak, spending };
}
```

## Testing Strategy

### Unit Tests
- Test streak calculation with various completion patterns
- Test week parsing and date range generation
- Test budget status calculation
- Test insight generation logic

### Integration Tests
- Test each endpoint with authenticated requests
- Verify correct data aggregation
- Test date range filtering
- Test error handling

### Test Data
- Create users with known task/expense patterns
- Verify calculations against manual counts
- Test edge cases (no data, single data point, large datasets)

## Mobile Integration

### API Service Extension

Add to `mobile-fixed/src/services/api.js`:

```javascript
export const dashboardApi = {
  async getStats() {
    return apiCall('/dashboard/stats');
  },
  
  async getWeeklySummary(week) {
    const params = week ? `?week=${week}` : '';
    return apiCall(`/dashboard/weekly-summary${params}`);
  },
  
  async getBudgets(month) {
    const params = month ? `?month=${month}` : '';
    return apiCall(`/dashboard/budgets${params}`);
  },
  
  async getFocusStats(period = 'week') {
    return apiCall(`/dashboard/focus-stats?period=${period}`);
  }
};
```

### Screen Updates

**HomeScreen:**
- Replace hardcoded stats with `dashboardApi.getStats()`
- Update stat cards with real data
- Add loading state while fetching
- Refresh on screen focus

**WeeklySummaryScreen:**
- Fetch data with `dashboardApi.getWeeklySummary()`
- Display task completion metrics
- Show spending breakdown
- Display week-over-week comparison

**BudgetsScreen:**
- Fetch data with `dashboardApi.getBudgets()`
- Display budget progress bars
- Show warning/exceeded status
- Color-code by status

**FocusScreen:**
- Fetch data with `dashboardApi.getFocusStats()`
- Display streak and totals
- Show breakdown by link
- Add period selector (day/week/month)

## Deployment Considerations

### Environment
- No new environment variables needed
- Uses existing database connection
- Uses existing authentication

### Migration
- No database schema changes
- No migrations required
- Backward compatible

### Monitoring
- Log slow queries (>500ms)
- Track endpoint usage
- Monitor error rates
- Alert on aggregation failures

## Future Enhancements

### Phase 2 (Post-MVP)
- Caching layer for frequently accessed stats
- WebSocket for real-time updates
- Customizable dashboard widgets
- Export analytics as PDF/CSV
- Historical trend charts (6 months)
- Goal setting and tracking
- AI-powered insights and predictions

### Performance Improvements
- Redis cache for dashboard stats (5-minute TTL)
- Materialized views for complex aggregations
- Background jobs for expensive calculations
- GraphQL API for flexible data fetching

## Success Metrics

### Performance Targets
- Dashboard stats endpoint: < 500ms response time
- Weekly summary endpoint: < 1000ms response time
- Budget status endpoint: < 300ms response time
- Focus analytics endpoint: < 400ms response time

### Quality Targets
- 100% calculation accuracy
- Zero downtime during deployment
- < 1% error rate
- Full test coverage for business logic

### User Experience
- Instant dashboard load on app launch
- Smooth navigation between analytics screens
- Clear, actionable insights
- Beautiful data visualization (mobile side)
