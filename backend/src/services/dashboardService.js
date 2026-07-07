const prisma = require('../config/database');
const {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  differenceInDays,
  parseISO,
  format,
  subDays,
  addDays,
  getISOWeek,
  getYear,
  setISOWeek,
  setYear,
  startOfISOWeek,
  endOfISOWeek,
} = require('date-fns');

// ============================================================================
// DATE UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse ISO week string (e.g., "2026-W27") to date range
 * @param {string} weekString - ISO week string (YYYY-Wnn)
 * @returns {object} { start: Date, end: Date, weekNumber: number, year: number }
 */
function getDateRangeForWeek(weekString) {
  if (!weekString) {
    // Default to current week
    const now = new Date();
    const weekNumber = getISOWeek(now);
    const year = getYear(now);
    return {
      start: startOfISOWeek(now),
      end: endOfISOWeek(now),
      weekNumber,
      year,
    };
  }

  // Parse "2026-W27" format
  const match = weekString.match(/^(\d{4})-W(\d{1,2})$/);
  if (!match) {
    throw new Error('Invalid week format. Use ISO week format (e.g., 2026-W27)');
  }

  const year = parseInt(match[1], 10);
  const weekNumber = parseInt(match[2], 10);

  if (weekNumber < 1 || weekNumber > 53) {
    throw new Error('Week number must be between 1 and 53');
  }

  // Create date for the week
  let date = new Date(year, 0, 4); // January 4 is always in week 1
  date = setISOWeek(date, weekNumber);
  date = setYear(date, year);

  return {
    start: startOfISOWeek(date),
    end: endOfISOWeek(date),
    weekNumber,
    year,
  };
}

/**
 * Parse month string (e.g., "2026-07") to date range
 * @param {string} monthString - Month string (YYYY-MM)
 * @returns {object} { start: Date, end: Date, month: number, year: number }
 */
function getDateRangeForMonth(monthString) {
  if (!monthString) {
    // Default to current month
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now),
      month: now.getMonth() + 1,
      year: getYear(now),
    };
  }

  // Parse "2026-07" format
  const match = monthString.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    throw new Error('Invalid month format. Use YYYY-MM format (e.g., 2026-07)');
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);

  if (month < 1 || month > 12) {
    throw new Error('Month must be between 01 and 12');
  }

  const date = new Date(year, month - 1, 1);

  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
    month,
    year,
  };
}

/**
 * Get current week string in ISO format
 * @returns {string} ISO week string (e.g., "2026-W27")
 */
function getCurrentWeekString() {
  const now = new Date();
  const week = getISOWeek(now);
  const year = getYear(now);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Get current month string
 * @returns {string} Month string (e.g., "2026-07")
 */
function getCurrentMonthString() {
  const now = new Date();
  const year = getYear(now);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

// ============================================================================
// CALCULATION HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate task completion streak
 * @param {Array} completedTasks - Array of tasks with updatedAt dates
 * @returns {object} { current: number, longest: number, lastCompletionDate: Date|null }
 */
function calculateStreak(completedTasks) {
  if (!completedTasks || completedTasks.length === 0) {
    return { current: 0, longest: 0, lastCompletionDate: null };
  }

  // Group tasks by date (ignore time)
  const dateMap = new Map();
  completedTasks.forEach((task) => {
    const dateKey = format(new Date(task.updatedAt), 'yyyy-MM-dd');
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, true);
    }
  });

  // Sort dates descending
  const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

  if (sortedDates.length === 0) {
    return { current: 0, longest: 0, lastCompletionDate: null };
  }

  // Calculate current streak (from most recent date)
  let currentStreak = 0;
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Check if streak is current (completed today or yesterday)
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    let checkDate = sortedDates[0] === today ? today : yesterday;
    let index = sortedDates[0] === today ? 0 : sortedDates[0] === yesterday ? 0 : -1;

    if (index >= 0) {
      while (index < sortedDates.length) {
        if (sortedDates[index] === checkDate) {
          currentStreak++;
          checkDate = format(subDays(parseISO(checkDate), 1), 'yyyy-MM-dd');
          index++;
        } else {
          break;
        }
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = parseISO(sortedDates[i - 1]);
    const currDate = parseISO(sortedDates[i]);
    const diff = differenceInDays(prevDate, currDate);

    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    current: currentStreak,
    longest: Math.max(longestStreak, currentStreak),
    lastCompletionDate: sortedDates[0] ? parseISO(sortedDates[0]) : null,
  };
}

/**
 * Format currency amount to 2 decimal places
 * @param {number|string} amount - Amount to format
 * @returns {number} Formatted amount
 */
function formatCurrency(amount) {
  if (!amount) return 0.0;
  return parseFloat(parseFloat(amount).toFixed(2));
}

/**
 * Get budget status label based on percentage used
 * @param {number} percentUsed - Percentage of budget used
 * @returns {string} Status: "on-track", "warning", or "exceeded"
 */
function getBudgetStatusLabel(percentUsed) {
  if (percentUsed >= 100) return 'exceeded';
  if (percentUsed >= 90) return 'warning';
  return 'on-track';
}

/**
 * Generate insights from weekly summary data
 * @param {object} summary - Weekly summary data
 * @returns {Array<string>} Array of insight strings
 */
function generateInsights(summary) {
  const insights = [];

  // Task completion insights
  if (summary.tasks.comparison.percentChange > 10) {
    insights.push(
      `🎉 Great week! You completed ${Math.abs(summary.tasks.comparison.percentChange).toFixed(0)}% more tasks than last week.`
    );
  } else if (summary.tasks.comparison.percentChange < -10) {
    insights.push(
      `📉 Your task completion decreased by ${Math.abs(summary.tasks.comparison.percentChange).toFixed(0)}% this week.`
    );
  }

  // Completion rate insights
  if (summary.tasks.completionRate >= 90) {
    insights.push(`⭐ Amazing! You completed ${summary.tasks.completionRate.toFixed(0)}% of your tasks.`);
  } else if (summary.tasks.completionRate < 50) {
    insights.push(`💪 Only ${summary.tasks.completionRate.toFixed(0)}% completion rate. Let's aim higher next week!`);
  }

  // Spending insights
  if (summary.expenses.comparison.percentChange > 20) {
    insights.push(
      `💰 Your spending increased by $${Math.abs(summary.expenses.comparison.change).toFixed(2)} (${Math.abs(summary.expenses.comparison.percentChange).toFixed(0)}%) this week.`
    );
  } else if (summary.expenses.comparison.percentChange < -20) {
    insights.push(
      `💵 Great job! You saved $${Math.abs(summary.expenses.comparison.change).toFixed(2)} compared to last week.`
    );
  }

  // Streak insights
  if (summary.streak && summary.streak.current >= 7) {
    insights.push(`🔥 Impressive! You maintained your ${summary.streak.current}-day streak!`);
  } else if (summary.streak && summary.streak.current > 0) {
    insights.push(`🌟 You're on a ${summary.streak.current}-day streak. Keep it going!`);
  }

  // Focus insights
  if (summary.focus.totalMinutes >= 300) {
    insights.push(
      `🎯 You focused for ${Math.floor(summary.focus.totalMinutes / 60)} hours and ${summary.focus.totalMinutes % 60} minutes this week!`
    );
  }

  // Default insight if none generated
  if (insights.length === 0) {
    insights.push('📊 Keep tracking your progress to unlock insights!');
  }

  return insights;
}

// ============================================================================
// MAIN SERVICE FUNCTIONS
// ============================================================================

/**
 * Get dashboard statistics
 * @param {string} userId - User ID
 * @returns {Promise<object>} Dashboard statistics
 */
async function getDashboardStats(userId) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfISOWeek(now);
  const weekEnd = endOfISOWeek(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const last90Days = subDays(now, 90);

  // Execute queries in parallel
  const [tasksDueToday, tasksDueThisWeek, tasksOverdue, nextEvent, completedTasks, spendingThisWeek, spendingThisMonth, spendingLastWeek] =
    await Promise.all([
      // Tasks due today
      prisma.task.count({
        where: {
          userId,
          status: 'pending',
          dueDate: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),

      // Tasks due this week
      prisma.task.count({
        where: {
          userId,
          status: 'pending',
          dueDate: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      }),

      // Overdue tasks
      prisma.task.count({
        where: {
          userId,
          status: 'pending',
          dueDate: {
            lt: todayStart,
          },
        },
      }),

      // Next event
      prisma.event.findFirst({
        where: {
          userId,
          eventDate: {
            gte: now,
          },
        },
        orderBy: {
          eventDate: 'asc',
        },
        select: {
          title: true,
          eventDate: true,
        },
      }),

      // Recent completed tasks for streak
      prisma.task.findMany({
        where: {
          userId,
          status: 'completed',
          updatedAt: {
            gte: last90Days,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          updatedAt: true,
        },
      }),

      // Spending this week
      prisma.expense.aggregate({
        where: {
          userId,
          direction: 'debit',
          occurredAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Spending this month
      prisma.expense.aggregate({
        where: {
          userId,
          direction: 'debit',
          occurredAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Spending last week
      prisma.expense.aggregate({
        where: {
          userId,
          direction: 'debit',
          occurredAt: {
            gte: subDays(weekStart, 7),
            lte: subDays(weekEnd, 7),
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

  // Calculate streak
  const streak = calculateStreak(completedTasks);

  // Format response
  return {
    tasksDue: {
      today: tasksDueToday,
      thisWeek: tasksDueThisWeek,
      overdue: tasksOverdue,
    },
    nextEvent: nextEvent
      ? {
          daysUntil: differenceInDays(new Date(nextEvent.eventDate), now),
          title: nextEvent.title,
          date: format(new Date(nextEvent.eventDate), 'yyyy-MM-dd'),
        }
      : null,
    streak: {
      current: streak.current,
      longest: streak.longest,
      lastCompletionDate: streak.lastCompletionDate ? format(streak.lastCompletionDate, 'yyyy-MM-dd') : null,
    },
    spending: {
      thisWeek: formatCurrency(spendingThisWeek._sum.amount || 0),
      thisMonth: formatCurrency(spendingThisMonth._sum.amount || 0),
      lastWeek: formatCurrency(spendingLastWeek._sum.amount || 0),
    },
  };
}

/**
 * Get weekly summary with analytics
 * @param {string} userId - User ID
 * @param {string} weekString - ISO week string (optional)
 * @returns {Promise<object>} Weekly summary
 */
async function getWeeklySummary(userId, weekString) {
  const { start: weekStart, end: weekEnd, weekNumber, year } = getDateRangeForWeek(weekString);

  // Previous week
  const prevWeekStart = subDays(weekStart, 7);
  const prevWeekEnd = subDays(weekEnd, 7);

  // Execute queries in parallel
  const [
    tasksCompleted,
    tasksCreated,
    tasksByPriority,
    tasksCompletedPrevWeek,
    expenses,
    expensesPrevWeek,
    focusSessions,
    completedTasks,
  ] = await Promise.all([
    // Tasks completed this week
    prisma.task.count({
      where: {
        userId,
        status: 'completed',
        updatedAt: { gte: weekStart, lte: weekEnd },
      },
    }),

    // Tasks created this week
    prisma.task.count({
      where: {
        userId,
        createdAt: { gte: weekStart, lte: weekEnd },
      },
    }),

    // Tasks by priority
    prisma.task.groupBy({
      by: ['priority'],
      where: {
        userId,
        status: 'completed',
        updatedAt: { gte: weekStart, lte: weekEnd },
      },
      _count: true,
    }),

    // Tasks completed previous week
    prisma.task.count({
      where: {
        userId,
        status: 'completed',
        updatedAt: { gte: prevWeekStart, lte: prevWeekEnd },
      },
    }),

    // Expenses this week with categories
    prisma.expense.findMany({
      where: {
        userId,
        direction: 'debit',
        occurredAt: { gte: weekStart, lte: weekEnd },
      },
      include: {
        category: {
          select: { name: true },
        },
      },
    }),

    // Expenses previous week
    prisma.expense.aggregate({
      where: {
        userId,
        direction: 'debit',
        occurredAt: { gte: prevWeekStart, lte: prevWeekEnd },
      },
      _sum: { amount: true },
    }),

    // Focus sessions
    prisma.focusSession.findMany({
      where: {
        userId,
        startedAt: { gte: weekStart, lte: weekEnd },
        endedAt: { not: null },
      },
      include: {
        focusLink: {
          select: { id: true, label: true },
        },
      },
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        focusLink: true,
      },
    }),

    // Completed tasks for streak (last 90 days)
    prisma.task.findMany({
      where: {
        userId,
        status: 'completed',
        updatedAt: { gte: subDays(weekEnd, 90) },
      },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    }),
  ]);

  // Calculate task metrics
  const completionRate = tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0;
  const taskChange = tasksCompleted - tasksCompletedPrevWeek;
  const taskPercentChange = tasksCompletedPrevWeek > 0 ? (taskChange / tasksCompletedPrevWeek) * 100 : 0;

  // Process priority breakdown
  const byPriority = {
    high: 0,
    medium: 0,
    low: 0,
  };
  tasksByPriority.forEach((item) => {
    byPriority[item.priority] = item._count;
  });

  // Calculate spending metrics
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const prevWeekExpenses = expensesPrevWeek._sum.amount || 0;
  const expenseChange = totalExpenses - parseFloat(prevWeekExpenses);
  const expensePercentChange = prevWeekExpenses > 0 ? (expenseChange / parseFloat(prevWeekExpenses)) * 100 : 0;

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, exp) => {
    const categoryName = exp.category?.name || 'Uncategorized';
    const existing = acc.find((item) => item.category === categoryName);
    if (existing) {
      existing.amount += parseFloat(exp.amount);
    } else {
      acc.push({
        category: categoryName,
        amount: parseFloat(exp.amount),
      });
    }
    return acc;
  }, []);

  // Sort by amount descending
  expensesByCategory.sort((a, b) => b.amount - a.amount);
  expensesByCategory.forEach((item) => {
    item.amount = formatCurrency(item.amount);
  });

  // Calculate focus metrics
  const focusMinutes = focusSessions.reduce((sum, session) => {
    const start = new Date(session.startedAt);
    const end = new Date(session.endedAt);
    const minutes = Math.floor((end - start) / 1000 / 60);
    return sum + minutes;
  }, 0);

  const averageFocusMinutes = focusSessions.length > 0 ? Math.floor(focusMinutes / focusSessions.length) : 0;

  // Group focus by link
  const focusByLink = focusSessions.reduce((acc, session) => {
    const linkName = session.focusLink?.label || 'Unknown';
    const linkId = session.focusLink?.id || 'unknown';
    const start = new Date(session.startedAt);
    const end = new Date(session.endedAt);
    const minutes = Math.floor((end - start) / 1000 / 60);

    const existing = acc.find((item) => item.linkId === linkId);
    if (existing) {
      existing.minutes += minutes;
    } else {
      acc.push({
        linkId,
        link: linkName,
        minutes,
      });
    }
    return acc;
  }, []);

  // Sort by minutes descending
  focusByLink.sort((a, b) => b.minutes - a.minutes);

  // Calculate streak
  const streak = calculateStreak(completedTasks);

  // Build summary object
  const summary = {
    week: `${year}-W${weekNumber.toString().padStart(2, '0')}`,
    dateRange: {
      start: format(weekStart, 'yyyy-MM-dd'),
      end: format(weekEnd, 'yyyy-MM-dd'),
    },
    tasks: {
      completed: tasksCompleted,
      created: tasksCreated,
      completionRate: formatCurrency(completionRate),
      byPriority,
      comparison: {
        previousWeek: tasksCompletedPrevWeek,
        change: taskChange,
        percentChange: formatCurrency(taskPercentChange),
      },
    },
    expenses: {
      total: formatCurrency(totalExpenses),
      byCategory: expensesByCategory,
      comparison: {
        previousWeek: formatCurrency(prevWeekExpenses),
        change: formatCurrency(expenseChange),
        percentChange: formatCurrency(expensePercentChange),
      },
    },
    focus: {
      totalMinutes: focusMinutes,
      sessionCount: focusSessions.length,
      averageMinutes: averageFocusMinutes,
      byLink: focusByLink,
    },
    streak: {
      current: streak.current,
      longest: streak.longest,
    },
    insights: [],
  };

  // Generate insights
  summary.insights = generateInsights(summary);

  return summary;
}

/**
 * Get budget status for all categories
 * @param {string} userId - User ID
 * @param {string} monthString - Month string (optional)
 * @returns {Promise<object>} Budget status
 */
async function getBudgetStatus(userId, monthString) {
  const { start: monthStart, end: monthEnd, month, year } = getDateRangeForMonth(monthString);

  // Get all budgets with categories
  const budgets = await prisma.budget.findMany({
    where: { userId },
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
  });

  // Calculate spending for each budget
  const budgetResults = await Promise.all(
    budgets.map(async (budget) => {
      const spentResult = await prisma.expense.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          direction: 'debit',
          occurredAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const spent = parseFloat(spentResult._sum.amount || 0);
      const limit = parseFloat(budget.monthlyLimit);
      const remaining = limit - spent;
      const percentUsed = limit > 0 ? (spent / limit) * 100 : 0;
      const status = getBudgetStatusLabel(percentUsed);

      // Days left in month
      const now = new Date();
      const daysLeft = differenceInDays(monthEnd, now);

      return {
        categoryId: budget.category.id,
        categoryName: budget.category.name,
        limit: formatCurrency(limit),
        spent: formatCurrency(spent),
        remaining: formatCurrency(remaining),
        percentUsed: formatCurrency(percentUsed),
        status,
        daysLeft: Math.max(0, daysLeft),
      };
    })
  );

  // Sort by status: exceeded first, then warning, then on-track
  const statusOrder = { exceeded: 0, warning: 1, 'on-track': 2 };
  budgetResults.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  // Calculate totals
  const totalBudget = budgetResults.reduce((sum, b) => sum + parseFloat(b.limit), 0);
  const totalSpent = budgetResults.reduce((sum, b) => sum + parseFloat(b.spent), 0);
  const totalRemaining = totalBudget - totalSpent;
  const totalPercentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return {
    month: `${year}-${month.toString().padStart(2, '0')}`,
    budgets: budgetResults,
    totals: {
      totalBudget: formatCurrency(totalBudget),
      totalSpent: formatCurrency(totalSpent),
      totalRemaining: formatCurrency(totalRemaining),
      percentUsed: formatCurrency(totalPercentUsed),
    },
  };
}

/**
 * Get focus analytics
 * @param {string} userId - User ID
 * @param {string} period - Period: "day", "week", or "month"
 * @returns {Promise<object>} Focus analytics
 */
async function getFocusAnalytics(userId, period = 'week') {
  const now = new Date();
  let periodStart, periodEnd;

  // Determine date range based on period
  switch (period) {
    case 'day':
      periodStart = startOfDay(now);
      periodEnd = endOfDay(now);
      break;
    case 'week':
      periodStart = startOfISOWeek(now);
      periodEnd = endOfISOWeek(now);
      break;
    case 'month':
      periodStart = startOfMonth(now);
      periodEnd = endOfMonth(now);
      break;
    default:
      throw new Error('Period must be "day", "week", or "month"');
  }

  // Check if focusSession table exists, if not return empty data
  // (FocusSession and FocusLink models not yet in schema)
  if (!prisma.focusSession) {
    return {
      period,
      dateRange: {
        start: format(periodStart, 'yyyy-MM-dd'),
        end: format(periodEnd, 'yyyy-MM-dd'),
      },
      totalMinutes: 0,
      sessionCount: 0,
      averageSessionMinutes: 0,
      streak: {
        current: 0,
        longest: 0,
      },
      byDay: [],
      byLink: [],
      records: {
        bestDay: null,
      },
    };
  }

  // Get all focus sessions in period
  const sessions = await prisma.focusSession.findMany({
    where: {
      userId,
      startedAt: { gte: periodStart, lte: periodEnd },
      endedAt: { not: null },
    },
    include: {
      focusLink: {
        select: { id: true, label: true },
      },
    },
    orderBy: { startedAt: 'asc' },
  });

  // Get recent sessions for streak (last 90 days)
  const recentSessions = await prisma.focusSession.findMany({
    where: {
      userId,
      startedAt: { gte: subDays(now, 90) },
      endedAt: { not: null },
    },
    orderBy: { startedAt: 'desc' },
    select: { startedAt: true },
  });

  // Calculate total minutes and average
  const totalMinutes = sessions.reduce((sum, session) => {
    const start = new Date(session.startedAt);
    const end = new Date(session.endedAt);
    const minutes = Math.floor((end - start) / 1000 / 60);
    return sum + minutes;
  }, 0);

  const averageSessionMinutes = sessions.length > 0 ? Math.floor(totalMinutes / sessions.length) : 0;

  // Group by day
  const byDay = sessions.reduce((acc, session) => {
    const dateKey = format(new Date(session.startedAt), 'yyyy-MM-dd');
    const start = new Date(session.startedAt);
    const end = new Date(session.endedAt);
    const minutes = Math.floor((end - start) / 1000 / 60);

    const existing = acc.find((item) => item.date === dateKey);
    if (existing) {
      existing.minutes += minutes;
    } else {
      acc.push({ date: dateKey, minutes });
    }
    return acc;
  }, []);

  // Sort by date
  byDay.sort((a, b) => a.date.localeCompare(b.date));

  // Group by link
  const byLink = sessions.reduce((acc, session) => {
    const linkId = session.focusLink?.id || 'unknown';
    const linkName = session.focusLink?.label || 'Unknown';
    const start = new Date(session.startedAt);
    const end = new Date(session.endedAt);
    const minutes = Math.floor((end - start) / 1000 / 60);

    const existing = acc.find((item) => item.linkId === linkId);
    if (existing) {
      existing.minutes += minutes;
      existing.sessions += 1;
    } else {
      acc.push({
        linkId,
        linkName,
        minutes,
        sessions: 1,
      });
    }
    return acc;
  }, []);

  // Sort by minutes descending
  byLink.sort((a, b) => b.minutes - a.minutes);

  // Calculate streak (consecutive days with at least one session)
  const sessionDates = new Set();
  recentSessions.forEach((session) => {
    const dateKey = format(new Date(session.startedAt), 'yyyy-MM-dd');
    sessionDates.add(dateKey);
  });

  const sortedDates = Array.from(sessionDates).sort((a, b) => b.localeCompare(a));
  let currentStreak = 0;
  const today = format(now, 'yyyy-MM-dd');
  const yesterday = format(subDays(now, 1), 'yyyy-MM-dd');

  if (sortedDates.length > 0 && (sortedDates[0] === today || sortedDates[0] === yesterday)) {
    let checkDate = sortedDates[0] === today ? today : yesterday;
    let index = sortedDates[0] === today ? 0 : sortedDates[0] === yesterday ? 0 : -1;

    if (index >= 0) {
      while (index < sortedDates.length) {
        if (sortedDates[index] === checkDate) {
          currentStreak++;
          checkDate = format(subDays(parseISO(checkDate), 1), 'yyyy-MM-dd');
          index++;
        } else {
          break;
        }
      }
    }
  }

  // Find best day and best week
  const bestDay = byDay.length > 0 ? byDay.reduce((max, day) => (day.minutes > max.minutes ? day : max)) : null;

  return {
    period,
    dateRange: {
      start: format(periodStart, 'yyyy-MM-dd'),
      end: format(periodEnd, 'yyyy-MM-dd'),
    },
    totalMinutes,
    sessionCount: sessions.length,
    averageSessionMinutes,
    streak: {
      current: currentStreak,
      longest: currentStreak, // Simplified for MVP
    },
    byDay,
    byLink,
    records: {
      bestDay: bestDay ? { date: bestDay.date, minutes: bestDay.minutes } : null,
    },
  };
}

// Export all functions
module.exports = {
  // Date utilities
  getDateRangeForWeek,
  getDateRangeForMonth,
  getCurrentWeekString,
  getCurrentMonthString,

  // Calculation helpers
  calculateStreak,
  formatCurrency,
  getBudgetStatusLabel,
  generateInsights,

  // Main service functions
  getDashboardStats,
  getWeeklySummary,
  getBudgetStatus,
  getFocusAnalytics,
};
