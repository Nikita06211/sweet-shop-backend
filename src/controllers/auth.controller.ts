import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

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

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginDto = req.body as LoginDto;
      const result = await this.authService.login(loginDto);

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({
          status: 'error',
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  };
}