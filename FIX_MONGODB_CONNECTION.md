# 🔧 Fix MongoDB Connection Error

## ❌ Current Error
```
Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"
```

## ✅ Solution: Add Your MongoDB Connection String

Your `.env` file currently has a placeholder. You need to replace it with your actual MongoDB Atlas connection string.

### Quick Fix Steps:

1. **Open the .env file:**
   ```powershell
   notepad server\.env
   ```
   Or manually navigate to `server\.env` and open it in any text editor.

2. **Replace this line:**
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string_here
   ```
   
   **With your actual connection string:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority
   ```

### 📝 How to Get Your MongoDB Connection String:

#### Option 1: If you already have MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Login to your account
3. Click on your cluster
4. Click **"Connect"** button
5. Choose **"Connect your application"**
6. Copy the connection string
7. Replace `<password>` with your database password
8. Add `/erp_db` before the `?` to specify database name

#### Option 2: If you don't have MongoDB Atlas yet

**Step 1: Create Account**
- Go to https://www.mongodb.com/cloud/atlas
- Click "Try Free" and sign up

**Step 2: Create Cluster**
- Click "Create" → "Build a Database"
- Choose **FREE** tier (M0)
- Select a cloud provider and region
- Click "Create"

**Step 3: Create Database User**
- Go to "Database Access" → "Add New Database User"
- Choose "Password" authentication
- Username: `erpadmin` (or any name)
- Password: Create a strong password (SAVE IT!)
- Click "Add User"

**Step 4: Whitelist IP**
- Go to "Network Access" → "Add IP Address"
- Click "Add Current IP Address"
- Or use `0.0.0.0/0` for development (less secure)
- Click "Confirm"

**Step 5: Get Connection String**
- Go to "Database" → Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string
- It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

**Step 6: Format the Connection String**
- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Add `/erp_db` before the `?` to create/use the `erp_db` database
- Final format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority`

### 📋 Example .env File:

```env
PORT=5000
MONGODB_URI=mongodb+srv://erpadmin:MyPassword123@cluster0.abc123.mongodb.net/erp_db?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_key_987654321
```

### ✅ After Editing:

1. **Save the .env file**
2. **Restart your backend server:**
   ```powershell
   cd server
   npm start
   ```

3. **You should see:**
   ```
   ✅ MongoDB connected successfully
   🚀 Server running on port 5000
   ```

### 🔍 Verify Your .env File:

Run this command to check your .env configuration:
```powershell
cd server
.\check-env.ps1
```

---

## ⚠️ Common Mistakes:

1. ❌ Forgetting to replace `<password>` placeholder
2. ❌ Not adding `/erp_db` before the `?`
3. ❌ Having extra spaces around the `=` sign
4. ❌ Using quotes around the connection string (don't use quotes)
5. ❌ Not whitelisting your IP address in MongoDB Atlas

## 🆘 Still Having Issues?

1. Make sure your MongoDB cluster is running (green status in Atlas)
2. Verify your username and password are correct
3. Check that your IP is whitelisted
4. Try the connection string in MongoDB Compass to test it
5. Check MongoDB Atlas logs for connection attempts
