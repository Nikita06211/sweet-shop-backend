import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../database/dataSource';
import { User, UserRole } from '../entities/User';
import { RegisterDto } from '../dto/auth.dto';
import { generateToken, JwtPayload } from '../utils/jwt.util';

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create new user
    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    // Save user to database
    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload: JwtPayload = {
      userId: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };
    const token = generateToken(payload);

    // Remove password from user object before returning
    const { password, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }
}