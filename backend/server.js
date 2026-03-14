import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import studentRoutes from './routes/student.js';
import parentRoutes from './routes/parent.js';
import wardenRoutes from './routes/warden.js';
import { startPLExpiryScheduler } from './utils/plExpiryScheduler.js';

// Keep scheduler start (moved inside startServer)
// startPLExpiryScheduler();

const app = express();

// Connect to MongoDB (moved inside startServer)
// connectDB();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://digital-pl.vercel.app"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function(origin, callback) {
   // Allow requests with no origin (like mobile apps or curl)
   if (!origin) return callback(null, true);
   
   // Debug logging
  console.log('CORS Request from:', origin);
  console.log('Allowed origins:', allowedOrigins);
   
   if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
     callback(null, true);
   } else {
    console.log('Blocked by CORS:', origin);
     callback(new Error('Not allowed by CORS'));
   }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/warden', wardenRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Hostel Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      admin: '/api/admin',
      student: '/api/student',
      parent: '/api/parent',
      warden: '/api/warden'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB and Start Server
const startServer = async () => {
  try {
    console.log('--- Starting Hostel Management System ---');
    console.log('Version: 2.1 (WhatsApp Debug Enabled)');
    
    await connectDB();
    console.log('✓ Database Connected');
    
    // Start scheduler after DB connection
    startPLExpiryScheduler();
    console.log('✓ Scheduler Started');

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   Hostel Management System - Backend      ║
║   Server running on port ${PORT}            ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
╚════════════════════════════════════════════╝
      `);
      console.log(`API available at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});