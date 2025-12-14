import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Sweet } from '../entities/Sweet';
import { CreateSweetDto, UpdateSweetDto } from '../dto/sweet.dto';

export class SweetsService {
  private sweetRepository: Repository<Sweet>;

  constructor() {
    this.sweetRepository = AppDataSource.getRepository(Sweet);
  }

  async create(createSweetDto: CreateSweetDto): Promise<Sweet> {
    // Create new sweet
    const sweet = this.sweetRepository.create(createSweetDto);

    // Save to database
    const savedSweet = await this.sweetRepository.save(sweet);

    return savedSweet;
  }

  async getAll(): Promise<Sweet[]> {
    // Get all sweets from database
    const sweets = await this.sweetRepository.find({
      order: { createdAt: 'DESC' }, // Order by newest first
    });

    return sweets;
  }

  async search(filters: {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Sweet[]> {
    const queryBuilder = this.sweetRepository.createQueryBuilder('sweet');

    // Search by name (case-insensitive partial match)
    if (filters.name) {
      queryBuilder.andWhere('LOWER(sweet.name) LIKE LOWER(:name)', {
        name: `%${filters.name}%`,
      });
    }

    // Search by category (exact match)
    if (filters.category) {
      queryBuilder.andWhere('sweet.category = :category', {
        category: filters.category,
      });
    }

    // Search by minimum price
    if (filters.minPrice !== undefined) {
      queryBuilder.andWhere('sweet.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    // Search by maximum price
    if (filters.maxPrice !== undefined) {
      queryBuilder.andWhere('sweet.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    // Order by newest first
    queryBuilder.orderBy('sweet.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  async update(id: string, updateSweetDto: UpdateSweetDto): Promise<Sweet> {
    // Find the sweet
    const sweet = await this.sweetRepository.findOne({
      where: { id },
    });

    if (!sweet) {
      throw new Error('Sweet not found');
    }

    // Update only provided fields
    Object.assign(sweet, updateSweetDto);

    // Save updated sweet
    const updatedSweet = await this.sweetRepository.save(sweet);

    return updatedSweet;
  }
}
