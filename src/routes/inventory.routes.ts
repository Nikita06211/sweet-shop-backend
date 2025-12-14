import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { validateDto } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { PurchaseSweetDto, RestockSweetDto } from '../dto/sweet.dto';

const router = Router();
const inventoryController = new InventoryController();

router.post(
  '/:id/purchase',
  authMiddleware,
  validateDto(PurchaseSweetDto),
  inventoryController.purchase
);

router.post(
  '/:id/restock',
  authMiddleware,      // Must be authenticated first
  adminMiddleware,     // Then check if admin
  validateDto(RestockSweetDto),
  inventoryController.restock
);

export default router;
