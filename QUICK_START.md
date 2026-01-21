# 🚀 Quick Start Guide - How to Run the ERP Application

Follow these steps to get the application running on your Windows machine.

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js installed (v16 or higher)
  - Check: Open PowerShell and run `node --version`
  - Download: https://nodejs.org/
- ✅ MongoDB Atlas account (free)
  - Sign up: https://www.mongodb.com/cloud/atlas

---

## Step-by-Step Instructions

### Step 1: Setup MongoDB Atlas (One-time setup)

1. Go to https://www.mongodb.com/cloud/atlas and sign up/login
2. Click **"Create"** → **"Build a Database"**
3. Choose **FREE** tier (M0)
4. Choose a cloud provider and region (closest to you)
5. Click **"Create"**
6. Create a database user:
   - Click **"Database Access"** → **"Add New Database User"**
   - Choose **"Password"** authentication
   - Username: `erpadmin` (or any username)
   - Password: Create a strong password (save it!)
   - Click **"Add User"**
7. Whitelist your IP:
   - Click **"Network Access"** → **"Add IP Address"**
   - Click **"Add Current IP Address"** (or use `0.0.0.0/0` for development)
   - Click **"Confirm"**
8. Get your connection string:
   - Click **"Database"** → **"Connect"**
   - Choose **"Connect your application"**
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Replace `<password>` with your database user password
   - Add database name at the end: `...mongodb.net/erp_db?retryWrites=true&w=majority`

---

### Step 2: Setup Backend Server

1. **Open PowerShell** and navigate to the project:
   ```powershell
   cd C:\Users\jayah\OneDrive\Desktop\Projects\consultancy\code\server
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```
   Wait for installation to complete (may take 1-2 minutes)

3. **Create `.env` file**:
   - In the `server` folder, create a new file named `.env` (no extension)
   - Open it in a text editor and add:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority
   JWT_SECRET=my_super_secret_jwt_key_12345
   ```
   - Replace `MONGODB_URI` with your actual MongoDB connection string from Step 1
   - Save the file

4. **Start the backend server**:
   ```powershell
   npm start
   ```
   
   You should see:
   ```
   ✅ MongoDB connected successfully
   🚀 Server running on port 5000
   📍 Health check: http://localhost:5000/api/health
   ```

   **Keep this terminal window open!** The server needs to keep running.

---

### Step 3: Setup Frontend (New Terminal)

1. **Open a NEW PowerShell window** (keep backend running)

2. **Navigate to client folder**:
   ```powershell
   cd C:\Users\jayah\OneDrive\Desktop\Projects\consultancy\code\client
   ```

3. **Install dependencies**:
   ```powershell
   npm install
   ```
   Wait for installation to complete (may take 2-3 minutes)

4. **Start the frontend**:
   ```powershell
   npm run dev
   ```
   
   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:3000/
   ```

---

### Step 4: Access the Application

1. **Open your browser** and go to: `http://localhost:3000`

2. **Register your first admin account**:
   - Click "Register" link
   - Fill in:
     - Name: Your name
     - Email: your@email.com
     - Password: (at least 6 characters)
   - Click "Register"

3. **You'll be automatically logged in** and redirected to the Dashboard!

---

## 🎯 What You Should See

### Dashboard Page
- Total Products count
- Total Stock Quantity
- Navigation buttons

### Products Page
- Empty table (initially)
- "Add Product" button
- Try adding a product:
  - Name: Rice
  - Category: Grains
  - Unit: kg
  - Price: 50
  - Stock: 100

---

## ⚠️ Troubleshooting

### Backend won't start
- **Error: "Cannot find module"**
  - Run `npm install` again in the `server` folder
  
- **Error: "MongoDB connection error"**
  - Check your `.env` file has correct `MONGODB_URI`
  - Make sure you replaced `<password>` in the connection string
  - Verify MongoDB Atlas IP whitelist includes your IP

- **Error: "Port 5000 already in use"**
  - Change `PORT=5001` in `.env` file
  - Or close the application using port 5000

### Frontend won't start
- **Error: "Cannot find module"**
  - Run `npm install` again in the `client` folder

- **Error: "Port 3000 already in use"**
  - Vite will automatically use port 3001, 3002, etc.
  - Check the terminal for the actual port number

### Can't connect to backend
- Make sure backend is running (check terminal)
- Verify backend URL in browser console
- Check `http://localhost:5000/api/health` in browser (should show JSON)

### Login/Register not working
- Check browser console (F12) for errors
- Verify backend is running
- Check MongoDB connection in backend terminal

---

## 📝 Running Commands Summary

**Terminal 1 (Backend)**:
```powershell
cd server
npm install
# Create .env file with MongoDB connection
npm start
```

**Terminal 2 (Frontend)**:
```powershell
cd client
npm install
npm run dev
```

**Browser**: Open `http://localhost:3000`

---

## 🛑 Stopping the Application

1. **Stop Frontend**: In the frontend terminal, press `Ctrl + C`
2. **Stop Backend**: In the backend terminal, press `Ctrl + C`

---

## ✅ Success Checklist

- [ ] MongoDB Atlas account created
- [ ] Database user created
- [ ] IP address whitelisted
- [ ] Connection string copied
- [ ] Backend `.env` file created with correct values
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend server running (`npm start`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Browser opens `http://localhost:3000`
- [ ] Can register/login
- [ ] Can see dashboard
- [ ] Can add products

---

**Need help?** Check the main `README.md` for more details!
