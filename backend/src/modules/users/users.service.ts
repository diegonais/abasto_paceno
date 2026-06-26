import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';

import { Role } from '../../common/enums/role.enum';
import { removeStoredFile } from '../../common/uploads/upload.utils';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

type CreateUserInput = CreateUserDto & {
  profilePhotoPath?: string | null;
};

type UpdateUserInput = UpdateUserDto & {
  profilePhotoPath?: string | null;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserInput) {
    const email = createUserDto.email.trim().toLowerCase();
    await this.ensureEmailIsAvailable(email);

    const user = this.usersRepository.create({
      fullName: createUserDto.fullName.trim(),
      email,
      profilePhotoPath: createUserDto.profilePhotoPath ?? null,
      passwordHash: await bcrypt.hash(createUserDto.password, 10),
      role: createUserDto.role ?? Role.USER,
      isActive: true,
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (createUserDto.profilePhotoPath) {
        removeStoredFile(createUserDto.profilePhotoPath);
      }

      this.handleUniqueEmailError(error);
      throw error;
    }
  }

  findAll() {
    return this.usersRepository.find({
      relations: {
        merchantProfile: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: {
        merchantProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
      relations: {
        merchantProfile: true,
      },
    });
  }

  findActiveById(id: string) {
    return this.usersRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserInput, actor: JwtPayload) {
    const user = await this.findOne(id);
    const isSelf = actor.sub === user.id;
    const isAdmin = actor.role === Role.ADMIN;
    const previousPhotoPath = user.profilePhotoPath;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('You can only update your own user');
    }

    if (
      !isAdmin &&
      (updateUserDto.role !== undefined || updateUserDto.isActive !== undefined)
    ) {
      throw new ForbiddenException('You cannot update role or active status');
    }

    if (
      updateUserDto.email &&
      updateUserDto.email.trim().toLowerCase() !== user.email
    ) {
      await this.ensureEmailIsAvailable(
        updateUserDto.email.trim().toLowerCase(),
        user.id,
      );
      user.email = updateUserDto.email.trim().toLowerCase();
    }

    if (updateUserDto.fullName) {
      user.fullName = updateUserDto.fullName.trim();
    }

    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.profilePhotoPath) {
      user.profilePhotoPath = updateUserDto.profilePhotoPath;

      if (previousPhotoPath && previousPhotoPath !== updateUserDto.profilePhotoPath) {
        removeStoredFile(previousPhotoPath);
      }
    }

    if (isAdmin && updateUserDto.role) {
      user.role = updateUserDto.role;
    }

    if (isAdmin && updateUserDto.isActive !== undefined) {
      user.isActive = updateUserDto.isActive;
    }

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (
        updateUserDto.profilePhotoPath &&
        updateUserDto.profilePhotoPath !== previousPhotoPath
      ) {
        removeStoredFile(updateUserDto.profilePhotoPath);
      }

      this.handleUniqueEmailError(error);
      throw error;
    }
  }

  updateMe(userId: string, updateUserDto: UpdateUserDto, actor: JwtPayload) {
    return this.update(userId, updateUserDto, actor);
  }

  async disable(id: string) {
    const user = await this.findOne(id);
    user.isActive = false;

    return this.usersRepository.save(user);
  }

  async updateRole(id: string, role: Role) {
    const user = await this.findOne(id);
    user.role = role;
    return this.usersRepository.save(user);
  }

  private async ensureEmailIsAvailable(email: string, userIdToIgnore?: string) {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser && existingUser.id !== userIdToIgnore) {
      throw new ConflictException('Email is already in use');
    }
  }

  private handleUniqueEmailError(error: unknown) {
    if (
      error instanceof QueryFailedError &&
      typeof (error as QueryFailedError & { driverError?: { code?: string } }).driverError?.code ===
        'string' &&
      (error as QueryFailedError & { driverError?: { code?: string } }).driverError?.code === '23505'
    ) {
      throw new ConflictException('Email is already in use');
    }
  }
}
