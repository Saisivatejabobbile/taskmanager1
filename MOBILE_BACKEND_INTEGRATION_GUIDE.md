# 📱 Mobile Backend Integration Guide

## ✅ What's Complete

1. **API Service Extended** - `src/services/api.js` now includes:
   - ✅ `tasksApi` - Full CRUD operations
   - ✅ `eventsApi` - Full CRUD operations
   - ✅ `expensesApi` - Full CRUD operations
   - ✅ `categoriesApi` - Full CRUD operations
   - ✅ Authentication (already working)

2. **Backend API** - All endpoints working and tested

## 🔄 What Needs Integration

The mobile app screens currently use **mock data** from `src/data/mockData.js`. They need to be updated to use the new API service functions.

### Screens to Update:

1. **HomeScreen** (`src/screens/home/HomeScreen.js`)
   - Replace `mockTasks` with `tasksApi.getAll()`
   - Replace `mockEvents` with `eventsApi.getAll()`

2. **TasksScreen** (`src/screens/tasks/TasksScreen.js`)
   - Load: `tasksApi.getAll()`
   - Create: `tasksApi.create()`
   - Update: `tasksApi.update()`
   - Delete: `tasksApi.delete()`

3. **CalendarScreen** / **EventsScreen**
   - Load: `eventsApi.getAll()`
   - Create: `eventsApi.create()`
   - Update: `eventsApi.update()`
   - Delete: `eventsApi.delete()`

4. **ExpensesScreen**
   - Load: `expensesApi.getAll()`
   - Create: `expensesApi.create()`
   - Update: `expensesApi.update()`
   - Delete: `expensesApi.delete()`

---

## 📝 Integration Pattern (Example)

Here's how to update a screen from mock data to backend API:

### Before (Using Mock Data):
```javascript
import { mockTasks } from '../../data/mockData';

export default function TasksScreen() {
  const [tasks, setTasks] = useState(mockTasks);
  
  const addTask = (newTask) => {
    setTasks([...tasks, { ...newTask, id: Date.now() }]);
  };
}
```

### After (Using Backend API):
```javascript
import { tasksApi } from '../../services/api';

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from backend on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const result = await tasksApi.getAll();
    if (result.success) {
      setTasks(result.data);
    } else {
      Alert.alert('Error', 'Failed to load tasks');
    }
    setLoading(false);
  };

  const addTask = async (taskData) => {
    const result = await tasksApi.create(taskData);
    if (result.success) {
      setTasks([...tasks, result.data]);
      Alert.alert('Success', 'Task created!');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const updateTask = async (id, taskData) => {
    const result = await tasksApi.update(id, taskData);
    if (result.success) {
      setTasks(tasks.map(t => t.id === id ? result.data : t));
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const deleteTask = async (id) => {
    const result = await tasksApi.delete(id);
    if (result.success) {
      setTasks(tasks.filter(t => t.id !== id));
    } else {
      Alert.alert('Error', result.error);
    }
  };
}
```

---

## 🎯 Data Format Mapping

### Tasks
**Backend expects:**
```javascript
{
  title: string,           // required, 1-200 chars
  priority: string,        // required, 'high'|'medium'|'low'
  status: string,          // required, 'pending'|'completed'
  notes: string,           // optional, max 2000 chars
  dueDate: string,         // optional, ISO 8601 format
  categoryId: string,      // optional, UUID
  recurrenceRule: string,  // optional, RRULE format
  subtasks: array,         // optional, [{ id, title, done }]
  resourceLinks: array     // optional, [{ url, label }]
}
```

### Events
**Backend expects:**
```javascript
{
  title: string,           // required, 1-200 chars
  eventDate: string,       // required, ISO 8601 format
  alertDaysBefore: number, // required, non-negative integer
  repeatsYearly: boolean,  // required
  category: string         // optional, max 50 chars
}
```

### Expenses
**Backend expects:**
```javascript
{
  amount: number,          // required, positive number
  direction: string,       // required, 'debit'|'credit'
  note: string,            // optional, max 2000 chars
  occurredAt: string,      // required, ISO 8601 format
  categoryId: string,      // optional, UUID
  recurrenceRule: string   // optional, RRULE format
}
```

### Categories
**Backend expects:**
```javascript
{
  name: string,            // required, 1-50 chars
  type: string,            // required, 'task'|'expense'
  color: string            // required, hex format #RRGGBB
}
```

---

## 🚀 Quick Integration Steps

### Step 1: Update Imports
Replace:
```javascript
import { mockTasks } from '../../data/mockData';
```

With:
```javascript
import { tasksApi } from '../../services/api';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
```

### Step 2: Add State and Loading
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
```

### Step 3: Add Load Function
```javascript
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  setLoading(true);
  const result = await tasksApi.getAll(); // or eventsApi, expensesApi
  if (result.success) {
    setData(result.data);
  }
  setLoading(false);
};
```

### Step 4: Update CRUD Functions
- Replace local state updates with API calls
- Add success/error handling
- Refresh list after changes

### Step 5: Add Loading UI
```javascript
if (loading) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
```

---

## 📋 Checklist for Each Screen

- [ ] Import API service instead of mockData
- [ ] Add useState for data and loading
- [ ] Add useEffect to load data on mount
- [ ] Update create function to call API
- [ ] Update update function to call API
- [ ] Update delete function to call API
- [ ] Add loading indicators
- [ ] Add error handling (Alert)
- [ ] Add pull-to-refresh
- [ ] Test all operations

---

## 🔧 Common Issues & Solutions

### Issue 1: Network Error
**Problem:** "Network request failed"  
**Solution:** Make sure backend server is running on port 3000

### Issue 2: 401 Unauthorized
**Problem:** API returns 401  
**Solution:** User needs to login first. Authentication flow already works.

### Issue 3: 400 Validation Error
**Problem:** Backend rejects data  
**Solution:** Check data format matches backend expectations (see Data Format section)

### Issue 4: Empty Data
**Problem:** API returns empty array  
**Solution:** Normal! User has no data yet. Show empty state.

---

## ✅ What Works Now

- **Authentication** - Sign in/Sign up already integrated
- **Backend API** - All endpoints working
- **API Service** - All functions available

## 🎯 Next Steps

1. **Start with one screen** (e.g., Tasks)
2. **Follow the pattern** above
3. **Test thoroughly**
4. **Replicate to other screens**

---

## 📱 Testing After Integration

1. **Start backend:** `cd taskmanager1/backend && node src/index.js`
2. **Start mobile:** `cd taskmanager1/mobile-fixed && npm start`
3. **Login** on mobile app
4. **Create a task** - Should save to backend
5. **Close and reopen app** - Task should still be there!
6. **Check backend logs** - Should see API calls
7. **Test in browser** - Same data visible in TEST_CRUD_ENDPOINTS.html

---

## 🎉 Benefits After Integration

- ✅ **Real Data Persistence** - Data survives app restarts
- ✅ **Multi-Device** - Same data on any device (when logged in)
- ✅ **Sync** - Data automatically synced
- ✅ **Backup** - Data stored securely on server
- ✅ **Shareable** - Can add sharing features later

---

## 🚀 Current Status

**API Service:** ✅ Complete and ready  
**Backend:** ✅ Running and tested  
**Mobile Integration:** 🔄 Ready to implement  

**All the infrastructure is in place - just need to connect the UI!**
