import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../entities/User';

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // This middleware should be used AFTER authMiddleware
  // so req.user is guaranteed to exist
  if (!req.user) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.',
    });
    return;
  }

  next();
};
