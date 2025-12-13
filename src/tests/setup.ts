import 'reflect-metadata';
import { AppDataSource } from '../database/dataSource';

beforeAll(async () => {
  // Initialize test database connection
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

// Clean database between tests (optional - use test transactions in production)
afterEach(async () => {
  // You can add cleanup logic here if needed
  // For now, we'll handle cleanup in individual tests
});