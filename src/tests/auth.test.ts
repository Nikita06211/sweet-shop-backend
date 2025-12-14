import 'reflect-metadata';
import request from 'supertest';
import app from '../app';
import { AppDataSource } from '../database/dataSource';
import { User } from '../entities/User';

describe('Auth API - Registration', () => {
  // Remove the afterAll here - it's already handled in setup.ts
  // The connection should stay open for all tests

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

      // Small delay to ensure transaction is committed
      await new Promise(resolve => setTimeout(resolve, 100));

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

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Ensure database is initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Create a test user for login tests
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.clear();
    
    // Register a user to test login
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'login@example.com',
        password: 'password123',
      });
  });

  it('should login successfully with valid credentials', async () => {
    const loginData = {
      email: 'login@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('id');
    expect(response.body.data.user).toHaveProperty('email', loginData.email);
    expect(response.body.data.user).not.toHaveProperty('password');
    expect(response.body.data).toHaveProperty('token');
    expect(typeof response.body.data.token).toBe('string');
  });

  it('should return 401 if email does not exist', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.message).toContain('Invalid credentials');
  });

  it('should return 401 if password is incorrect', async () => {
    const loginData = {
      email: 'login@example.com',
      password: 'wrongpassword',
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.message).toContain('Invalid credentials');
  });

  it('should return 400 if email is missing', async () => {
    const loginData = {
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(400);

    expect(response.body).toHaveProperty('status', 'error');
  });

  it('should return 400 if password is missing', async () => {
    const loginData = {
      email: 'login@example.com',
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(400);

    expect(response.body).toHaveProperty('status', 'error');
  });

  it('should return 400 if email is invalid format', async () => {
    const loginData = {
      email: 'invalid-email',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(400);

    expect(response.body).toHaveProperty('status', 'error');
  });
});