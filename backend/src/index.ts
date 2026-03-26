// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Only load from backend/.env (where the main config is)
const envPath = path.join(__dirname, '..', '.env');

console.log('=== Environment Variable Loading ===');
console.log('Loading .env from:', envPath);
console.log('');

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log('✓ Loaded: backend/.env');
  }
} else {
  console.log('⚠ No .env file found at:', envPath);
}

console.log('');

// Validate critical environment variables
console.log('\n=== Environment Variable Check ===');
console.log('PORT:', process.env.PORT || 'Not set (will use 5000)');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✓ Set' : '✗ Missing');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✓ Set' : '✗ Missing');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set (will use http://localhost:3000)');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✓ Set' : '✗ Missing');
console.log('=====================================\n');

// Now import other modules AFTER environment is configured
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import { logInfo, logError } from './utils/logger';
import connectDB from './utils/database';
import dashboardRoutes from './routes/dashboard.routes';
import employeeRoutes from './routes/employee.routes';
import inventoryRoutes from './routes/inventory.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import productionRoutes from './routes/production.routes';
import qualityRoutes from './routes/quality.routes';
import authRoutes from './routes/auth.routes';
import subscriptionRoutes from './routes/subscription.routes';

// Import passport AFTER environment variables are loaded
import passport from './config/passport';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'manuf-system-session-secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logError('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Database connection and server startup
const startServer = async () => {
  try {
    await connectDB();
    logInfo('Database connection established successfully.');

    app.listen(PORT, () => {
      logInfo(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logError('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();