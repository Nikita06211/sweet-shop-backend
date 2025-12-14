import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.util';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        status: 'error',
        message: 'No token provided. Authorization header is required.',
      });
      return;
    }

    // Check if token starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token format. Use "Bearer <token>".',
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Token is required.',
      });
      return;
    }

    // Verify token
    try {
      const decoded = verifyToken(token);
      
      // Attach user info to request object
      req.user = decoded;
      
      next();
    } catch (error: any) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token.',
      });
      return;
    }
  } catch (error: any) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed.',
    });
    return;
  }
};
