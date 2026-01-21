import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

// Load environment variables
dotenv.config();

// Check if required environment variables are set
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is not set in .env file');
  console.error('');
  console.error('Please create a .env file in the server folder with:');
  console.error('  PORT=5000');
  console.error('  MONGODB_URI=your_mongodb_atlas_connection_string');
  console.error('  JWT_SECRET=your_secret_key_here');
  console.error('');
  console.error('Example MONGODB_URI:');
  console.error('  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority');
  process.exit(1);
}

// Validate MongoDB URI format
const mongoUri = process.env.MONGODB_URI.trim();
if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
  console.error('❌ ERROR: Invalid MongoDB connection string format');
  console.error('');
  console.error('Your MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  console.error('');
  console.error('Current value:', mongoUri.substring(0, 50) + (mongoUri.length > 50 ? '...' : ''));
  console.error('');
  console.error('Please edit server/.env file and set MONGODB_URI to a valid connection string.');
  console.error('');
  console.error('Example format:');
  console.error('  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority');
  console.error('');
  console.error('Steps to get your connection string:');
  console.error('  1. Go to https://www.mongodb.com/cloud/atlas');
  console.error('  2. Sign up/login and create a free cluster');
  console.error('  3. Create a database user');
  console.error('  4. Whitelist your IP address');
  console.error('  5. Click "Connect" → "Connect your application"');
  console.error('  6. Copy the connection string');
  console.error('  7. Replace <password> with your actual password');
  console.error('  8. Add /erp_db before the ? to specify database name');
  process.exit(1);
}

// Check if it's still the placeholder value
if (mongoUri.includes('your_mongodb_atlas_connection_string') || 
    mongoUri.includes('placeholder') ||
    mongoUri === 'your_mongodb_atlas_connection_string_here') {
  console.error('❌ ERROR: MONGODB_URI is still set to placeholder value');
  console.error('');
  console.error('Please edit server/.env file and replace the placeholder with your actual MongoDB connection string.');
  console.error('');
  console.error('Get your connection string from MongoDB Atlas:');
  console.error('  https://www.mongodb.com/cloud/atlas');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is not set in .env file');
  console.error('Please add JWT_SECRET=your_secret_key_here to your .env file');
  process.exit(1);
}

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('');
    console.error('Please check:');
    console.error('  1. Your MONGODB_URI in .env file is correct');
    console.error('  2. You replaced <password> with your actual password');
    console.error('  3. Your IP address is whitelisted in MongoDB Atlas');
    console.error('  4. Your MongoDB cluster is running');
    console.error('  5. Your username and password are correct');
    console.error('');
    console.error('Connection string format should be:');
    console.error('  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority');
    process.exit(1); // Exit process if database connection fails
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
