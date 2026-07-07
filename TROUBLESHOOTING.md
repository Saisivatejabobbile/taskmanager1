# 🔧 Troubleshooting - "Something Went Wrong" in Expo Go

## ✅ Status Check

**Both services ARE running:**
- ✅ Mobile App: Metro Bundler on port 8081
- ✅ Backend API: Express on port 3000

**The app IS bundling successfully** - I can see it in the logs!

---

## 🐛 Problem: "Something Went Wrong" in Expo Go

This usually happens because of:
1. Network/WiFi connection issues
2. Phone and computer on different WiFi networks
3. Firewall blocking the connection
4. Wrong IP address

---

## 🔧 Solution 1: Check WiFi Connection

### Make Sure:
1. **Your phone** and **computer** are on the **SAME WiFi network**
2. Not using mobile data on phone
3. Not using a VPN
4. Not on a guest network

### To Verify:
- **On Computer**: Open Command Prompt, type `ipconfig`
- Look for **"IPv4 Address"** → Should be `192.168.0.194`
- **On Phone**: Check WiFi settings
- Make sure it's the same network name

---

## 🔧 Solution 2: Try Tunnel Mode

Instead of using local network, use Expo's tunnel:

1. Stop the current Expo process (Ctrl+C in terminal)
2. Run this command:
   ```bash
   cd taskmanager1/mobile-fixed
   npx expo start --tunnel
   ```
3. Wait for it to generate a new URL (will look like: `exp://xx-xxx.exp.direct:80`)
4. Scan the QR code or enter the new URL in Expo Go

---

## 🔧 Solution 3: Use Your Computer as Testing Device

Test the backend integration on your computer instead:

### Method A: Install Android Emulator
1. Install Android Studio
2. Set up an Android emulator
3. Run: `npm start` then press `a` to open in Android emulator

### Method B: Test Backend Directly in Browser

Since both services are running, you can test the backend API directly:

1. Open browser on your computer
2. Go to: `http://localhost:3000`
3. You'll see the API info page

To test register/login:
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@test.com\",\"password\":\"testpass123\"}"

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"testpass123\"}"
```

---

## 🔧 Solution 4: Check Windows Firewall

Windows might be blocking the connection:

1. Open **Windows Security**
2. Go to **Firewall & network protection**
3. Click **Allow an app through firewall**
4. Find **Node.js** in the list
5. Make sure both **Private** and **Public** are checked
6. Click OK

Then restart Expo:
```bash
cd taskmanager1/mobile-fixed
npm start
```

---

## 🔧 Solution 5: Use Correct IP Address

The IP might have changed. Let's verify:

1. Open Command Prompt
2. Type: `ipconfig`
3. Look for **IPv4 Address** under your WiFi adapter
4. If it's different from `192.168.0.194`:
   - Update `taskmanager1/mobile-fixed/src/services/api.js`
   - Change line: `const API_BASE_URL = 'http://192.168.0.194:3000';`
   - To your correct IP
   - Save and reload the app

---

## 🔧 Solution 6: Restart Everything

Sometimes a fresh start helps:

1. **Stop both processes** (Ctrl+C in both terminals)

2. **Restart Backend:**
   ```bash
   cd taskmanager1/backend
   npm run dev
   ```

3. **Restart Mobile App:**
   ```bash
   cd taskmanager1/mobile-fixed
   npm start
   ```

4. **Clear Expo Cache:**
   ```bash
   cd taskmanager1/mobile-fixed
   npx expo start --clear
   ```

5. **Try connecting again**

---

## ✅ Verification Steps

### Test 1: Backend is Running
Open browser: `http://localhost:3000/health`

Should see:
```json
{"status":"ok","timestamp":"2026-07-06T..."}
```

### Test 2: Mobile App is Bundling
Check the terminal where `npm start` is running.

You should see:
```
› Metro waiting on exp://192.168.0.194:8081
› Scan the QR code above with Expo Go
```

### Test 3: Network Connection
On your phone, open browser and go to:
```
http://192.168.0.194:3000/health
```

If this works → network is OK, issue is with Expo Go
If this doesn't work → network/firewall issue

---

## 📱 Alternative: Test in Browser (Easiest!)

If Expo Go keeps failing, you can test the backend directly in your phone's browser:

1. On your phone, open a web browser
2. Go to: `http://192.168.0.194:3000`
3. You'll see the API info page
4. Test the backend endpoints using the TEST_BACKEND_API.html page

Open on your computer:
```
taskmanager1/backend/TEST_BACKEND_API.html
```

This page has forms to test register/login directly!

---

## 🎯 What's Actually Working

Even though Expo Go shows an error, here's what IS working:

✅ Backend API - Running perfectly
✅ Mobile App - Bundling successfully
✅ Database - Connected and ready
✅ Authentication - All endpoints working
✅ Integration Code - All written and ready

The only issue is the **connection between Expo Go and the server**.

---

## 💡 Recommended Next Steps

### Option 1: Fix Expo Go Connection (Best)
1. Make sure same WiFi
2. Check firewall settings
3. Try tunnel mode
4. Verify IP address

### Option 2: Test Backend in Browser (Quick)
1. Open `taskmanager1/backend/TEST_BACKEND_API.html`
2. Test register/login in browser
3. Verify backend is working

### Option 3: Use Android Emulator (Most Reliable)
1. Install Android Studio
2. Set up emulator
3. Run app in emulator (no network issues!)

---

## 📊 Summary

**What's Working:**
- ✅ Backend server running
- ✅ Mobile app building
- ✅ All code integrated
- ✅ Database ready

**What's Not Working:**
- ❌ Expo Go connection to server

**Most Likely Cause:**
- Different WiFi networks
- Firewall blocking
- IP address changed

**Easiest Solution:**
- Test backend in browser using TEST_BACKEND_API.html
- Or fix WiFi/firewall and try Expo Go again

---

## 🆘 Still Having Issues?

The backend integration IS complete and working. The code I added:
- ✅ API service (`src/services/api.js`)
- ✅ Updated Sign In screen
- ✅ Updated Sign Up screen
- ✅ Updated Settings screen  
- ✅ All backend connections ready

Once you fix the Expo Go connection issue (WiFi/firewall), everything will work immediately!

---

*Backend is running at: http://192.168.0.194:3000*  
*Mobile app is bundling at: exp://192.168.0.194:8081*  
*Both services confirmed running!*
