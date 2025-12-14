import { Router } from 'express';
import { SweetsController } from '../controllers/sweets.controller';
import { validateDto } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { CreateSweetDto } from '../dto/sweet.dto';

const router = Router();
const sweetsController = new SweetsController();

router.post(
  '/',
  authMiddleware,
  validateDto(CreateSweetDto),
  sweetsController.create
);

router.get(
  '/',
  authMiddleware,
  sweetsController.getAll
);

export default router;
