import { Request, Response, NextFunction } from 'express';
import { SweetsService } from '../services/sweets.service';
import { CreateSweetDto, UpdateSweetDto } from '../dto/sweet.dto';

export class SweetsController {
  private sweetsService: SweetsService;

  constructor() {
    this.sweetsService = new SweetsService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createSweetDto = req.body as CreateSweetDto;
      const sweet = await this.sweetsService.create(createSweetDto);

      res.status(201).json({
        status: 'success',
        message: 'Sweet created successfully',
        data: { sweet },
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sweets = await this.sweetsService.getAll();

      res.status(200).json({
        status: 'success',
        message: 'Sweets retrieved successfully',
        data: { sweets },
      });
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, category, minPrice, maxPrice } = req.query;

      const filters: {
        name?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
      } = {};

      if (name) filters.name = name as string;
      if (category) filters.category = category as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);

      const sweets = await this.sweetsService.search(filters);

      res.status(200).json({
        status: 'success',
        message: 'Sweets search completed successfully',
        data: { sweets },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateSweetDto = req.body as UpdateSweetDto;
      const sweet = await this.sweetsService.update(id, updateSweetDto);

      res.status(200).json({
        status: 'success',
        message: 'Sweet updated successfully',
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

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.sweetsService.delete(id);

      res.status(200).json({
        status: 'success',
        message: 'Sweet deleted successfully',
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
