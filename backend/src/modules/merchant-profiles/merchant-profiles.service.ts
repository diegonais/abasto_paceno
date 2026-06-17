import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from '../../common/enums/role.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { CreateMerchantProfileDto } from './dto/create-merchant-profile.dto';
import { UpdateMerchantProfileDto } from './dto/update-merchant-profile.dto';
import { MerchantProfile } from './entities/merchant-profile.entity';

@Injectable()
export class MerchantProfilesService {
  constructor(
    @InjectRepository(MerchantProfile)
    private readonly merchantProfilesRepository: Repository<MerchantProfile>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll() {
    return this.merchantProfilesRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const profile = await this.merchantProfilesRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Merchant profile not found');
    }

    return profile;
  }

  async create(createMerchantProfileDto: CreateMerchantProfileDto) {
    const user = await this.usersRepository.findOne({
      where: { id: createMerchantProfileDto.userId },
      relations: {
        merchantProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.MERCHANT) {
      throw new ConflictException(
        'Merchant profile can only be assigned to merchant users',
      );
    }

    if (user.merchantProfile) {
      throw new ConflictException(
        'Merchant user already has a merchant profile',
      );
    }

    const profile = this.merchantProfilesRepository.create({
      user,
      businessName: createMerchantProfileDto.businessName?.trim() ?? null,
      ownerFullName: createMerchantProfileDto.ownerFullName.trim(),
      phone: createMerchantProfileDto.phone?.trim() ?? null,
      description: createMerchantProfileDto.description?.trim() ?? null,
      isActive: true,
    });

    return this.merchantProfilesRepository.save(profile);
  }

  async update(id: string, updateMerchantProfileDto: UpdateMerchantProfileDto) {
    const profile = await this.findOne(id);

    if (
      updateMerchantProfileDto.userId &&
      updateMerchantProfileDto.userId !== profile.user.id
    ) {
      throw new ForbiddenException(
        'You cannot reassign the merchant profile to another user',
      );
    }

    if (updateMerchantProfileDto.businessName !== undefined) {
      profile.businessName = updateMerchantProfileDto.businessName?.trim() ?? null;
    }

    if (updateMerchantProfileDto.ownerFullName !== undefined) {
      profile.ownerFullName = updateMerchantProfileDto.ownerFullName.trim();
    }

    if (updateMerchantProfileDto.phone !== undefined) {
      profile.phone = updateMerchantProfileDto.phone?.trim() ?? null;
    }

    if (updateMerchantProfileDto.description !== undefined) {
      profile.description = updateMerchantProfileDto.description?.trim() ?? null;
    }

    if (updateMerchantProfileDto.isActive !== undefined) {
      profile.isActive = updateMerchantProfileDto.isActive;
    }

    return this.merchantProfilesRepository.save(profile);
  }

  async disable(id: string) {
    const profile = await this.findOne(id);
    profile.isActive = false;

    return this.merchantProfilesRepository.save(profile);
  }

  async getMe(currentUser: JwtPayload) {
    if (currentUser.role !== Role.MERCHANT) {
      throw new ForbiddenException(
        'Only merchants can access their merchant profile',
      );
    }

    const profile = await this.merchantProfilesRepository.findOne({
      where: {
        user: {
          id: currentUser.sub,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Merchant profile not found for current user');
    }

    return profile;
  }

  async updateMe(
    currentUser: JwtPayload,
    updateMerchantProfileDto: UpdateMerchantProfileDto,
  ) {
    if (
      updateMerchantProfileDto.userId ||
      updateMerchantProfileDto.isActive !== undefined
    ) {
      throw new ForbiddenException(
        'You cannot change owner or active status from this endpoint',
      );
    }

    const profile = await this.getMe(currentUser);

    return this.update(profile.id, updateMerchantProfileDto);
  }
}
