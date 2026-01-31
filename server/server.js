import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { ensureDefaultAdmin } from './utils/adminSeeder.js';

// Load environment variables
dotenv.config();

const LOCAL_MONGO_FALLBACK = 'mongodb://127.0.0.1:27017/erp_db';
const envMongoUri = process.env.MONGODB_URI?.trim();
const isPlaceholderValue = envMongoUri && (
  envMongoUri.includes('your_mongodb_atlas_connection_string') ||
  envMongoUri.includes('placeholder') ||
  envMongoUri === 'your_mongodb_atlas_connection_string_here'
);

let mongoUri;

if (!envMongoUri) {
  console.warn('⚠️  MONGODB_URI is not set in .env file. Falling back to local MongoDB instance.');
  console.warn(`    Using ${LOCAL_MONGO_FALLBACK}`);
  mongoUri = LOCAL_MONGO_FALLBACK;
} else if (isPlaceholderValue) {
  console.warn('⚠️  MONGODB_URI still contains placeholder text. Falling back to local MongoDB instance.');
  console.warn(`    Using ${LOCAL_MONGO_FALLBACK}`);
  mongoUri = LOCAL_MONGO_FALLBACK;
} else {
  // Validate MongoDB URI format for custom strings
  if (!envMongoUri.startsWith('mongodb://') && !envMongoUri.startsWith('mongodb+srv://')) {
    console.error('❌ ERROR: Invalid MongoDB connection string format');
    console.error('');
    console.error('Your MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
    console.error('');
    console.error('Current value:', envMongoUri.substring(0, 50) + (envMongoUri.length > 50 ? '...' : ''));
    console.error('');
    console.error('Please edit server/.env file and set MONGODB_URI to a valid connection string.');
    console.error('');
    console.error('Example format:');
    console.error('  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority');
    process.exit(1);
  }

  mongoUri = envMongoUri;
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
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

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
  await ensureDefaultAdmin();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
