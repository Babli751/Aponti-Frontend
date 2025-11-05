# BarberPro Demo Guide

## 🎯 Demo Credentials

This is a **frontend-only demo** that doesn't require a real backend server.

### 🎆 NEW: Auto-Account Creation!

**You can now use ANY email and password combination!** The system will automatically create an account for you.

Examples:
- `bb10901@gmail.com` / `b210198k` ✅
- `john@example.com` / `mypassword` ✅
- `test123@demo.com` / `123` ✅

### Pre-configured Demo Accounts:

1. **Demo User**
   - Email: `demo@barberpro.com`
   - Password: `password123`

2. **Test User**
   - Email: `test@test.com`
   - Password: `123456`

### 🔄 Authentication Flow

1. **Sign Up** → Creates account → Redirects to **Sign In** page
2. **Sign In** → Logs in → Redirects to **Home** page
3. **Profile** → Shows user name in top-right corner when logged in

## 🛠️ Troubleshooting

### If Login Fails:

1. **Try ANY credentials**: The system now auto-creates accounts, so any email/password should work!

2. **Use Pre-configured accounts**:
   - `demo@barberpro.com` / `password123`
   - `test@test.com` / `123456`

3. **Use Auto-Fill**: Click the "Use Demo User" or "Use Test User" buttons on the sign-in page

4. **Test Specific Account**: Click "Test bb10901@gmail.com" to test the exact credentials from your error

5. **Test System**: Click the "Test Login" button to verify the system is working

6. **Clear Browser Data**: If still having issues, clear localStorage:
   ```javascript
   // Open browser console and run:
   localStorage.clear();
   location.reload();
   ```

## 🎮 Demo Features

- ✅ User Registration & Login
- ✅ User Profile Display
- ✅ Responsive Design
- ✅ Multi-language Support (EN/TR/RU)
- ✅ Mock Authentication System
- ✅ Local Storage Persistence

## 🔧 Development Notes

- The app uses a mock authentication system in development
- To connect to a real backend, set `REACT_APP_API_URL` in `.env.local`
- All demo data is stored in browser localStorage
- Debug logs are available in browser console (development mode only)

## 📱 Mobile Testing

The app is fully responsive and works on:
- Desktop browsers
- Mobile devices
- Tablets

## 🌐 Production Ready

To deploy with a real backend:

1. Set up your FastAPI/Django backend
2. Configure `REACT_APP_API_URL=https://your-api.com/api`
3. The app will automatically switch to real API calls
