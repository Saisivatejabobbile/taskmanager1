# DayFlow Mobile App

React Native app built with Expo (Dev Client) for the DayFlow task management system.

## 🎨 Design System

- **Colors**: Paper (#F3F5F4), Ink (#1C2430), Slate (#6B7680), Signal Amber (#E8A33D), Focus Teal (#2F8F82), Alert Coral (#E2604F)
- **Typography**: Manrope (UI), IBM Plex Mono (numbers/data)
- **Spacing**: 4/8/12/16/24/32px scale

## 📱 Features (A1 - UI Complete with Mock Data)

### Authentication
- Splash screen
- Sign in / Sign up screens

### Main Screens
- **Home Dashboard**: Today strip with quick stats, upcoming tasks, weekly summary link
- **Tasks**: List view with filters (All/Pending/Done), search, priority indicators, add/edit/detail views with subtasks and resource links
- **Calendar**: Week view, timeline of tasks and events, events list with countdown badges
- **Focus**: Focus links management, Pomodoro timer (25 min), streak counter, session notes
- **Expenses**: Income/expense tracking, category-based organization, budgets with progress bars, accounts management

### Additional Screens
- Weekly Summary with insights
- Settings/Profile with security placeholders

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the dev client
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

## 📦 Project Structure

```
src/
├── components/       # Reusable components (TodayStrip, etc.)
├── data/            # Mock data matching API contract
├── navigation/      # Navigation configuration (Stack + Tabs)
├── screens/         # All screen components organized by feature
├── theme/           # Colors, typography, spacing
└── services/        # (Future: API calls)
```

## ⚠️ Current State

This is **Phase A1** - Complete UI with mock data only. The app is NOT connected to any backend yet. All data is static mock data defined in `src/data/mockData.js`.

## 🔄 Next Steps

- **A2**: On-device alert scaffolding with Notifee
- **A3**: Client-only smart features (NLP parsing, voice input, etc.)
- **A4**: Polish (animations, accessibility)
- **Sync Points**: Wire to real backend APIs

## 🛠 Tech Stack

- React Native 0.86
- Expo SDK 57 with Dev Client
- React Navigation (Stack + Bottom Tabs)
- date-fns for date handling
- ESLint + Prettier for code quality
