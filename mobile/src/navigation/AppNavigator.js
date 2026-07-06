import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';

// Auth screens
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import SplashScreen from '../screens/auth/SplashScreen';

// Main tab screens
import HomeScreen from '../screens/home/HomeScreen';
import TasksScreen from '../screens/tasks/TasksScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import FocusScreen from '../screens/focus/FocusScreen';
import ExpensesScreen from '../screens/expenses/ExpensesScreen';

// Detail screens
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import AddEditTaskScreen from '../screens/tasks/AddEditTaskScreen';
import EventsScreen from '../screens/calendar/EventsScreen';
import AddEditEventScreen from '../screens/calendar/AddEditEventScreen';
import FocusSessionScreen from '../screens/focus/FocusSessionScreen';
import AddExpenseScreen from '../screens/expenses/AddExpenseScreen';
import BudgetsScreen from '../screens/expenses/BudgetsScreen';
import AccountsScreen from '../screens/expenses/AccountsScreen';
import WeeklySummaryScreen from '../screens/home/WeeklySummaryScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.signalAmber,
        tabBarInactiveTintColor: colors.slate,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.paper,
        },
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.ink,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Focus" component={FocusScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = false; // Will be replaced with real auth state

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.ink,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="AddEditTask" component={AddEditTaskScreen} />
            <Stack.Screen name="Events" component={EventsScreen} />
            <Stack.Screen name="AddEditEvent" component={AddEditEventScreen} />
            <Stack.Screen name="FocusSession" component={FocusSessionScreen} />
            <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
            <Stack.Screen name="Budgets" component={BudgetsScreen} />
            <Stack.Screen name="Accounts" component={AccountsScreen} />
            <Stack.Screen name="WeeklySummary" component={WeeklySummaryScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
