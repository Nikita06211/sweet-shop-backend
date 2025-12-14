import { Request, Response, NextFunction } from 'express';
import { SweetsService } from '../services/sweets.service';
import { CreateSweetDto } from '../dto/sweet.dto';

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
}
