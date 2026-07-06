# 🚀 DayFlow - Quick Start Guide

## ✅ Current Status: Expo Dev Server is RUNNING!

Your Expo development server is now running at:
- **URL**: `http://192.168.0.194:8081`
- **QR Code**: Displayed in your terminal

---

## 📱 How to Test the App (2 Options)

### **Option 1: Expo Go (Recommended for Quick Testing)**

Since we haven't built a custom development client yet, use Expo Go:

#### Step 1: Install Expo Go
- **iOS**: Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: Download from [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

#### Step 2: Switch to Expo Go Mode
In your terminal where Expo is running, **press the 's' key** to switch from Development Build to Expo Go mode.

You should see the message change to:
```
› Using Expo Go
```

#### Step 3: Scan the QR Code
- **iOS**: Open the Camera app and point it at the QR code
- **Android**: Open the Expo Go app and tap "Scan QR code"

---

### **Option 2: Build Development Client (For Full Features)**

If you need native modules (notifications, biometrics), build a custom dev client:

```bash
# For Android
npx expo run:android

# For iOS (macOS only)
npx expo run:ios
```

This will take 10-15 minutes the first time.

---

## 🔧 Terminal Commands Available

In the terminal where Expo is running, you can press:

- **`s`** - Switch between Expo Go and Development Build
- **`a`** - Open on Android emulator/device
- **`i`** - Open on iOS simulator (macOS only)  
- **`w`** - Open in web browser
- **`r`** - Reload the app
- **`m`** - Toggle menu
- **`?`** - Show all commands
- **`Ctrl+C`** - Stop the server

---

## 🐛 QR Code Not Working?

### Problem: "QR code requires development build"

**Solution**: Press `s` in the terminal to switch to Expo Go mode.

### Problem: "App doesn't load after scanning"

**Solutions**:
1. Make sure your phone and computer are on the **same WiFi network**
2. Check if your firewall is blocking port 8081
3. Try the tunnel option: `npx expo start --tunnel`

### Problem: "Error loading JavaScript bundle"

**Solution**: Clear cache and restart
```bash
npx expo start --clear
```

---

## 📍 Current Server Info

```
IP Address: 192.168.0.194
Port: 8081
Mode: Development Build (press 's' to switch to Expo Go)
```

---

## 🎯 What You'll See

When the app loads successfully, you'll see:

1. **Splash Screen** with "DayFlow" logo
2. Two buttons: "Sign In" and "Create Account"
3. Both screens are visual only (no real authentication yet)

To see the main app screens:
- The auth flow is currently just UI
- To bypass and see the main app, edit `src/navigation/AppNavigator.js` line 50
- Change `const isAuthenticated = false;` to `const isAuthenticated = true;`

---

## ✨ Testing the UI

Once loaded, you can navigate through:

- **Home Tab**: See today strip, stats, and upcoming tasks
- **Tasks Tab**: View mock tasks, filter, and tap to see details
- **Calendar Tab**: Week view and timeline
- **Focus Tab**: See streak counter and focus links
- **Expenses Tab**: View income/expense dashboard

Everything uses mock data right now - no backend connection yet!

---

## 💡 Pro Tips

1. **Hot Reload**: Save any file and the app reloads automatically
2. **Shake Device**: Opens developer menu on physical device
3. **Logs**: All console.log() output appears in the terminal
4. **Errors**: Red error screens show in the app + terminal

---

## 🔄 Next Steps

After testing Task A1 UI:
- Continue with **Task A2** (notifications)
- Or start **Track B** (backend API)
- Or start **Track C** (infrastructure)

---

## 📞 Need Help?

Common issues and solutions are in `DAYFLOW_MANUAL.md` under the Troubleshooting section.

**Server is running!** Go test the app now! 🎉
