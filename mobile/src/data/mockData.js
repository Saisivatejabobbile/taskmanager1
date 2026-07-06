// Mock data matching the API contract

export const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatarUrl: null,
};

export const mockCategories = [
  { id: '1', name: 'Work', type: 'task', color: '#E8A33D' },
  { id: '2', name: 'Personal', type: 'task', color: '#2F8F82' },
  { id: '3', name: 'Shopping', type: 'task', color: '#E2604F' },
  { id: '4', name: 'Food', type: 'expense', color: '#E8A33D' },
  { id: '5', name: 'Transport', type: 'expense', color: '#2F8F82' },
  { id: '6', name: 'Entertainment', type: 'expense', color: '#E2604F' },
];

export const mockTasks = [
  {
    id: '1',
    title: 'Complete project proposal',
    notes: 'Review and finalize the Q1 project proposal document',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    categoryId: '1',
    status: 'pending',
    recurrenceRule: null,
    resourceLinks: [{ url: 'https://docs.google.com', label: 'Project Doc' }],
    subtasks: [
      { id: 's1', title: 'Research competitors', done: true },
      { id: 's2', title: 'Create budget estimate', done: false },
    ],
  },
  {
    id: '2',
    title: 'Call mom',
    notes: '',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    categoryId: '2',
    status: 'pending',
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=SU',
    resourceLinks: [],
    subtasks: [],
  },
  {
    id: '3',
    title: 'Buy groceries',
    notes: 'Milk, eggs, bread, vegetables',
    dueDate: new Date().toISOString(),
    priority: 'low',
    categoryId: '3',
    status: 'pending',
    recurrenceRule: null,
    resourceLinks: [],
    subtasks: [],
  },
];

export const mockEvents = [
  {
    id: '1',
    title: "Mom's Birthday",
    eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    alertDaysBefore: 3,
    repeatsYearly: true,
    category: 'personal',
  },
  {
    id: '2',
    title: 'Team Meeting',
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    alertDaysBefore: 1,
    repeatsYearly: false,
    category: 'work',
  },
];

export const mockFocusLinks = [
  { id: '1', label: 'Study Material', url: 'https://example.com/study' },
  { id: '2', label: 'Course Videos', url: 'https://example.com/videos' },
];

export const mockFocusSessions = [
  {
    id: '1',
    focusLinkId: '1',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    note: 'Completed chapter 3',
  },
];

export const mockAccounts = [
  { id: '1', name: 'Cash', type: 'cash' },
  { id: '2', name: 'Bank - Checking', type: 'bank' },
  { id: '3', name: 'Credit Card', type: 'card' },
];

export const mockExpenses = [
  {
    id: '1',
    amount: 45.50,
    direction: 'debit',
    categoryId: '4',
    note: 'Lunch at restaurant',
    occurredAt: new Date().toISOString(),
    recurrenceRule: null,
  },
  {
    id: '2',
    amount: 20.00,
    direction: 'debit',
    categoryId: '5',
    note: 'Taxi to office',
    occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    recurrenceRule: null,
  },
  {
    id: '3',
    amount: 3000.00,
    direction: 'credit',
    categoryId: null,
    note: 'Monthly salary',
    occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    recurrenceRule: 'FREQ=MONTHLY;BYMONTHDAY=1',
  },
];

export const mockBudgets = [
  { id: '1', categoryId: '4', monthlyLimit: 500.00 },
  { id: '2', categoryId: '5', monthlyLimit: 200.00 },
];
