import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { startCronJobs } from './cron/cronJobs.js';
import errorHandler from './middlewares/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import linkedinRoutes from './routes/linkedinRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import automationRoutes from './routes/automationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import engagementRoutes from './routes/engagementRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize payment system (currencies + pricing)
import initializePaymentSystem from './config/initCurrencies.js';
initializePaymentSystem();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AutoLink API is running',
    timestamp: new Date().toISOString(),
    automation: 'Active'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   🚀 AutoLink Backend Started!            ║
║                                            ║
║   📡 Server: http://localhost:${PORT}       ║
║   🏥 Health: http://localhost:${PORT}/health║
║   📝 Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                            ║
║   ⚡ Fully Automated LinkedIn Posts        ║
║   🤖 AI-Powered Content Generation         ║
║   📅 Cron: 9 AM, 2 PM, 6 PM Daily         ║
║                                            ║
╚════════════════════════════════════════════╝
  `);
  
  // Start cron jobs for automation
  startCronJobs();
  
  console.log('✅ All systems operational!\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

export default app;
