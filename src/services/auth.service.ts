import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../database/dataSource';
import { User, UserRole } from '../entities/User';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { generateToken, JwtPayload } from '../utils/jwt.util';

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    // Use query builder for more reliable duplicate check
    const existingUser = await AppDataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.email = :email', { email: registerDto.email })
      .getOne();

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

    try {
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
    } catch (error: any) {
      // Handle database unique constraint violation (PostgreSQL error code 23505)
      if (error.code === '23505') {
        throw new Error('User with this email already exists');
      }
      
      if (error.message?.toLowerCase().includes('duplicate') ||
          error.message?.toLowerCase().includes('unique') ||
          error.message?.toLowerCase().includes('already exists') ||
          error.detail?.toLowerCase().includes('already exists')) {
        throw new Error('User with this email already exists');
      }
      
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(payload);

    // Remove password from user object before returning
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token,
    };
  }
}