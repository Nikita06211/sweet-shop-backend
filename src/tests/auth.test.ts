import 'reflect-metadata';
import request from 'supertest';
import app from '../app';
import { AppDataSource } from '../database/dataSource';
import { User } from '../entities/User';

describe('Auth API - Registration', () => {
  afterAll(async () => {
    // Clean up: close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Clean up users table before each test
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.clear();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).toHaveProperty('role', 'user');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return 400 if email is missing', async () => {
      const userData = {
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if password is missing', async () => {
      const userData = {
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 400 if email is invalid', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 400 if password is too short', async () => {
      const userData = {
        email: 'test@example.com',
        password: '12345', // Less than 6 characters
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 409 if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('already exists');
    });

    it('should hash the password before storing', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Verify password is hashed in database
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { email: userData.email },
      });

      expect(user).toBeDefined();
      expect(user?.password).not.toBe(userData.password);
      expect(user?.password.length).toBeGreaterThan(20); // bcrypt hash is long
    });
  });
});