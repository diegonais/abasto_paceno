import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from '../../common/enums/role.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { MerchantProfile } from '../merchant-profiles/entities/merchant-profile.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    @InjectRepository(MerchantProfile)
    private readonly merchantProfilesRepository: Repository<MerchantProfile>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  findAllActive() {
    return this.offersRepository.find({
      where: {
        isActive: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOnePublic(id: string) {
    const offer = await this.offersRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async findOne(id: string) {
    const offer = await this.offersRepository.findOne({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async findMapOffers() {
    const offers = await this.findAllActive();

    return offers.map((offer) => ({
      id: offer.id,
      productId: offer.product.id,
      productName: offer.product.productName,
      categoryName: offer.product.category.categoryName,
      saleType: offer.saleType,
      approximateQuantity: offer.approximateQuantity,
      price: offer.price,
      latitude: Number(offer.latitude),
      longitude: Number(offer.longitude),
      locationDescription: offer.locationDescription,
      availableFrom: offer.availableFrom,
      availableUntil: offer.availableUntil,
      merchantProfileId: offer.merchantProfile.id,
      businessName: offer.merchantProfile.businessName,
      ownerFullName: offer.merchantProfile.ownerFullName,
    }));
  }

  async create(createOfferDto: CreateOfferDto, currentUser: JwtPayload) {
    this.validateOfferDates(
      createOfferDto.availableFrom,
      createOfferDto.availableUntil,
    );

    const product = await this.findActiveProduct(createOfferDto.productId);
    const merchantProfile = await this.resolveMerchantProfileForCreate(
      createOfferDto,
      currentUser,
    );

    const offer = this.offersRepository.create({
      merchantProfile,
      product,
      saleType: createOfferDto.saleType,
      approximateQuantity: createOfferDto.approximateQuantity ?? null,
      price: createOfferDto.price?.toFixed(2) ?? null,
      latitude: createOfferDto.latitude.toFixed(7),
      longitude: createOfferDto.longitude.toFixed(7),
      locationDescription: createOfferDto.locationDescription?.trim() ?? null,
      availableFrom: createOfferDto.availableFrom
        ? new Date(createOfferDto.availableFrom)
        : null,
      availableUntil: createOfferDto.availableUntil
        ? new Date(createOfferDto.availableUntil)
        : null,
      isActive: true,
    });

    return this.offersRepository.save(offer);
  }

  async update(
    id: string,
    updateOfferDto: UpdateOfferDto,
    currentUser: JwtPayload,
  ) {
    this.validateOfferDates(
      updateOfferDto.availableFrom,
      updateOfferDto.availableUntil,
    );

    const offer = await this.findOne(id);
    await this.ensureOfferAccess(offer, currentUser);

    if (updateOfferDto.merchantProfileId) {
      if (currentUser.role !== Role.ADMIN) {
        throw new ForbiddenException(
          'Only admin can reassign merchant profiles',
        );
      }

      offer.merchantProfile = await this.findActiveMerchantProfile(
        updateOfferDto.merchantProfileId,
      );
    }

    if (updateOfferDto.productId) {
      offer.product = await this.findActiveProduct(updateOfferDto.productId);
    }

    if (updateOfferDto.saleType) {
      offer.saleType = updateOfferDto.saleType;
    }

    if (updateOfferDto.approximateQuantity !== undefined) {
      offer.approximateQuantity = updateOfferDto.approximateQuantity ?? null;
    }

    if (updateOfferDto.price !== undefined) {
      offer.price =
        updateOfferDto.price !== null ? updateOfferDto.price.toFixed(2) : null;
    }

    if (updateOfferDto.latitude !== undefined) {
      offer.latitude = updateOfferDto.latitude.toFixed(7);
    }

    if (updateOfferDto.longitude !== undefined) {
      offer.longitude = updateOfferDto.longitude.toFixed(7);
    }

    if (updateOfferDto.locationDescription !== undefined) {
      offer.locationDescription =
        updateOfferDto.locationDescription?.trim() ?? null;
    }

    if (updateOfferDto.availableFrom !== undefined) {
      offer.availableFrom = updateOfferDto.availableFrom
        ? new Date(updateOfferDto.availableFrom)
        : null;
    }

    if (updateOfferDto.availableUntil !== undefined) {
      offer.availableUntil = updateOfferDto.availableUntil
        ? new Date(updateOfferDto.availableUntil)
        : null;
    }

    return this.offersRepository.save(offer);
  }

  async disable(id: string, currentUser: JwtPayload) {
    const offer = await this.findOne(id);
    await this.ensureOfferAccess(offer, currentUser);
    offer.isActive = false;

    return this.offersRepository.save(offer);
  }

  async findMyOffers(currentUser: JwtPayload) {
    if (currentUser.role !== Role.MERCHANT) {
      throw new ForbiddenException('Only merchants can access their offers');
    }

    const merchantProfile = await this.findMerchantProfileByUserId(
      currentUser.sub,
    );

    return this.offersRepository.find({
      where: {
        merchantProfile: {
          id: merchantProfile.id,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  private async resolveMerchantProfileForCreate(
    createOfferDto: CreateOfferDto,
    currentUser: JwtPayload,
  ) {
    if (currentUser.role === Role.ADMIN) {
      if (!createOfferDto.merchantProfileId) {
        throw new BadRequestException('merchantProfileId is required for admin');
      }

      return this.findActiveMerchantProfile(createOfferDto.merchantProfileId);
    }

    if (currentUser.role !== Role.MERCHANT) {
      throw new ForbiddenException('Only merchants and admins can create offers');
    }

    const merchantProfile = await this.findMerchantProfileByUserId(
      currentUser.sub,
    );

    if (
      createOfferDto.merchantProfileId &&
      createOfferDto.merchantProfileId !== merchantProfile.id
    ) {
      throw new ForbiddenException(
        'You can only create offers for your own merchant profile',
      );
    }

    return merchantProfile;
  }

  private async ensureOfferAccess(offer: Offer, currentUser: JwtPayload) {
    if (currentUser.role === Role.ADMIN) {
      return;
    }

    if (currentUser.role !== Role.MERCHANT) {
      throw new ForbiddenException('You cannot manage this offer');
    }

    const merchantProfile = await this.findMerchantProfileByUserId(
      currentUser.sub,
    );

    if (offer.merchantProfile.id !== merchantProfile.id) {
      throw new ForbiddenException('You can only manage your own offers');
    }
  }

  private async findMerchantProfileByUserId(userId: string) {
    const merchantProfile = await this.merchantProfilesRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        isActive: true,
      },
    });

    if (!merchantProfile) {
      throw new NotFoundException('Merchant profile not found for current user');
    }

    return merchantProfile;
  }

  private async findActiveMerchantProfile(merchantProfileId: string) {
    const merchantProfile = await this.merchantProfilesRepository.findOne({
      where: {
        id: merchantProfileId,
        isActive: true,
      },
    });

    if (!merchantProfile) {
      throw new NotFoundException('Active merchant profile not found');
    }

    return merchantProfile;
  }

  private async findActiveProduct(productId: string) {
    const product = await this.productsRepository.findOne({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Active product not found');
    }

    return product;
  }

  private validateOfferDates(
    availableFrom?: string | null,
    availableUntil?: string | null,
  ) {
    if (!availableFrom || !availableUntil) {
      return;
    }

    if (new Date(availableUntil) <= new Date(availableFrom)) {
      throw new BadRequestException(
        'availableUntil must be later than availableFrom',
      );
    }
  }
}
