const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory at:', uploadsDir);
}


// Import routes
const authRoutes = require('./routes/authRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const cartRoutes = require('./routes/cartRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const offerRoutes = require('./routes/offerRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const priceUpdateRoutes = require('./routes/priceUpdateRoutes.js');
const { ensureDefaultAdmin } = require('./utils/adminSeeder.js');
const { startPriceMonitorJob } = require('./services/priceMonitorService.js');

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
  console.error('❌ FATAL ERROR: JWT_SECRET is not set in environment variables!');
  console.error('Please add JWT_SECRET to your Render Environment Variables dashboard.');
  process.exit(1);
}

// Create Express app
const app = express();

// Middleware
// CORS configuration for local development and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.netlify.app') || 
                      origin.includes('localhost');
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
})); // Enable CORS for frontend

app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from uploads folder
app.use('/uploads', express.static('../uploads'));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Make upload middleware available to routes
app.set('upload', upload);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/price-updates', priceUpdateRoutes);

// Simple test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  console.log('🔗 Test endpoint hit');
  res.json({
    success: true,
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    success: true,
    message: 'Server is running',
    database: dbStatusText[dbStatus] || 'unknown',
    databaseState: dbStatus
  });
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

    // Start the dynamic price monitor background job
    startPriceMonitorJob();
  });
};

startServer();
