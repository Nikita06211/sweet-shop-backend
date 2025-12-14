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

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      // Create some test sweets
      const sweetRepository = AppDataSource.getRepository(Sweet);
      
      const sweets = [
        { name: 'Chocolate Bar', category: 'Chocolate', price: 2.50, quantity: 100 },
        { name: 'Gummy Bears', category: 'Gummies', price: 1.50, quantity: 200 },
        { name: 'Lollipop', category: 'Hard Candy', price: 0.75, quantity: 150 },
      ];

      for (const sweetData of sweets) {
        const sweet = sweetRepository.create(sweetData);
        await sweetRepository.save(sweet);
      }
    });

    it('should return all sweets (authenticated user)', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('sweets');
      expect(Array.isArray(response.body.data.sweets)).toBe(true);
      expect(response.body.data.sweets.length).toBe(3);
      expect(response.body.data.sweets[0]).toHaveProperty('id');
      expect(response.body.data.sweets[0]).toHaveProperty('name');
      expect(response.body.data.sweets[0]).toHaveProperty('category');
      expect(response.body.data.sweets[0]).toHaveProperty('price');
      expect(response.body.data.sweets[0]).toHaveProperty('quantity');
    });

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return empty array when no sweets exist', async () => {
      // Clear all sweets
      const sweetRepository = AppDataSource.getRepository(Sweet);
      await sweetRepository.clear();

      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.sweets).toEqual([]);
      expect(response.body.data.sweets.length).toBe(0);
    });

    it('should return sweets in correct format', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const sweet = response.body.data.sweets[0];
      expect(sweet).toHaveProperty('id');
      expect(sweet).toHaveProperty('name');
      expect(sweet).toHaveProperty('category');
      expect(sweet).toHaveProperty('price');
      expect(sweet).toHaveProperty('quantity');
      expect(sweet).toHaveProperty('createdAt');
      expect(sweet).toHaveProperty('updatedAt');
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      // Create test sweets for search
      const sweetRepository = AppDataSource.getRepository(Sweet);
      await sweetRepository.clear();
      
      const sweets = [
        { name: 'Chocolate Bar', category: 'Chocolate', price: 2.50, quantity: 100 },
        { name: 'Dark Chocolate', category: 'Chocolate', price: 3.00, quantity: 50 },
        { name: 'Gummy Bears', category: 'Gummies', price: 1.50, quantity: 200 },
        { name: 'Gummy Worms', category: 'Gummies', price: 1.75, quantity: 150 },
        { name: 'Lollipop', category: 'Hard Candy', price: 0.75, quantity: 300 },
        { name: 'Candy Cane', category: 'Hard Candy', price: 1.00, quantity: 250 },
      ];

      for (const sweetData of sweets) {
        const sweet = sweetRepository.create(sweetData);
        await sweetRepository.save(sweet);
      }
    });

    it('should search sweets by name (partial match)', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ name: 'Chocolate' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.sweets.length).toBe(2);
      expect(response.body.data.sweets.every((s: any) => 
        s.name.toLowerCase().includes('chocolate')
      )).toBe(true);
    });

    it('should search sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ category: 'Gummies' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.sweets.length).toBe(2);
      expect(response.body.data.sweets.every((s: any) => 
        s.category === 'Gummies'
      )).toBe(true);
    });

    it('should search sweets by price range (min and max)', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ minPrice: 1.50, maxPrice: 2.00 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.sweets.length).toBeGreaterThan(0);
      expect(response.body.data.sweets.every((s: any) => 
        s.price >= 1.50 && s.price <= 2.00
      )).toBe(true);
    });

    it('should search sweets by price range (min only)', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ minPrice: 2.00 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.sweets.every((s: any) => 
        s.price >= 2.00
      )).toBe(true);
    });

    it('should search sweets by price range (max only)', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ maxPrice: 1.00 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.sweets.every((s: any) => 
        s.price <= 1.00
      )).toBe(true);
    });

    it('should combine multiple search criteria', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ category: 'Chocolate', minPrice: 2.00 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.sweets.every((s: any) => 
        s.category === 'Chocolate' && s.price >= 2.00
      )).toBe(true);
    });

    it('should return empty array when no sweets match', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ name: 'NonExistentSweet' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.sweets).toEqual([]);
      expect(response.body.data.sweets.length).toBe(0);
    });

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ name: 'Chocolate' })
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return all sweets when no search parameters provided', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.sweets.length).toBe(6);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let testSweet: Sweet;

    beforeEach(async () => {
      // Create a test sweet
      const sweetRepository = AppDataSource.getRepository(Sweet);
      await sweetRepository.clear();
      
      testSweet = sweetRepository.create({
        name: 'Original Chocolate',
        category: 'Chocolate',
        price: 2.50,
        quantity: 100,
      });
      await sweetRepository.save(testSweet);
    });

    it('should update sweet successfully (authenticated user)', async () => {
      const updateData = {
        name: 'Updated Chocolate',
        price: 3.00,
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data.sweet).toHaveProperty('id', testSweet.id);
      expect(response.body.data.sweet).toHaveProperty('name', updateData.name);
      expect(response.body.data.sweet).toHaveProperty('price', updateData.price);
      // Category should remain unchanged
      expect(response.body.data.sweet).toHaveProperty('category', 'Chocolate');
    });

    it('should return 401 if user is not authenticated', async () => {
      const updateData = {
        name: 'Updated Chocolate',
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 404 if sweet does not exist', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const updateData = {
        name: 'Updated Chocolate',
      };

      const response = await request(app)
        .put(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 if price is negative', async () => {
      const updateData = {
        price: -10,
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 400 if quantity is negative', async () => {
      const updateData = {
        quantity: -10,
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should update only provided fields (partial update)', async () => {
      const updateData = {
        price: 3.50,
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.sweet.price).toBe(3.50);
      expect(response.body.data.sweet.name).toBe('Original Chocolate'); // Unchanged
      expect(response.body.data.sweet.category).toBe('Chocolate'); // Unchanged
    });

    it('should update all fields when all are provided', async () => {
      const updateData = {
        name: 'New Name',
        category: 'New Category',
        price: 4.00,
        quantity: 200,
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.sweet.name).toBe(updateData.name);
      expect(response.body.data.sweet.category).toBe(updateData.category);
      expect(response.body.data.sweet.price).toBe(updateData.price);
      expect(response.body.data.sweet.quantity).toBe(updateData.quantity);
    });
  });
});

