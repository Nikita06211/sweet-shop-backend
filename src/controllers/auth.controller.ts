import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/auth.dto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registerDto = req.body as RegisterDto;
      const result = await this.authService.register(registerDto);

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        res.status(409).json({
          status: 'error',
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  };
}