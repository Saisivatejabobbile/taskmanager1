# Task B4 - Dashboard Aggregation Implementation Tasks

## Overview
Implement backend API endpoints for dashboard statistics, weekly summaries, budget tracking, and focus analytics.

---

## Task 1: Dashboard Service Foundation
**Status:** pending  
**Estimated Time:** 15 minutes

### Description
Create the dashboard service layer with date utility functions and basic structure.

### Implementation Steps
1. Create `backend/src/services/dashboardService.js`
2. Add date utility functions:
   - `getDateRangeForWeek(weekString)`
   - `getDateRangeForMonth(monthString)`
   - `getCurrentWeekString()`
   - `getCurrentMonthString()`
3. Add helper functions:
   - `calculateStreak(completedTasks)`
   - `formatCurrency(amount)`
   - `getBudgetStatusLabel(percentUsed)`
   - `generateInsights(summary)`
4. Add error handling utilities

### Files to Create
- `backend/src/services/dashboardService.js`

### Testing
- Test date parsing with various week/month strings
- Test streak calculation with sample completion patterns
- Test budget status labeling (on-track, warning, exceeded)

### Success Criteria
- [x] Service file created with helper functions
- [x] Date utilities handle edge cases
- [x] Currency formatting accurate to 2 decimals
- [x] Streak calculation works for consecutive days

---

## Task 2: Dashboard Statistics Endpoint
**Status:** pending  
**Estimated Time:** 15 minutes

### Description
Implement the main dashboard statistics endpoint that provides task counts, next event, streak, and spending totals.

### Implementation Steps
1. Add `getDashboardStats(userId)` to dashboard service:
   - Query tasks due (today, this week, overdue)
   - Find next upcoming event with days until
   - Calculate current and longest streak
   - Aggregate spending (this week, this month, last week)
2. Create `backend/src/routes/dashboard.js`
3. Add `GET /api/dashboard/stats` route
4. Mount dashboard routes in `backend/src/index.js`

### Database Queries
```javascript
// Tasks due today
prisma.task.count({
  where: {
    userId,
    status: 'pending',
    dueDate: { gte: startOfDay, lte: endOfDay }
  }
});

// Next event
prisma.event.findFirst({
  where: { userId, eventDate: { gte: new Date() } },
  orderBy: { eventDate: 'asc' }
});

// Recent completions for streak
prisma.task.findMany({
  where: { userId, status: 'completed', updatedAt: { gte: last90Days } },
  orderBy: { updatedAt: 'desc' },
  select: { updatedAt: true }
});

// Spending this week
prisma.expense.aggregate({
  where: { userId, direction: 'debit', occurredAt: { gte: startOfWeek, lte: endOfWeek } },
  _sum: { amount: true }
});
```

### Files to Create/Modify
- Create: `backend/src/routes/dashboard.js`
- Modify: `backend/src/services/dashboardService.js`
- Modify: `backend/src/index.js`

### Testing
- Test with authenticated user
- Verify task counts match database
- Verify next event calculation
- Test with no upcoming events
- Test streak with various completion patterns
- Verify spending totals

### Success Criteria
- [x] Endpoint returns accurate task counts
- [x] Next event calculation includes days until
- [x] Streak calculation works correctly
- [x] Spending totals accurate
- [x] Response time < 500ms

---

## Task 3: Weekly Summary Endpoint
**Status:** pending  
**Estimated Time:** 20 minutes

### Description
Implement weekly summary endpoint with task analytics, spending breakdown, focus stats, and insights.

### Implementation Steps
1. Add `getWeeklySummary(userId, weekString)` to dashboard service:
   - Parse week string or default to current week
   - Get task completion stats (completed, created, by priority)
   - Get previous week data for comparison
   - Get spending by category
   - Get focus session analytics
   - Generate insights based on data
2. Add `GET /api/dashboard/weekly-summary` route

### Database Queries
```javascript
// Tasks completed this week
prisma.task.count({
  where: {
    userId,
    status: 'completed',
    updatedAt: { gte: weekStart, lte: weekEnd }
  }
});

// Group by priority
prisma.task.groupBy({
  by: ['priority'],
  where: {
    userId,
    status: 'completed',
    updatedAt: { gte: weekStart, lte: weekEnd }
  },
  _count: true
});

// Spending by category
prisma.expense.groupBy({
  by: ['categoryId'],
  where: {
    userId,
    direction: 'debit',
    occurredAt: { gte: weekStart, lte: weekEnd }
  },
  _sum: { amount: true },
  include: { category: { select: { name: true } } }
});

// Focus sessions
prisma.focusSession.findMany({
  where: {
    userId,
    startedAt: { gte: weekStart, lte: weekEnd },
    endedAt: { not: null }
  },
  include: { focusLink: true }
});
```

### Insight Generation Logic
- Compare to previous week (tasks, spending)
- Celebrate improvements (20%+ increase)
- Warn about negative trends
- Highlight streak maintenance
- Identify top spending categories

### Files to Modify
- `backend/src/services/dashboardService.js`
- `backend/src/routes/dashboard.js`

### Testing
- Test with week parameter
- Test without week (defaults to current)
- Test with invalid week format
- Verify task analytics accuracy
- Verify spending breakdown
- Test comparison calculations
- Verify insights generation

### Success Criteria
- [x] Endpoint accepts week parameter
- [x] Task analytics accurate
- [x] Spending by category correct
- [x] Week-over-week comparison works
- [x] Insights are relevant and helpful
- [x] Response time < 1000ms

---

## Task 4: Budget Status Endpoint
**Status:** pending  
**Estimated Time:** 15 minutes

### Description
Implement budget tracking endpoint that shows spending vs budgets for all categories.

### Implementation Steps
1. Add `getBudgetStatus(userId, monthString)` to dashboard service:
   - Parse month string or default to current month
   - Get all user budgets with categories
   - For each budget, calculate spending this month
   - Calculate percentage used, remaining, status
   - Calculate days left in month
   - Sort by status (exceeded first, then warning, then on-track)
   - Calculate totals
2. Add `GET /api/dashboard/budgets` route

### Database Queries
```javascript
// All budgets
const budgets = await prisma.budget.findMany({
  where: { userId },
  include: { category: true }
});

// Spending per category
for (const budget of budgets) {
  const result = await prisma.expense.aggregate({
    where: {
      userId,
      categoryId: budget.categoryId,
      direction: 'debit',
      occurredAt: { gte: monthStart, lte: monthEnd }
    },
    _sum: { amount: true }
  });
}
```

### Status Calculation
- **exceeded**: percentUsed >= 100
- **warning**: percentUsed >= 90 && percentUsed < 100
- **on-track**: percentUsed < 90

### Files to Modify
- `backend/src/services/dashboardService.js`
- `backend/src/routes/dashboard.js`

### Testing
- Test with month parameter
- Test without month (defaults to current)
- Test with no budgets
- Test with exceeded budgets
- Verify percentage calculations
- Verify sorting (exceeded first)
- Test totals calculation

### Success Criteria
- [x] Endpoint accepts month parameter
- [x] All budgets returned with spending
- [x] Percentage calculations accurate
- [x] Status labels correct
- [x] Sorted properly (exceeded first)
- [x] Totals calculated correctly
- [x] Response time < 300ms

---

## Task 5: Focus Analytics Endpoint
**Status:** pending  
**Estimated Time:** 10 minutes

### Description
Implement focus analytics endpoint with session statistics and breakdown by link.

### Implementation Steps
1. Add `getFocusAnalytics(userId, period)` to dashboard service:
   - Parse period (day, week, month)
   - Get date range based on period
   - Get all completed focus sessions in range
   - Calculate totals (minutes, sessions, average)
   - Group by focus link
   - Calculate streak (consecutive days with focus)
   - Find records (best day, best week)
2. Add `GET /api/dashboard/focus-stats` route

### Database Queries
```javascript
// All sessions in period
const sessions = await prisma.focusSession.findMany({
  where: {
    userId,
    startedAt: { gte: periodStart, lte: periodEnd },
    endedAt: { not: null }
  },
  include: { focusLink: true },
  orderBy: { startedAt: 'asc' }
});

// Calculate duration for each session
// Group by link
// Calculate daily totals
```

### Calculations
- Total minutes: Sum of all session durations
- Session count: Number of completed sessions
- Average: Total minutes / session count
- By link: Group sessions and sum durations
- Streak: Consecutive days with at least one session
- Best day: Day with most minutes
- Best week: Week with most minutes

### Files to Modify
- `backend/src/services/dashboardService.js`
- `backend/src/routes/dashboard.js`

### Testing
- Test with period=day
- Test with period=week
- Test with period=month
- Test with invalid period
- Verify calculations
- Test with no sessions
- Test streak calculation

### Success Criteria
- [x] Endpoint accepts period parameter
- [x] Calculations accurate for all periods
- [x] Grouped by link correctly
- [x] Streak calculation works
- [x] Records (best day/week) accurate
- [x] Response time < 400ms

---

## Task 6: Mobile Integration - HomeScreen
**Status:** pending  
**Estimated Time:** 10 minutes

### Description
Update HomeScreen to fetch real dashboard statistics from the backend.

### Implementation Steps
1. Add `dashboardApi` to `mobile-fixed/src/services/api.js`:
   ```javascript
   export const dashboardApi = {
     async getStats() {
       return apiCall('/dashboard/stats');
     }
   };
   ```
2. Update `HomeScreen.js`:
   - Import `dashboardApi`
   - Fetch stats on component mount
   - Replace hardcoded numbers with real data
   - Add loading state
   - Handle errors

### Data Mapping
- Tasks Due → `stats.tasksDue.today`
- Days Left → `stats.nextEvent.daysUntil`
- Day Streak → `stats.streak.current`
- This Week → `stats.spending.thisWeek`

### Files to Modify
- `mobile-fixed/src/services/api.js`
- `mobile-fixed/src/screens/home/HomeScreen.js`

### Testing
- Verify stats load on app launch
- Test loading state
- Test with no next event
- Test error handling
- Verify numbers match backend

### Success Criteria
- [x] Real stats displayed on home screen
- [x] Loading state shown while fetching
- [x] Error handling implemented
- [x] Refresh on screen focus
- [x] Numbers accurate

---

## Task 7: Mobile Integration - Weekly Summary
**Status:** pending  
**Estimated Time:** 15 minutes

### Description
Update WeeklySummaryScreen to fetch and display weekly analytics.

### Implementation Steps
1. Add `getWeeklySummary()` to `dashboardApi`
2. Update `WeeklySummaryScreen.js`:
   - Fetch summary on mount
   - Display task completion metrics
   - Show spending breakdown
   - Display week-over-week comparison
   - Show insights as cards
   - Add loading/error states

### UI Components
- **Task Section**: Completed, created, completion rate, by priority
- **Spending Section**: Total, by category chart/list, comparison
- **Focus Section**: Total minutes, sessions, average
- **Insights Section**: Dynamic insight cards with emojis
- **Comparison**: Show percentage change with up/down arrows

### Files to Modify
- `mobile-fixed/src/services/api.js`
- `mobile-fixed/src/screens/home/WeeklySummaryScreen.js`

### Testing
- Verify all sections display
- Test with various data scenarios
- Test insights generation
- Test error handling
- Verify formatting (currency, percentages)

### Success Criteria
- [x] Summary loads from backend
- [x] All sections display correctly
- [x] Insights shown as cards
- [x] Comparison arrows (up/down)
- [x] Beautiful, readable layout

---

## Task 8: Mobile Integration - Budgets
**Status:** pending  
**Estimated Time:** 10 minutes

### Description
Update BudgetsScreen to fetch real budget data with status indicators.

### Implementation Steps
1. Add `getBudgets()` to `dashboardApi`
2. Update `BudgetsScreen.js`:
   - Fetch budget data on mount
   - Display budget cards with progress bars
   - Color-code by status (green=on-track, orange=warning, red=exceeded)
   - Show percentage used
   - Show remaining amount
   - Display totals at top
   - Add loading/error states

### Status Colors
- **on-track**: Green/Success color
- **warning**: Orange/Warning color (90%+)
- **exceeded**: Red/Danger color (100%+)

### Files to Modify
- `mobile-fixed/src/services/api.js`
- `mobile-fixed/src/screens/expenses/BudgetsScreen.js`

### Testing
- Test with on-track budgets
- Test with warning status
- Test with exceeded budgets
- Test with no budgets
- Verify progress bar widths
- Verify color coding

### Success Criteria
- [x] Budgets load from backend
- [x] Progress bars accurate
- [x] Status colors correct
- [x] Exceeded budgets shown first
- [x] Totals displayed

---

## Task 9: Testing & Documentation
**Status:** pending  
**Estimated Time:** 15 minutes

### Description
Create comprehensive tests and documentation for the dashboard aggregation features.

### Implementation Steps
1. Create test file: `backend/tests/integration/dashboard.integration.test.js`
2. Write integration tests for each endpoint
3. Test with realistic data scenarios
4. Create HTML test page: `backend/TEST_DASHBOARD_API.html`
5. Create completion document: `taskmanager1/TASK_B4_COMPLETE.md`
6. Update HomeScreen to show real data
7. Test end-to-end flow

### Test Scenarios
- User with tasks, events, expenses
- User with no data (empty state)
- User with exceeded budgets
- Week-over-week comparisons
- Streak calculations
- Invalid parameters (400 errors)
- Unauthorized access (401 errors)

### Files to Create
- `backend/tests/integration/dashboard.integration.test.js`
- `backend/TEST_DASHBOARD_API.html`
- `taskmanager1/TASK_B4_COMPLETE.md`

### Testing
- Run all integration tests
- Test each endpoint in HTML page
- Verify mobile app displays real data
- Test error scenarios
- Performance test (response times)

### Success Criteria
- [x] All integration tests passing
- [x] HTML test page functional
- [x] Mobile app shows real dashboard data
- [x] Documentation complete
- [x] All endpoints under performance targets

---

## Summary

### Total Tasks: 9
- **Backend Foundation**: Tasks 1-5 (Dashboard service + 4 endpoints)
- **Mobile Integration**: Tasks 6-8 (3 screens)
- **Testing & Docs**: Task 9

### Estimated Total Time: 2 hours

### Dependencies
- ✅ Express server running
- ✅ Authentication middleware
- ✅ Database with existing data
- ✅ Mobile app with API service

### Success Criteria
- ✅ All 4 dashboard endpoints working
- ✅ Mobile app displays real statistics
- ✅ Performance targets met
- ✅ All tests passing
- ✅ Documentation complete

---

**Ready to implement? Let's start with Task 1!**
