# Test Authentication Flow - Quick Guide

## Prerequisites

### 1. Start Backend Server
```bash
cd taskmanager1/backend
npm start
```
✅ You should see: `Server running on port 3000`

### 2. Start Mobile App
```bash
cd taskmanager1/mobile-fixed
npx expo start --lan
```
✅ You should see a QR code in the terminal

### 3. Open in Expo Go
- Scan the QR code with Expo Go app
- OR manually enter: `exp://192.168.0.194:8081`

---

## Test Scenario 1: First Time User (Sign Up)

### Steps:
1. **App opens to SignIn screen** ✅
   - You should NOT see the Home screen
   - You should see "Welcome Back" and sign in form

2. **Click "Don't have an account? Sign up"**
   - Should navigate to SignUp screen
   - Should see "Create Account" form

3. **Fill in the registration form:**
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`

4. **Click "Create Account"**
   - Should see loading indicator
   - Should see "Account created successfully!" alert

5. **After clicking OK on alert:**
   - Should **automatically redirect to Home screen** ✅
   - Should see "Good Morning/Afternoon/Evening, Test User!"
   - Should see all tabs: Home, Tasks, Calendar, Focus, Expenses, Settings

### ✅ Expected Result:
- New account created in backend database
- User automatically logged in
- JWT token saved to device
- Main app accessible

---

## Test Scenario 2: Persistent Login (App Restart)

### Steps:
1. **While logged in, force close the app completely**
   - On iOS: Swipe up from bottom, swipe app away
   - On Android: Recent apps button, swipe app away

2. **Reopen the app in Expo Go**
   - Should briefly show SplashScreen (DayFlow logo)
   - Should **automatically go to Home screen** ✅
   - Should NOT ask for login again

### ✅ Expected Result:
- Token persists across app restarts
- User stays logged in
- No need to sign in again

---

## Test Scenario 3: Logout and Sign Back In

### Steps:
1. **While logged in, navigate to Settings tab**
   - Bottom right tab
   - Should see your profile: "Test User", "test@example.com"

2. **Scroll down to bottom**
   - Should see red "Logout" button

3. **Click "Logout" button**
   - Should see confirmation alert: "Are you sure you want to logout?"

4. **Click "Logout" in the alert**
   - Should see "You have been logged out successfully"
   - Should **automatically redirect to SignIn screen** ✅

5. **Sign in with same credentials:**
   - Email: `test@example.com`
   - Password: `password123`
   - Click "Sign In"

6. **After successful login:**
   - Should see "Logged in successfully!" alert
   - Should redirect to Home screen
   - Should see "Good Morning/Afternoon/Evening, Test User!"

### ✅ Expected Result:
- Logout clears token
- Redirects to SignIn screen
- Can sign back in with same account
- All data accessible again

---

## Test Scenario 4: Backend Connection (Settings)

### Steps:
1. **Log in successfully**

2. **Go to Settings → Backend API (Task B1) section**

3. **Click "🔌 Test Backend Connection"**
   - Should see "Testing..." alert
   - Should see "Backend Connected ✅" with server status

4. **Click "🔐 Check Auth Status"**
   - Should see "Authentication Status"
   - Should show: "✅ Logged in as: Test User, test@example.com"

5. **Click "🔑 Login / Register"**
   - Should navigate to SignIn screen
   - (You're already logged in, so this just shows the screen)

### ✅ Expected Result:
- Backend connection working
- Authentication status correct
- All API endpoints responding

---

## Test Scenario 5: Invalid Credentials

### Steps:
1. **On SignIn screen, enter wrong credentials:**
   - Email: `test@example.com`
   - Password: `wrongpassword`
   - Click "Sign In"

2. **Should see error alert:**
   - "Login Failed: Invalid credentials"
   - Should stay on SignIn screen
   - Should NOT redirect to main app

3. **Try with correct credentials:**
   - Email: `test@example.com`
   - Password: `password123`
   - Should successfully login

### ✅ Expected Result:
- Invalid credentials rejected
- Error message shown
- User stays on login screen
- Valid credentials work

---

## Test Scenario 6: Duplicate Email Registration

### Steps:
1. **On SignUp screen, try to register with existing email:**
   - Full Name: `Another User`
   - Email: `test@example.com` (already registered)
   - Password: `password123`
   - Confirm Password: `password123`
   - Click "Create Account"

2. **Should see error alert:**
   - "Registration Failed: Email already in use"
   - Should stay on SignUp screen

3. **Try with new email:**
   - Email: `test2@example.com`
   - Should successfully create account and login

### ✅ Expected Result:
- Duplicate email prevented
- Clear error message
- New unique email works

---

## Troubleshooting

### Issue: "Failed to connect to server"
**Solution:**
- Check backend is running: `cd backend && npm start`
- Check backend URL in `mobile-fixed/src/services/api.js`
- Update IP address to your computer's local IP
- Make sure phone and computer on same WiFi

### Issue: App crashes on startup
**Solution:**
- Clear Expo cache: `npx expo start --clear`
- Reinstall dependencies: `npm install`
- Check console for errors

### Issue: Stuck on SplashScreen
**Solution:**
- Backend might be down
- Check network connection
- Try force closing and reopening app

### Issue: Token expired
**Solution:**
- Tokens expire after 7 days
- Just login again
- Token will be refreshed

---

## Success Criteria ✅

### Your authentication flow is working correctly if:

1. ✅ App opens to SignIn screen (not Home)
2. ✅ Can register new account
3. ✅ Auto-login after registration
4. ✅ Can sign in with existing account
5. ✅ Token persists across app restarts
6. ✅ Can logout successfully
7. ✅ Redirects to SignIn after logout
8. ✅ Invalid credentials show error
9. ✅ Duplicate email prevented
10. ✅ Backend connection working

---

## What's Working

### Backend (Task B1) ✅
- User registration
- User login
- JWT authentication
- Password hashing
- Input validation
- Error handling

### Frontend (Mobile App) ✅
- SignIn screen
- SignUp screen
- Authentication state management
- Token storage (AsyncStorage)
- Protected routes
- Persistent login
- Logout functionality
- Backend API integration
- Error handling
- Loading indicators

### Integration ✅
- Frontend ↔ Backend communication
- JWT token flow
- Auth status checking
- User session management

---

## Next: Start Testing! 🚀

1. Start backend: `cd backend && npm start`
2. Start mobile: `cd mobile-fixed && npx expo start --lan`
3. Scan QR in Expo Go
4. Follow Test Scenario 1 above

**Expected first screen: SignIn screen (NOT Home screen)**

Enjoy testing your complete authentication flow! 🎉
