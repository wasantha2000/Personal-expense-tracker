
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import pool from './src/config/db.js';
import categoryRoutes from './src/config/routes/categoryRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Expense Tracker API is running!',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is working correctly',
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      status: 'success',
      message: 'Neon database connected successfully!',
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database connection error:', error.message);

    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

export default app;
