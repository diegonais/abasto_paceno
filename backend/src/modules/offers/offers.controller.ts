import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { OFFER_PHOTO_MAX_SIZE_BYTES } from '../../common/uploads/upload.constants';
import {
  buildRelativeUploadPath,
  createImageStorage,
  imageFileFilter,
} from '../../common/uploads/upload.utils';
import type { UploadedImageFile } from '../../common/uploads/upload.utils';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OffersService } from './offers.service';

@ApiTags('Offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Public()
  @Get()
  findAll() {
    return this.offersService.findAllActive();
  }

  @Public()
  @Get('map')
  findMapOffers() {
    return this.offersService.findMapOffers();
  }

  @ApiBearerAuth()
  @Get('my-offers')
  @Roles(Role.MERCHANT)
  findMyOffers(@CurrentUser() currentUser: JwtPayload) {
    return this.offersService.findMyOffers(currentUser);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOnePublic(id);
  }

  @ApiBearerAuth()
  @Post()
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseInterceptors(
    FileInterceptor('productPhoto', {
      storage: createImageStorage('offers'),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: OFFER_PHOTO_MAX_SIZE_BYTES,
      },
    }),
  )
  create(
    @Body() createOfferDto: CreateOfferDto,
    @CurrentUser() currentUser: JwtPayload,
    @UploadedFile() productPhoto?: UploadedImageFile,
  ) {
    return this.offersService.create(
      {
        ...createOfferDto,
        productPhotoPath: productPhoto
          ? buildRelativeUploadPath('offers', productPhoto.filename)
          : null,
      },
      currentUser,
    );
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseInterceptors(
    FileInterceptor('productPhoto', {
      storage: createImageStorage('offers'),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: OFFER_PHOTO_MAX_SIZE_BYTES,
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDto,
    @CurrentUser() currentUser: JwtPayload,
    @UploadedFile() productPhoto?: UploadedImageFile,
  ) {
    return this.offersService.update(
      id,
      {
        ...updateOfferDto,
        productPhotoPath: productPhoto
          ? buildRelativeUploadPath('offers', productPhoto.filename)
          : undefined,
      },
      currentUser,
    );
  }

  @ApiBearerAuth()
  @Patch(':id/disable')
  @Roles(Role.ADMIN, Role.MERCHANT)
  disable(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.offersService.disable(id, currentUser);
  }
}
