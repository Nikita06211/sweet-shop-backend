import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Sweet } from '../entities/Sweet';
import { CreateSweetDto } from '../dto/sweet.dto';

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
}
