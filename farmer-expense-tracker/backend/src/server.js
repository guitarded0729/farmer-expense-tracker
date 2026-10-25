import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import farmerRoutes from './routes/farmerRoutes.js';
import seasonRoutes from './routes/seasonRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import fieldRoutes from './routes/fieldRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or matching FRONTEND_URL
    if (!origin || origin === FRONTEND_URL || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

import { checkPgConnection } from './config/database.js';

// Root API Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🌾 Farmer Expense Tracker Backend API is Active',
    database: checkPgConnection() ? 'PostgreSQL (Live)' : 'In-Memory / Fallback Mode',
    health: '/api/health',
    endpoints: {
      farmers: '/api/farmers',
      seasons: '/api/seasons',
      transactions: '/api/transactions',
      budgets: '/api/budgets',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Farmer Expense Tracker Backend API is running',
    database: checkPgConnection() ? 'PostgreSQL (Live)' : 'In-Memory / Fallback Mode',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Express backend running on http://0.0.0.0:${PORT}`);
});

export default app;
