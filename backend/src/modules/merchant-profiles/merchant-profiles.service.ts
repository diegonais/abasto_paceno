import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MerchantKind } from '../../common/enums/merchant-kind.enum';
import { Role } from '../../common/enums/role.enum';
import { MerchantVerificationStatus } from '../../common/enums/merchant-verification-status.enum';
import { removeStoredFile } from '../../common/uploads/upload.utils';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { CreateMerchantProfileDto } from './dto/create-merchant-profile.dto';
import { UpdateMerchantProfileDto } from './dto/update-merchant-profile.dto';
import { MerchantProfile } from './entities/merchant-profile.entity';

type MerchantProfileInput = CreateMerchantProfileDto & {
  storePhotoPath?: string | null;
};

type MerchantProfileUpdateInput = UpdateMerchantProfileDto & {
  storePhotoPath?: string | null;
};

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

  async create(createMerchantProfileDto: MerchantProfileInput) {
    const user = await this.usersRepository.findOne({
      where: { id: createMerchantProfileDto.userId },
      relations: {
        merchantProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.merchantProfile) {
      throw new ConflictException(
        'Merchant user already has a merchant profile',
      );
    }

    const profile = this.buildMerchantProfileEntity(user, createMerchantProfileDto);
    await this.syncUserRoleForVerificationStatus(
      user,
      profile.verificationStatus,
    );

    return this.merchantProfilesRepository.save(profile);
  }

  async update(id: string, updateMerchantProfileDto: MerchantProfileUpdateInput) {
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

    if (updateMerchantProfileDto.merchantKind !== undefined) {
      profile.merchantKind = updateMerchantProfileDto.merchantKind;
    }

    if (updateMerchantProfileDto.documentId !== undefined) {
      profile.documentId = updateMerchantProfileDto.documentId?.trim() ?? null;
    }

    if (updateMerchantProfileDto.ownerFullName !== undefined) {
      profile.ownerFullName = updateMerchantProfileDto.ownerFullName.trim();
    }

    if (updateMerchantProfileDto.phone !== undefined) {
      profile.phone = updateMerchantProfileDto.phone?.trim() ?? null;
    }

    if (updateMerchantProfileDto.contactEmail !== undefined) {
      profile.contactEmail = updateMerchantProfileDto.contactEmail?.trim() ?? null;
    }

    if (updateMerchantProfileDto.city !== undefined) {
      profile.city = updateMerchantProfileDto.city?.trim() ?? null;
    }

    if (updateMerchantProfileDto.zone !== undefined) {
      profile.zone = updateMerchantProfileDto.zone?.trim() ?? null;
    }

    if (updateMerchantProfileDto.addressLine !== undefined) {
      profile.addressLine = updateMerchantProfileDto.addressLine?.trim() ?? null;
    }

    if (updateMerchantProfileDto.reference !== undefined) {
      profile.reference = updateMerchantProfileDto.reference?.trim() ?? null;
    }

    if (updateMerchantProfileDto.openingHours !== undefined) {
      profile.openingHours = updateMerchantProfileDto.openingHours?.trim() ?? null;
    }

    if (updateMerchantProfileDto.description !== undefined) {
      profile.description = updateMerchantProfileDto.description?.trim() ?? null;
    }

    if (updateMerchantProfileDto.storePhotoPath) {
      const previousPhotoPath = profile.storePhotoPath;
      profile.storePhotoPath = updateMerchantProfileDto.storePhotoPath;

      if (previousPhotoPath && previousPhotoPath !== updateMerchantProfileDto.storePhotoPath) {
        removeStoredFile(previousPhotoPath);
      }
    }

    if (updateMerchantProfileDto.isActive !== undefined) {
      profile.isActive = updateMerchantProfileDto.isActive;
    }

    if (updateMerchantProfileDto.reviewNotes !== undefined) {
      profile.reviewNotes = updateMerchantProfileDto.reviewNotes?.trim() ?? null;
    }

    if (updateMerchantProfileDto.verificationStatus !== undefined) {
      profile.verificationStatus = updateMerchantProfileDto.verificationStatus;
      await this.syncUserRoleForVerificationStatus(
        profile.user,
        profile.verificationStatus,
      );
    }

    this.validateStorePhotoRequirement(
      profile.merchantKind,
      profile.storePhotoPath,
    );

    return this.merchantProfilesRepository.save(profile);
  }

  async disable(id: string) {
    const profile = await this.findOne(id);
    profile.isActive = false;

    return this.merchantProfilesRepository.save(profile);
  }

  async getMe(currentUser: JwtPayload) {
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
    updateMerchantProfileDto: MerchantProfileUpdateInput,
  ) {
    if (
      updateMerchantProfileDto.userId ||
      updateMerchantProfileDto.isActive !== undefined ||
      updateMerchantProfileDto.verificationStatus !== undefined
    ) {
      throw new ForbiddenException(
        'You cannot change owner, active status or verification from this endpoint',
      );
    }

    const profile = await this.getMe(currentUser);

    return this.update(profile.id, updateMerchantProfileDto);
  }

  async apply(
    currentUser: JwtPayload,
    createMerchantProfileDto: MerchantProfileInput,
  ) {
    if (currentUser.role === Role.ADMIN) {
      throw new ForbiddenException('Admin accounts cannot apply as merchants');
    }

    const user = await this.usersRepository.findOne({
      where: { id: currentUser.sub },
      relations: {
        merchantProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.merchantProfile) {
      throw new ConflictException('You already have a merchant application');
    }

    const profile = this.buildMerchantProfileEntity(user, {
      ...createMerchantProfileDto,
      verificationStatus: MerchantVerificationStatus.PENDING,
    });

    return this.merchantProfilesRepository.save(profile);
  }

  private buildMerchantProfileEntity(
    user: User,
    input: MerchantProfileInput,
  ) {
    this.validateStorePhotoRequirement(input.merchantKind, input.storePhotoPath);

    return this.merchantProfilesRepository.create({
      user,
      businessName: input.businessName?.trim() ?? null,
      ownerFullName: input.ownerFullName.trim(),
      merchantKind: input.merchantKind,
      documentId: input.documentId.trim(),
      phone: input.phone.trim(),
      contactEmail: input.contactEmail.trim().toLowerCase(),
      city: input.city.trim(),
      zone: input.zone.trim(),
      addressLine: input.addressLine.trim(),
      reference: input.reference?.trim() ?? null,
      openingHours: input.openingHours?.trim() ?? null,
      description: input.description.trim(),
      storePhotoPath: input.storePhotoPath ?? null,
      verificationStatus:
        input.verificationStatus ?? MerchantVerificationStatus.PENDING,
      reviewNotes: input.reviewNotes?.trim() ?? null,
      isActive: true,
    });
  }

  private async syncUserRoleForVerificationStatus(
    user: User,
    verificationStatus: MerchantVerificationStatus,
  ) {
    const nextRole =
      verificationStatus === MerchantVerificationStatus.APPROVED
        ? Role.MERCHANT
        : Role.USER;

    if (user.role !== nextRole) {
      user.role = nextRole;
      await this.usersRepository.save(user);
    }
  }

  private validateStorePhotoRequirement(
    merchantKind: MerchantKind,
    storePhotoPath?: string | null,
  ) {
    if (merchantKind === MerchantKind.STORE && !storePhotoPath) {
      throw new ConflictException(
        'Store photo is required when merchant kind is tienda',
      );
    }
  }
}
