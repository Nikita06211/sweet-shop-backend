import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Sweet } from '../entities/Sweet';
import { PurchaseSweetDto, RestockSweetDto } from '../dto/sweet.dto';

export class InventoryService {
  private sweetRepository: Repository<Sweet>;

  constructor() {
    this.sweetRepository = AppDataSource.getRepository(Sweet);
  }

  async purchase(id: string, purchaseDto: PurchaseSweetDto): Promise<Sweet> {
    // Find the sweet
    const sweet = await this.sweetRepository.findOne({
      where: { id },
    });

    if (!sweet) {
      throw new Error('Sweet not found');
    }

    // Check if sufficient stock is available
    if (sweet.quantity < purchaseDto.quantity) {
      throw new Error('Insufficient stock available');
    }

    // Decrease quantity
    sweet.quantity -= purchaseDto.quantity;

    // Save updated sweet
    const updatedSweet = await this.sweetRepository.save(sweet);

    return updatedSweet;
  }

  async restock(id: string, restockDto: RestockSweetDto): Promise<Sweet> {
    // Find the sweet
    const sweet = await this.sweetRepository.findOne({
      where: { id },
    });

    if (!sweet) {
      throw new Error('Sweet not found');
    }

    // Increase quantity
    sweet.quantity += restockDto.quantity;

    // Save updated sweet
    const updatedSweet = await this.sweetRepository.save(sweet);

    return updatedSweet;
  }
}
