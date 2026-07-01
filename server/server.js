const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./src/middleware/errorHandler');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const userRoutes = require('./src/routes/userRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const messageRoutes = require('./src/routes/messageRoutes'); // THÊM DÒNG NÀY

// Import passport config
require('./src/config/passport');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression
app.use(compression());

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Passport
app.use(passport.initialize());

// ============================================
// RATE LIMITING
// ============================================
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 500,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (req.path.startsWith('/auth/')) return true;
    if (req.path.startsWith('/test-')) return true;
    if (req.path === '/health') return true;
    return false;
  }
});

app.use('/api', limiter);

// ============================================
// ROUTES
// ============================================

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Computer Store API Server is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      api: {
        auth: '/api/auth',
        products: '/api/products',
        categories: '/api/categories',
        cart: '/api/cart',
        orders: '/api/orders',
        reviews: '/api/reviews',
        users: '/api/users',
        wishlist: '/api/wishlist',
        messages: '/api/messages' // THÊM DÒNG NÀY
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// TEST ROUTES
// ============================================

app.get('/test-db', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    if (!db) {
      return res.json({
        success: false,
        message: 'Database not connected'
      });
    }
    
    const products = await db.collection('products').find({}).toArray();
    const categories = await db.collection('categories').find({}).toArray();
    
    res.json({
      success: true,
      database: mongoose.connection.db.databaseName,
      stats: {
        products: products.length,
        categories: categories.length
      },
      sampleProducts: products.slice(0, 3).map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        category: p.category
      })),
      categories: categories.map(c => ({
        id: c._id,
        name: c.name,
        slug: c.slug
      }))
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

app.get('/test-populate', async (req, res) => {
  try {
    const Product = require('./src/models/Product');
    const products = await Product.find({}).populate('category');
    
    res.json({
      success: true,
      count: products.length,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        category: p.category?.name || 'N/A',
        categoryId: p.category?._id || 'N/A'
      }))
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/messages', messageRoutes); // THÊM DÒNG NÀY

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use(errorHandler);

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/computer-store';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚦 Rate Limit: ${process.env.RATE_LIMIT_MAX || 500} requests per ${process.env.RATE_LIMIT_WINDOW || 15} minutes`);
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📋 API Documentation: http://localhost:${PORT}/`);
    console.log(`🔍 Test DB: http://localhost:${PORT}/test-db`);
    console.log(`📦 Test Populate: http://localhost:${PORT}/test-populate`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health\n`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('💡 Make sure MongoDB is running!');
  console.error('💡 Try: net start MongoDB (Windows) or sudo systemctl start mongod (Linux)');
  process.exit(1);
});

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🔄 Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown();
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  gracefulShutdown();
});

module.exports = app;