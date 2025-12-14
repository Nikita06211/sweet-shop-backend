import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateDto } from '../middleware/validation.middleware';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  validateDto(RegisterDto),
  authController.register
);

router.post(
  '/login',
  validateDto(LoginDto),
  authController.login
);

export default router;