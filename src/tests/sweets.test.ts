import 'reflect-metadata';
import request from 'supertest';
import app from '../app';
import { AppDataSource } from '../database/dataSource';
import { Sweet } from '../entities/Sweet';
import { User } from '../entities/User';
import { generateToken, JwtPayload } from '../utils/jwt.util';

describe('Sweets API', () => {
  let authToken: string;
  let adminToken: string;
  let testUser: User;
  let adminUser: User;

  beforeAll(async () => {
    // Ensure database is initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Create test user
    const userRepository = AppDataSource.getRepository(User);
    testUser = userRepository.create({
      email: 'testuser@example.com',
      password: 'hashedpassword', // In real scenario, this would be hashed
      role: 'user' as any,
    });
    await userRepository.save(testUser);

    // Create admin user
    adminUser = userRepository.create({
      email: 'admin@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
    });
    await userRepository.save(adminUser);

    // Generate tokens
    const userPayload: JwtPayload = {
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
    };
    authToken = generateToken(userPayload);

    const adminPayload: JwtPayload = {
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    };
    adminToken = generateToken(adminPayload);
  });

  beforeEach(async () => {
    // Clean sweets table before each test
    const sweetRepository = AppDataSource.getRepository(Sweet);
    await sweetRepository.clear();
  });

  afterAll(async () => {
    // Clean up users
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.clear();
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet successfully (authenticated user)', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.50,
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('sweet');
      expect(response.body.data.sweet).toHaveProperty('id');
      expect(response.body.data.sweet).toHaveProperty('name', sweetData.name);
      expect(response.body.data.sweet).toHaveProperty('category', sweetData.category);
      expect(response.body.data.sweet).toHaveProperty('price', sweetData.price);
      expect(response.body.data.sweet).toHaveProperty('quantity', sweetData.quantity);
    });

    it('should return 401 if user is not authenticated', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.50,
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 400 if name is missing', async () => {
      const sweetData = {
        category: 'Chocolate',
        price: 2.50,
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 400 if price is negative', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: -10,
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 400 if quantity is negative', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.50,
        quantity: -10,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 400 if price is not a number', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 'not-a-number',
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });
});
