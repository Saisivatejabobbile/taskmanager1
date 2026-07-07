# 📱 Manual Connection Guide - Bypass QR Code

If QR code scanning isn't working, follow these steps to connect manually:

## ✅ Step-by-Step Manual Connection

### Step 1: Open Expo Go App
- Open the **Expo Go** app on your phone
- If not installed, download from:
  - **Android:** Google Play Store
  - **iOS:** App Store

### Step 2: Enter URL Manually

In Expo Go app:
1. Look for **"Enter URL manually"** option
2. Or tap the **search/add** icon
3. Enter this exact URL:

```
exp://192.168.0.194:8081
```

**Important:** Make sure to type it EXACTLY as shown above!

### Step 3: Wait for App to Load
- The app will connect to your development server
- You'll see a loading screen
- Then the DayFlow app will appear!

---

## 🔧 Alternative Methods

### Method 2: Use Tunnel (If Manual URL Doesn't Work)

1. **Stop the current server:**
   - In the terminal running mobile app, press `Ctrl+C`

2. **Start with tunnel:**
   ```bash
   cd taskmanager1/mobile-fixed
   npx expo start --tunnel
   ```

3. **New URL will appear** - something like:
   ```
   exp://xx-xxx-xxx-xxx-xxx.ngrok.io:80
   ```

4. **Enter this URL** in Expo Go manually

---

### Method 3: Use LAN URL

In your Expo terminal, look for a line that says:
```
› Metro waiting on exp://192.168.0.194:8081
```

Try these variations:
- `exp://192.168.0.194:8081`
- `exp://localhost:8081` (if on same device)
- Check for any other IP addresses shown in terminal

---

## 🚨 Troubleshooting

### Error: "Something went wrong"

**Check 1: Same WiFi Network**
- Your phone and computer MUST be on the same WiFi
- Not mobile data
- Not different WiFi networks

**Check 2: Firewall**
- Windows Firewall might be blocking port 8081
- Temporarily disable firewall to test
- Or add exception for port 8081

**Check 3: IP Address**
- The IP might have changed
- Check your terminal for the correct IP
- Look for line: `Metro waiting on exp://X.X.X.X:8081`

**Check 4: Server Running**
- Make sure the mobile dev server is still running
- Check the terminal for any errors
- Try restarting: `Ctrl+C` then `npm start` again

---

## 🎯 Quick Test: Use Web Version Instead

While troubleshooting mobile connection, you can test in web browser:

1. In the Expo terminal, press **`w`** (for web)
2. This will open the app in your browser
3. You'll see the mobile app interface in browser!

**Note:** Some features like camera, notifications won't work in web, but you can see the UI.

---

## ✅ Verification Steps

Once connected, you should see:
1. **Splash Screen** - DayFlow logo
2. **Sign In Screen** - Login form
3. **Sign Up Option** - Create account button

If you see these, connection is successful!

---

## 💡 Pro Tips

### Tip 1: Use USB Connection (Most Reliable)
If WiFi keeps failing:
1. Connect phone to computer via USB
2. Enable USB debugging (Android) or trust computer (iOS)
3. In terminal, press `a` for Android or `i` for iOS
4. App will install directly via USB

### Tip 2: Check Computer's IP
Run this command to verify IP:
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter

### Tip 3: Restart Everything
Sometimes a fresh start helps:
1. Close Expo Go app completely
2. Stop dev server (Ctrl+C)
3. Restart dev server: `npm start`
4. Reopen Expo Go and try again

---

## 📞 Still Not Working?

Try the **Backend Test Page** in browser instead:
- You already have `TEST_CRUD_ENDPOINTS.html` open
- This lets you test all backend features
- No phone needed!
- Test authentication, tasks, events, expenses, categories

The backend is fully functional and testable in browser!

---

## 🎉 Alternative: Test Backend Only

Since the backend is already running and working perfectly, you can:

1. **Test in Browser** (Already open):
   - `TEST_CRUD_ENDPOINTS.html`
   - Register, login, create tasks, events, expenses
   - See everything working!

2. **View Mobile UI Later**:
   - Focus on backend features first
   - Mobile connection can be debugged separately
   - All mobile features are already built and polished

**The backend is the new functionality anyway!** The mobile app UI was already complete from Track A.

---

## 📋 Current Manual URL

```
exp://192.168.0.194:8081
```

**Copy this and paste it in Expo Go's "Enter URL manually" option.**
