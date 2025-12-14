import 'reflect-metadata';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateToken, JwtPayload } from '../utils/jwt.util';

describe('Auth Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Test protected route
    app.get('/protected', authMiddleware, (req: Request, res: Response) => {
      res.json({
        status: 'success',
        message: 'Access granted',
        user: (req as any).user,
      });
    });
  });

  it('should allow access with valid token', async () => {
    const payload: JwtPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'user',
    };
    const token = generateToken(payload);

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('userId', payload.userId);
    expect(response.body.user).toHaveProperty('email', payload.email);
    expect(response.body.user).toHaveProperty('role', payload.role);
  });

  it('should return 401 if token is missing', async () => {
    const response = await request(app)
      .get('/protected')
      .expect(401);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.message).toContain('token');
  });

  it('should return 401 if token format is invalid (missing Bearer)', async () => {
    const token = generateToken({
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'user',
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', token) // Missing "Bearer " prefix
      .expect(401);

    expect(response.body).toHaveProperty('status', 'error');
  });

  it('should return 401 if token is invalid/expired', async () => {
    const invalidToken = 'invalid.token.here';

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);

    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body.message).toContain('Invalid');
  });

  it('should attach user info to request object', async () => {
    const payload: JwtPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'user',
    };
    const token = generateToken(payload);

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.user).toBeDefined();
    expect(response.body.user.userId).toBe(payload.userId);
  });
});
