# Task B4 - Dashboard Aggregation Requirements

## Overview
Create backend API endpoints to provide aggregated statistics and analytics for the DayFlow dashboard, enabling rich insights into user productivity, spending, and task completion.

## Business Goals
- Provide real-time dashboard statistics instead of hardcoded numbers
- Enable Weekly Summary analytics with trends and insights
- Support budget tracking with spending analysis
- Calculate streaks and productivity metrics
- Aggregate data efficiently to minimize database queries

## User Stories

### Story 1: Dashboard Statistics
**As a** user  
**I want** to see accurate, real-time statistics on my dashboard  
**So that** I can quickly understand my current productivity and financial status

**Acceptance Criteria:**
- Dashboard shows correct count of pending tasks
- Dashboard shows days until next important event
- Dashboard shows current task completion streak
- Dashboard shows weekly spending total
- All stats update in real-time when data changes

### Story 2: Weekly Summary
**As a** user  
**I want** to view a comprehensive weekly summary  
**So that** I can review my productivity and identify areas for improvement

**Acceptance Criteria:**
- Summary shows tasks completed vs created this week
- Summary shows event attendance/completion
- Summary shows spending by category
- Summary includes week-over-week comparison
- Summary highlights achievements and insights

### Story 3: Budget Tracking
**As a** user  
**I want** to see my budget status across categories  
**So that** I can manage my spending and avoid overspending

**Acceptance Criteria:**
- Show total spent vs budgeted per category
- Calculate percentage used of budget
- Identify over-budget categories
- Show monthly spending trends
- Alert when approaching budget limits (90% threshold)

### Story 4: Focus Analytics
**As a** user  
**I want** to see my focus session statistics  
**So that** I can track my productivity and study habits

**Acceptance Criteria:**
- Show total focus time this week
- Calculate current focus streak (consecutive days)
- Show focus time by link/subject
- Display average session duration
- Track best day/best week records

## Functional Requirements

### Dashboard Statistics Endpoint
**Endpoint:** `GET /api/dashboard/stats`

**Response:**
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

### Weekly Summary Endpoint
**Endpoint:** `GET /api/dashboard/weekly-summary?week=2026-W27`

**Response:**
```json
{
  "week": "2026-W27",
  "dateRange": {
    "start": "2026-06-30",
    "end": "2026-07-06"
  },
  "tasks": {
    "completed": 18,
    "created": 22,
    "completionRate": 81.8,
    "byPriority": {
      "high": 5,
      "medium": 8,
      "low": 5
    },
    "comparison": {
      "previousWeek": 15,
      "change": +3,
      "percentChange": +20
    }
  },
  "events": {
    "total": 4,
    "attended": 4,
    "missed": 0
  },
  "expenses": {
    "total": 450.00,
    "income": 200.00,
    "net": -250.00,
    "byCategory": [
      { "category": "Food & Dining", "amount": 180.00 },
      { "category": "Transportation", "amount": 120.00 }
    ],
    "comparison": {
      "previousWeek": 380.00,
      "change": +70.00,
      "percentChange": +18.4
    }
  },
  "focus": {
    "totalMinutes": 420,
    "sessionCount": 14,
    "averageMinutes": 30,
    "byLink": [
      { "link": "Study Math", "minutes": 180 },
      { "link": "Work on Project", "minutes": 240 }
    ]
  },
  "insights": [
    "🎉 Great week! You completed 20% more tasks than last week.",
    "💰 Your spending increased by $70 this week.",
    "🔥 You maintained your 7-day streak!"
  ]
}
```

### Budget Status Endpoint
**Endpoint:** `GET /api/dashboard/budgets`

**Response:**
```json
{
  "month": "2026-07",
  "budgets": [
    {
      "categoryId": "cat-1",
      "categoryName": "Food & Dining",
      "limit": 500.00,
      "spent": 450.00,
      "remaining": 50.00,
      "percentUsed": 90,
      "status": "warning",
      "daysLeft": 24
    },
    {
      "categoryId": "cat-2",
      "categoryName": "Transportation",
      "limit": 300.00,
      "spent": 280.00,
      "remaining": 20.00,
      "percentUsed": 93.3,
      "status": "warning",
      "daysLeft": 24
    },
    {
      "categoryId": "cat-3",
      "categoryName": "Entertainment",
      "limit": 200.00,
      "spent": 220.00,
      "remaining": -20.00,
      "percentUsed": 110,
      "status": "exceeded",
      "daysLeft": 24
    }
  ],
  "totals": {
    "totalBudget": 1000.00,
    "totalSpent": 950.00,
    "totalRemaining": 50.00,
    "percentUsed": 95
  }
}
```

### Focus Analytics Endpoint
**Endpoint:** `GET /api/dashboard/focus-stats?period=week`

**Response:**
```json
{
  "period": "week",
  "dateRange": {
    "start": "2026-06-30",
    "end": "2026-07-06"
  },
  "totalMinutes": 420,
  "sessionCount": 14,
  "averageSessionMinutes": 30,
  "streak": {
    "current": 7,
    "longest": 12
  },
  "byDay": [
    { "date": "2026-06-30", "minutes": 60 },
    { "date": "2026-07-01", "minutes": 90 }
  ],
  "byLink": [
    { "linkId": "link-1", "linkName": "Study Math", "minutes": 180, "sessions": 6 },
    { "linkId": "link-2", "linkName": "Work on Project", "minutes": 240, "sessions": 8 }
  ],
  "records": {
    "bestDay": { "date": "2026-07-01", "minutes": 90 },
    "bestWeek": { "week": "2026-W26", "minutes": 480 }
  }
}
```

## Non-Functional Requirements

### Performance
- Dashboard stats endpoint must respond within 500ms
- Weekly summary calculations should complete within 1 second
- Use database aggregation functions (not application-level loops)
- Implement query optimization with proper indexes

### Scalability
- Endpoints should handle 1000+ tasks efficiently
- Support date range queries for historical data
- Cache frequently accessed statistics (optional for MVP)

### Data Accuracy
- All calculations must be precise (no rounding errors in money)
- Streak calculations must account for user timezone
- Week boundaries follow ISO 8601 standard (Monday start)
- Budget periods align with calendar months

### Security
- All endpoints require authentication
- Users can only access their own statistics
- No sensitive data exposed in error messages

## Data Models Impact

### No Schema Changes Required
All aggregation uses existing models:
- Task (for task statistics)
- Event (for event tracking)
- Expense (for spending analysis)
- Budget (for budget tracking)
- FocusSession (for focus analytics)

### Computed Fields
These are calculated, not stored:
- Streak counts (computed from task completion dates)
- Spending totals (aggregated from expenses)
- Completion rates (calculated percentages)
- Week-over-week comparisons (computed from historical data)

## Technical Constraints

### Technology Stack
- Node.js + Express for API
- Prisma for database aggregation
- date-fns for date calculations
- SQLite database (existing)

### Dependencies
- Existing authentication middleware
- Existing error handling middleware
- Existing validation utilities

## Success Criteria

### Phase 1: Core Dashboard Stats ✅
- ✅ Dashboard stats endpoint working
- ✅ Returns accurate task counts
- ✅ Returns next event countdown
- ✅ Returns spending totals
- ✅ Mobile app displays real stats

### Phase 2: Weekly Summary ✅
- ✅ Weekly summary endpoint working
- ✅ Task completion analytics
- ✅ Spending breakdown by category
- ✅ Week-over-week comparison
- ✅ Mobile app shows summary screen

### Phase 3: Budget Tracking ✅
- ✅ Budget status endpoint working
- ✅ Accurate percentage calculations
- ✅ Status indicators (on-track/warning/exceeded)
- ✅ Monthly budget tracking
- ✅ Mobile app shows budget screen

### Phase 4: Focus Analytics ✅
- ✅ Focus stats endpoint working
- ✅ Streak calculation accurate
- ✅ Session aggregation by link
- ✅ Daily/weekly breakdowns
- ✅ Mobile app shows focus analytics

## Out of Scope
- Advanced ML-based predictions
- Notifications based on trends (handled by B3)
- Data export/import (handled by mobile A3)
- Historical data beyond 12 months
- Real-time websocket updates
- Caching layer (future optimization)

## Dependencies
- ✅ Task B1 (Auth API) - COMPLETE
- ✅ Task B2 (CRUD API) - COMPLETE
- ✅ Task B3 (Mobile Integration) - COMPLETE

## Estimated Effort
- Backend development: 45-60 minutes
- Mobile integration: 30-45 minutes
- Testing: 15-20 minutes
- **Total: 90-120 minutes**

## Risks & Mitigation

### Risk 1: Performance Issues
**Mitigation:** Use Prisma aggregation, add database indexes, test with realistic data volumes

### Risk 2: Complex Date/Time Calculations
**Mitigation:** Use date-fns library, write unit tests for edge cases, document timezone handling

### Risk 3: Inaccurate Streak Calculation
**Mitigation:** Clear algorithm definition, test with various completion patterns, account for timezone

### Risk 4: Budget Period Alignment
**Mitigation:** Use standard calendar months, document period boundaries, test month transitions
