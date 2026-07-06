# DayFlow - Complete Manual & Documentation

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Installation Guide](#installation-guide)
3. [Project Overview](#project-overview)
4. [Build Blueprint Reference](#build-blueprint-reference)
5. [Task Progress Tracker](#task-progress-tracker)
6. [API Contract Reference](#api-contract-reference)
7. [Design System Guide](#design-system-guide)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- For iOS: macOS with Xcode
- For Android: Android Studio
- Expo Go app (for initial testing) or build dev client

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Saisivatejabobbile/taskmanager1.git
cd taskmanager1

# Navigate to mobile app
cd mobile

# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platform
npm run android  # Android
npm run ios      # iOS (macOS only)
npm run web      # Web browser
```

---

## 📦 Installation Guide

### Step 1: Set Up Environment

**For Windows:**
```bash
# Install Node.js from https://nodejs.org/
# Verify installation
node --version
npm --version
```

**For macOS:**
```bash
# Install using Homebrew
brew install node
brew install watchman
```

**For Linux:**
```bash
# Using apt (Ubuntu/Debian)
sudo apt update
sudo apt install nodejs npm
```

### Step 2: Install Expo CLI

```bash
# Global install (optional)
npm install -g expo-cli

# Or use npx (recommended)
npx expo --version
```

### Step 3: Set Up Mobile Development

**For Android:**
1. Download and install [Android Studio](https://developer.android.com/studio)
2. Install Android SDK and create a virtual device (AVD)
3. Add Android SDK to PATH:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

**For iOS (macOS only):**
1. Install Xcode from App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

### Step 4: Install Project Dependencies

```bash
cd taskmanager1/mobile
npm install
```

### Step 5: Start Development

```bash
# Start Expo development server
npm start

# Or with dev client (after building)
npm start -- --dev-client
```

---

## 🏗️ Project Overview

### Architecture

**DayFlow** is a comprehensive task management system with:
- **Frontend**: React Native (Expo) mobile app
- **Backend**: Node.js + Express + Prisma + PostgreSQL (to be built)
- **Infrastructure**: Managed services on Railway/Render/Supabase (to be provisioned)

### Current Status: **Phase A1 Complete** ✅

The mobile app UI is fully built with mock data. No backend connection yet.

### Tech Stack

**Mobile (Current):**
- React Native 0.86
- Expo SDK 57 with Dev Client
- React Navigation (Stack + Bottom Tabs)
- date-fns for date handling
- ESLint + Prettier

**Backend (Planned):**
- Node.js + Express
- Prisma ORM
- PostgreSQL database
- JWT authentication
- BullMQ + Redis for jobs

---

## 📋 Build Blueprint Reference

### Parallel Build Tracks

DayFlow is being built in **3 parallel tracks**:

#### **Track A - Mobile Agent** (Your current track)
- ✅ **A1**: Skeleton + Full UI (COMPLETE)
- ⏳ **A2**: On-Device Alert Scaffolding (NEXT)
- ⏳ **A3**: Client-Only Smart Features
- ⏳ **A4**: Polish

#### **Track B - Backend Agent** (Not started)
- ⏳ **B1**: Skeleton + Auth API
- ⏳ **B2**: Core Data API
- ⏳ **B3**: Notification Backend
- ⏳ **B4**: Dashboard Aggregation

#### **Track C - Infrastructure Agent** (Not started)
- ⏳ **C1**: Provisioning
- ⏳ **C2**: Store Listing Shells

### Sync Points

| Sync Point | Dependencies | Description |
|------------|--------------|-------------|
| **Sync 1** | A1 + B1 | Wire authentication |
| **Sync 2** | A1 + B2 | Wire all screens to real data |
| **Sync 3** | A2 + B2 + B3 | Wire alert engine end-to-end |
| **Sync 4** | A3 + B2 | Wire bulk/search/export features |
| **Sync 5** | A4 + B4 | Wire dashboard aggregation |

---

## ✅ Task Progress Tracker

### Track A - Mobile (Current)

| Task | Status | Description | Model Used |
|------|--------|-------------|------------|
| **A1** | ✅ COMPLETE | Skeleton + Full UI with mock data | Claude Sonnet 4.5 |
| **A2** | ⏳ PENDING | On-device alert scaffolding (Notifee) | Recommended: Claude Sonnet 4.5 |
| **A3** | ⏳ PENDING | Client-only smart features (NLP, voice) | Recommended: Claude Sonnet 4.5 |
| **A4** | ⏳ PENDING | Polish (animations, accessibility) | Recommended: Claude Sonnet 4.5 |

### What's Next: **Task A2**

**A2 - On-Device Alert Scaffolding** will add:
- Notifee for local push notifications
- 3 notification channels (task, event, budget)
- Multiple reminder lead-times per item
- Snooze (5/10/15 min) and Stop actions
- Escalation logic (follow-up if not dismissed)
- TTS-to-file pipeline for task names as notification sounds
- Battery optimization exemption request (Android)
- Testing against mock Reminder objects

**Estimated Time:** 15-20 minutes
**Dependencies:** None (independent task)
**Deliverables:**
- Notifee configured with 3 channels
- Background event handlers for actions
- Mock reminder scheduling system
- Battery optimization UI flow
- TTS pipeline for task names

---

## 📝 API Contract Reference

### Data Models (Mock Data Currently)

All mock data is in `src/data/mockData.js` and matches this contract:

#### User
```javascript
{
  id: String,
  name: String,
  email: String,
  avatarUrl: String?
}
```

#### Task
```javascript
{
  id: String,
  title: String,
  notes: String?,
  dueDate: DateTime?,
  priority: "high" | "medium" | "low",
  categoryId: String?,
  status: "pending" | "completed",
  recurrenceRule: String?,  // iCal RRULE format
  resourceLinks: [{ url: String, label: String }],
  subtasks: [{ id: String, title: String, done: Boolean }]
}
```

#### Event
```javascript
{
  id: String,
  title: String,
  eventDate: DateTime,
  alertDaysBefore: Number,
  repeatsYearly: Boolean,
  category: String?
}
```

#### FocusLink
```javascript
{
  id: String,
  label: String,
  url: String
}
```

#### FocusSession
```javascript
{
  id: String,
  focusLinkId: String,
  startedAt: DateTime,
  endedAt: DateTime?,
  note: String?
}
```

#### Expense
```javascript
{
  id: String,
  amount: Decimal,
  direction: "credit" | "debit",
  categoryId: String?,
  note: String?,
  occurredAt: DateTime,
  recurrenceRule: String?
}
```

#### Budget
```javascript
{
  id: String,
  categoryId: String,
  monthlyLimit: Decimal
}
```

#### Account
```javascript
{
  id: String,
  name: String,
  type: "cash" | "bank" | "card"
}
```

#### Category
```javascript
{
  id: String,
  name: String,
  type: "task" | "expense",
  color: String  // Hex color
}
```

---

## 🎨 Design System Guide

### Color Palette

```javascript
// Primary Colors
Paper: #F3F5F4    // Main background
Ink: #1C2430      // Primary text, dark surfaces
Slate: #6B7680    // Secondary text, icons
White: #FFFFFF    // Cards, contrast

// Accent Colors
Signal Amber: #E8A33D   // Primary accent - CTAs, active states, alerts
Focus Teal: #2F8F82     // Secondary accent - focus module, positive states
Alert Coral: #E2604F    // Destructive actions, budget warnings
```

### Usage Guidelines

| Color | When to Use | Examples |
|-------|-------------|----------|
| **Signal Amber** | Primary actions, active states, alert-related features | Buttons, active tabs, task alerts |
| **Focus Teal** | Focus/study features, positive confirmations | Focus timer, completion states |
| **Alert Coral** | Destructive actions, warnings, over-budget | Delete buttons, budget exceeded |

### Typography

**Fonts:**
- **Manrope**: All UI text and labels
- **IBM Plex Mono**: Numbers that matter (countdown, amounts, timers)

**Sizes:**
```javascript
xs: 12,
sm: 14,
base: 16,
lg: 18,
xl: 20,
xxl: 24,
xxxl: 32
```

**Number Emphasis:**
Numbers should always be in IBM Plex Mono and larger/bolder than surrounding text:
- Countdown days
- Streak counts
- Timer digits
- Money amounts
- Statistics

### Spacing Scale

```javascript
xs: 4,
sm: 8,
md: 12,
lg: 16,
xl: 24,
xxl: 32
```

### Layout Principles

1. **Today Strip**: Horizontal persistent strip at top of Home (not a decorative hero)
2. **One Accent Per Screen**: One color doing the "loud" work per screen
3. **Generous Whitespace**: Let content breathe
4. **Data Emphasis**: Numbers stand out as "data that matters"

### Copy Tone

- **Action-oriented**: "Add task" not "Create entity"
- **Inviting empty states**: "Nothing due today — add your first task"
- **Plain errors**: State what happened and what to do next
- **No jargon**: Speak plainly

---

## 🖥️ Screen Reference

### Authentication Flow

1. **Splash Screen**
   - Logo and tagline
   - "Sign In" and "Create Account" buttons

2. **Sign In**
   - Email and password fields
   - Link to Sign Up

3. **Sign Up**
   - Name, email, password, confirm password
   - Link to Sign In

### Main App (Bottom Tabs)

#### 1. Home Tab
- **Today Strip**: Horizontal scroll of next 3-4 items
- **Quick Stats**: 4 cards (tasks due, days to event, streak, weekly spending)
- **Upcoming Tasks**: List with priority dots
- **View Weekly Summary** button

#### 2. Tasks Tab
- **Search bar** at top
- **Filters**: All / Pending / Done
- **Task cards**: 
  - Checkbox, title, notes preview
  - Category badge, due date
  - Priority indicator (vertical colored bar)
- **FAB** (Floating Action Button) for quick add

**Task Detail Screen:**
- Title with Edit button
- Notes section
- Due date (formatted nicely)
- Priority badge (colored)
- Category badge
- Recurrence rule
- Subtasks list (with checkboxes)
- Resource links
- Delete button (Alert Coral)

**Add/Edit Task Screen:**
- Title input (required)
- Notes textarea
- Priority buttons (Low/Medium/High)
- Category grid (colored buttons)
- Due date input
- Recurrence input
- Add Subtask button
- Add Resource Link button
- Save button

#### 3. Calendar Tab
- **Week View**: 7 days, current day highlighted in Signal Amber
- **"View All Events"** button
- **Timeline**: Scrollable list of all tasks + events sorted by date

**Events Screen:**
- Event cards with:
  - Title
  - "Yearly" badge if repeats
  - Date
  - Countdown badge (large number of days)
- FAB for adding events

**Add/Edit Event Screen:**
- Title input
- Event date input
- Alert days before (numeric)
- Repeats yearly toggle switch

#### 4. Focus Tab
- **Streak Card**: Large number showing current streak
- **Focus Links** section: Cards with label and URL
- **Add Focus Link** button (dashed border, Focus Teal)
- **Recent Sessions**: Cards showing link, duration, note, timestamp

**Focus Session Screen:**
- Link name at top
- **Large circular timer**: Shows MM:SS in IBM Plex Mono
- Control buttons: Start/Pause, Reset
- **Session Notes** textarea at bottom

#### 5. Expenses Tab
- **Summary Card**:
  - Income (green) and Expenses (red) side by side
  - Net amount below
- **Quick Actions**: Budgets and Accounts buttons
- **Recent Transactions**: Cards with note, category badge, date, amount

**Add Expense Screen:**
- Type toggle: Expense (red) / Income (green)
- Amount input (decimal)
- Category grid (colored)
- Account selection (list of radio buttons)
- Note textarea
- Save button

**Budgets Screen:**
- Budget cards showing:
  - Category name
  - "On Track" or "Over Budget" status
  - Amount spent vs limit
  - Progress bar (Alert Coral if over)
- Add Budget button

**Accounts Screen:**
- Simple list of accounts with name and type
- Add Account button

#### Settings/Profile
- Avatar circle with initials
- User name and email
- **Security** section: PIN Lock, Biometric Auth
- **Notifications** section: Task Reminders, Event Alerts, Budget Warnings
- **Data** section: Backup & Sync, Export Data
- Logout button (Alert Coral)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Metro bundler not starting"
```bash
# Clear cache and restart
npx expo start --clear
```

#### 2. "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

#### 3. "Android build fails"
```bash
# Clean Android build
cd android
./gradlew clean
cd ..
npm run android
```

#### 4. "iOS build fails" (macOS)
```bash
# Reinstall pods
cd ios
pod deinstall
pod install
cd ..
npm run ios
```

#### 5. "Expo Dev Client not working"
```bash
# Rebuild dev client
npx expo prebuild
npx expo run:android  # or run:ios
```

### Platform-Specific Issues

**Windows:**
- Use Git Bash or WSL2 for better terminal experience
- Ensure Android SDK path is correct in environment variables

**macOS:**
- Ensure Xcode Command Line Tools are installed: `xcode-select --install`
- Check CocoaPods version: `pod --version`

**Linux:**
- Android emulator may need virtualization enabled in BIOS
- Install 32-bit libraries if needed

### Performance Issues

**Slow development server:**
```bash
# Disable network inspect
npx expo start --no-dev --minify
```

**App crashes on device:**
- Check for console errors: `npx expo start` then press `j` to open debugger
- Use React DevTools: `npx react-devtools`

---

## 📚 Additional Resources

### Official Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

### Design Resources
- [Manrope Font](https://fonts.google.com/specimen/Manrope)
- [IBM Plex Mono Font](https://fonts.google.com/specimen/IBM+Plex+Mono)
- [React Native UI Libraries](https://reactnative.directory/)

### Tools
- [Expo Snack](https://snack.expo.dev/) - Online playground
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - Desktop debugging tool

---

## 📞 Support & Contribution

### Getting Help

1. Check this manual first
2. Review the task completion documents (TASK_A1_COMPLETE.md, etc.)
3. Check GitHub issues in the repository
4. Review Expo forums and React Native community

### Project Repository

**GitHub**: https://github.com/Saisivatejabobbile/taskmanager1

### Next Steps

To continue building DayFlow:
1. Complete Task A2 (On-Device Alert Scaffolding)
2. Complete Tasks A3 and A4
3. Build Backend (Track B tasks)
4. Connect frontend to backend (Sync Points)
5. Deploy and test

---

## 📄 License & Credits

**Project**: DayFlow Task Manager
**License**: (To be determined)
**Built with**: React Native, Expo, React Navigation, and ❤️

---

**Document Version**: 1.0
**Last Updated**: July 5, 2026
**Current Phase**: A1 Complete, A2 Pending
