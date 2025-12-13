import 'reflect-metadata';
import { AppDataSource } from '../database/dataSource';

beforeAll(async () => {
  // Increase timeout for database connection
  jest.setTimeout(30000);
  
  // Initialize test database connection
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log('✅ Test database connected');
    } catch (error) {
      console.error('❌ Failed to connect to test database:', error);
      throw error;
    }
  }
}, 30000); // 30 second timeout for this hook

// Cleanup after all tests
afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('✅ Test database connection closed');
  }
}, 10000); // 10 second timeout for cleanup

// Clean database between tests (optional - use test transactions in production)
afterEach(async () => {
  // You can add cleanup logic here if needed
  // For now, we'll handle cleanup in individual tests
});