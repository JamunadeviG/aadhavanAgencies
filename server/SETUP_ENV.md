# 🔧 Setting Up Your .env File

## ✅ .env File Created!

A `.env` file has been created in the `server` folder. Now you need to add your MongoDB connection string.

## 📝 Steps to Complete Setup

### 1. Get Your MongoDB Atlas Connection String

If you don't have MongoDB Atlas set up yet:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a free cluster (M0)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Username: `erpadmin` (or any name)
   - Password: Create a strong password (save it!)
5. Whitelist your IP:
   - Go to "Network Access" → "Add IP Address"
   - Click "Add Current IP Address"
6. Get connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### 2. Edit Your .env File

Open `server/.env` file and replace the placeholder values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_key_12345_change_this
```

**Important:**
- Replace `your_username` with your MongoDB database username
- Replace `your_password` with your MongoDB database password
- Replace `cluster0.xxxxx` with your actual cluster address
- Add `/erp_db` before the `?` to specify database name
- Change `JWT_SECRET` to any random string (keep it secret!)

### 3. Example .env File

```env
PORT=5000
MONGODB_URI=mongodb+srv://erpadmin:MyPassword123@cluster0.abc123.mongodb.net/erp_db?retryWrites=true&w=majority
JWT_SECRET=my_very_secret_jwt_key_987654321
```

### 4. Save and Restart Server

After editing `.env`, restart your backend server:

```powershell
npm start
```

## ⚠️ Common Issues

### Error: "MONGODB_URI is not set"
- Make sure `.env` file exists in the `server` folder
- Check that `MONGODB_URI=` line is not commented out
- Verify there are no extra spaces around the `=` sign

### Error: "Authentication failed"
- Double-check your username and password in the connection string
- Make sure you replaced `<password>` with your actual password
- Verify your database user exists in MongoDB Atlas

### Error: "IP not whitelisted"
- Go to MongoDB Atlas → Network Access
- Add your current IP address (or use `0.0.0.0/0` for development)

## 🔒 Security Note

- Never commit `.env` file to Git (it's already in .gitignore)
- Never share your MongoDB password publicly
- Use a strong, unique JWT_SECRET in production
