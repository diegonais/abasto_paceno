import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Role } from '../../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
    profilePhotoPath?: string | null,
  ) {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const user = await this.usersService.create({
      ...registerDto,
      profilePhotoPath,
      role: Role.USER,
    });

    return this.buildAuthResponse(user.id, user.email, user.role, user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user.id, user.email, user.role, user);
  }

  me(currentUser: JwtPayload) {
    return this.usersService.findOne(currentUser.sub);
  }

  private buildAuthResponse(
    userId: string,
    email: string,
    role: Role,
    user: unknown,
  ) {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
