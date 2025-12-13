import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Sweet } from '../entities/Sweet';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // Your NeonDB connection string
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev only
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Sweet],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});

// Helper function to initialize the database connection
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected successfully');
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    throw error;
  }
};