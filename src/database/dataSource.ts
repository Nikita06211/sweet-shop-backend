import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Sweet } from '../entities/Sweet';
import dotenv from 'dotenv';
dotenv.config();

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Sweet],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    connectionTimeoutMillis: 10000, // 10 second timeout
  },
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected successfully');
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    console.error('💡 Make sure your DATABASE_URL in .env is correctly formatted');
    throw error;
  }
};