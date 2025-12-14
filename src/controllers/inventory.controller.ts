import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { PurchaseSweetDto, RestockSweetDto } from '../dto/sweet.dto';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  purchase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const purchaseDto = req.body as PurchaseSweetDto;
      const sweet = await this.inventoryService.purchase(id, purchaseDto);

      res.status(200).json({
        status: 'success',
        message: 'Purchase completed successfully',
        data: { sweet },
      });
    } catch (error: any) {
      if (error.message === 'Sweet not found') {
        res.status(404).json({
          status: 'error',
          message: error.message,
        });
      } else if (error.message === 'Insufficient stock available') {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  };

  restock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const restockDto = req.body as RestockSweetDto;
      const sweet = await this.inventoryService.restock(id, restockDto);

      res.status(200).json({
        status: 'success',
        message: 'Restock completed successfully',
        data: { sweet },
      });
    } catch (error: any) {
      if (error.message === 'Sweet not found') {
        res.status(404).json({
          status: 'error',
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  };
}
