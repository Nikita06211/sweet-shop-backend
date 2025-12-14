import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/dataSource';
import { errorMiddleware } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import sweetsRoutes from './routes/sweets.routes';
import inventoryRoutes from './routes/inventory.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sweet Shop API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);
app.use('/api/sweets', inventoryRoutes); // Inventory routes also use /api/sweets prefix

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if this file is run directly (not when imported in tests)
if (require.main === module) {
  startServer();
}

export default app;