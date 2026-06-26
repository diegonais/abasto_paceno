import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OfferAvailability } from '../../common/enums/offer-availability.enum';
import { Role } from '../../common/enums/role.enum';
import { MerchantVerificationStatus } from '../../common/enums/merchant-verification-status.enum';
import { removeStoredFile } from '../../common/uploads/upload.utils';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Category } from '../categories/entities/category.entity';
import { MerchantProfile } from '../merchant-profiles/entities/merchant-profile.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';

type OfferInput = CreateOfferDto & {
  productPhotoPath?: string | null;
};

type OfferUpdateInput = UpdateOfferDto & {
  productPhotoPath?: string | null;
};

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    @InjectRepository(MerchantProfile)
    private readonly merchantProfilesRepository: Repository<MerchantProfile>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
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
      availabilityType: offer.availabilityType,
      approximateQuantity: offer.approximateQuantity,
      price: offer.price,
      latitude: Number(offer.latitude),
      longitude: Number(offer.longitude),
      locationDescription: offer.locationDescription,
      productPhotoPath: offer.productPhotoPath,
      availableFrom: offer.availableFrom,
      availableUntil: offer.availableUntil,
      createdAt: offer.createdAt,
      merchantProfileId: offer.merchantProfile.id,
      businessName: offer.merchantProfile.businessName,
      ownerFullName: offer.merchantProfile.ownerFullName,
    }));
  }

  async create(createOfferDto: OfferInput, currentUser: JwtPayload) {
    this.validateOfferDates(
      createOfferDto.availabilityType,
      createOfferDto.availableFrom,
      createOfferDto.availableUntil,
    );

    const product = await this.resolveProductForOffer(createOfferDto);
    const merchantProfile = await this.resolveMerchantProfileForCreate(
      createOfferDto,
      currentUser,
    );

    const offer = this.offersRepository.create({
      merchantProfile,
      product,
      saleType: createOfferDto.saleType,
      availabilityType: this.resolveAvailabilityType(createOfferDto),
      approximateQuantity: createOfferDto.approximateQuantity ?? null,
      price: createOfferDto.price?.toFixed(2) ?? null,
      latitude: createOfferDto.latitude.toFixed(7),
      longitude: createOfferDto.longitude.toFixed(7),
      locationDescription: createOfferDto.locationDescription?.trim() ?? null,
      productPhotoPath: createOfferDto.productPhotoPath ?? null,
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
    updateOfferDto: OfferUpdateInput,
    currentUser: JwtPayload,
  ) {
    this.validateOfferDates(
      updateOfferDto.availabilityType,
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

    if (updateOfferDto.productId || updateOfferDto.customProductName) {
      offer.product = await this.resolveProductForOffer(updateOfferDto);
    }

    if (updateOfferDto.saleType) {
      offer.saleType = updateOfferDto.saleType;
    }

    if (updateOfferDto.availabilityType) {
      offer.availabilityType = updateOfferDto.availabilityType;
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

    if (updateOfferDto.productPhotoPath) {
      const previousPhotoPath = offer.productPhotoPath;
      offer.productPhotoPath = updateOfferDto.productPhotoPath;

      if (previousPhotoPath && previousPhotoPath !== updateOfferDto.productPhotoPath) {
        removeStoredFile(previousPhotoPath);
      }
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

    if (offer.availabilityType === OfferAvailability.FIXED) {
      offer.availableFrom = null;
      offer.availableUntil = null;
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
    createOfferDto: OfferInput,
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
      merchantProfile.verificationStatus !==
      MerchantVerificationStatus.APPROVED
    ) {
      throw new ForbiddenException(
        'Only approved merchants can create offers',
      );
    }

    if (!createOfferDto.productPhotoPath) {
      throw new BadRequestException(
        'Product photo is required for merchant offers',
      );
    }

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
        verificationStatus: MerchantVerificationStatus.APPROVED,
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
        verificationStatus: MerchantVerificationStatus.APPROVED,
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

  private async resolveProductForOffer(offerDto: OfferInput | OfferUpdateInput) {
    if (offerDto.customProductName?.trim()) {
      return this.findOrCreateCustomProduct(offerDto.customProductName);
    }

    if (!offerDto.productId) {
      throw new BadRequestException('productId or customProductName is required');
    }

    return this.findActiveProduct(offerDto.productId);
  }

  private async findOrCreateCustomProduct(productName: string) {
    const normalizedProductName = productName.trim().toLowerCase();

    if (!normalizedProductName) {
      throw new BadRequestException('customProductName cannot be empty');
    }

    const category = await this.findOrCreateOtherCategory();
    const existingProduct = await this.productsRepository.findOne({
      where: {
        productName: normalizedProductName,
        category: {
          id: category.id,
        },
        isActive: true,
      },
    });

    if (existingProduct) {
      return existingProduct;
    }

    const product = this.productsRepository.create({
      productName: normalizedProductName,
      description: 'Producto agregado por comerciante desde una oferta.',
      category,
      isActive: true,
    });

    return this.productsRepository.save(product);
  }

  private async findOrCreateOtherCategory() {
    const existingCategory = await this.categoriesRepository.findOne({
      where: {
        categoryName: 'otros',
      },
    });

    if (existingCategory) {
      if (!existingCategory.isActive) {
        existingCategory.isActive = true;
        return this.categoriesRepository.save(existingCategory);
      }

      return existingCategory;
    }

    const category = this.categoriesRepository.create({
      categoryName: 'otros',
      isActive: true,
    });

    return this.categoriesRepository.save(category);
  }

  private validateOfferDates(
    availabilityType?: OfferAvailability,
    availableFrom?: string | null,
    availableUntil?: string | null,
  ) {
    const resolvedAvailabilityType =
      availabilityType ??
      (availableFrom || availableUntil
        ? OfferAvailability.TEMPORARY
        : OfferAvailability.FIXED);

    if (resolvedAvailabilityType === OfferAvailability.FIXED) {
      return;
    }

    if (!availableFrom || !availableUntil) {
      throw new BadRequestException(
        'Temporary offers require availableFrom and availableUntil',
      );
    }

    if (!availableFrom || !availableUntil) {
      return;
    }

    if (new Date(availableUntil) <= new Date(availableFrom)) {
      throw new BadRequestException(
        'availableUntil must be later than availableFrom',
      );
    }
  }

  private resolveAvailabilityType(offerDto: OfferInput | OfferUpdateInput) {
    return (
      offerDto.availabilityType ??
      (offerDto.availableFrom || offerDto.availableUntil
        ? OfferAvailability.TEMPORARY
        : OfferAvailability.FIXED)
    );
  }
}
