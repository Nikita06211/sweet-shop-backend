import { Router } from 'express';
import { SweetsController } from '../controllers/sweets.controller';
import { validateDto } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { CreateSweetDto, UpdateSweetDto } from '../dto/sweet.dto';

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

router.get(
  '/search',
  authMiddleware,
  sweetsController.search
);

router.put(
  '/:id',
  authMiddleware,
  validateDto(UpdateSweetDto),
  sweetsController.update
);

router.delete(
  '/:id',
  authMiddleware, // Must be authenticated first
  adminMiddleware, // Then check if admin
  sweetsController.delete
);

export default router;
