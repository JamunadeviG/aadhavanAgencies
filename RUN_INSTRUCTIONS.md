# 🚀 How to Run Backend and Frontend

## Method 1: Using Scripts (Easiest)

### Option A: Run Both Servers at Once
Double-click `start-all.ps1` - This opens two windows automatically!

### Option B: Run Separately
1. **Backend**: Double-click `start-backend.ps1` or `start-backend.bat`
2. **Frontend**: Double-click `start-frontend.ps1` or `start-frontend.bat` (in a new window)

---

## Method 2: Manual Commands (PowerShell)

### Terminal 1 - Backend:
```powershell
cd server
npm install
npm start
```

### Terminal 2 - Frontend:
```powershell
cd client
npm install
npm run dev
```

---

## Method 3: Manual Commands (Command Prompt)

### Terminal 1 - Backend:
```cmd
cd server
npm install
npm start
```

### Terminal 2 - Frontend:
```cmd
cd client
npm install
npm run dev
```

---

## ⚠️ Important Notes

1. **You need TWO terminal windows** - one for backend, one for frontend
2. **Backend must run first** - wait for "MongoDB connected" message
3. **Keep both terminals open** - closing them stops the servers
4. **Create `.env` file** in `server` folder before running backend:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_12345
   ```

---

## 📋 Quick Checklist

- [ ] MongoDB Atlas connection string ready
- [ ] `.env` file created in `server` folder
- [ ] Backend running (Terminal 1) - shows "Server running on port 5000"
- [ ] Frontend running (Terminal 2) - shows "Local: http://localhost:3000"
- [ ] Browser open at http://localhost:3000

---

## 🛑 To Stop Servers

Press `Ctrl + C` in each terminal window, or just close the terminal windows.
