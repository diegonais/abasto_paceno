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

import { STORE_PHOTO_MAX_SIZE_BYTES } from '../../common/uploads/upload.constants';
import {
  buildRelativeUploadPath,
  createImageStorage,
  imageFileFilter,
} from '../../common/uploads/upload.utils';
import type { UploadedImageFile } from '../../common/uploads/upload.utils';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateMerchantProfileDto } from './dto/create-merchant-profile.dto';
import { UpdateMerchantProfileDto } from './dto/update-merchant-profile.dto';
import { MerchantProfilesService } from './merchant-profiles.service';

@ApiTags('MerchantProfiles')
@ApiBearerAuth()
@Controller('merchant-profiles')
export class MerchantProfilesController {
  constructor(
    private readonly merchantProfilesService: MerchantProfilesService,
  ) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.merchantProfilesService.findAll();
  }

  @Get('me')
  getMe(@CurrentUser() currentUser: JwtPayload) {
    return this.merchantProfilesService.getMe(currentUser);
  }

  @Post('apply')
  @UseInterceptors(
    FileInterceptor('storePhoto', {
      storage: createImageStorage('stores'),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: STORE_PHOTO_MAX_SIZE_BYTES,
      },
    }),
  )
  apply(
    @CurrentUser() currentUser: JwtPayload,
    @Body() createMerchantProfileDto: CreateMerchantProfileDto,
    @UploadedFile() storePhoto?: UploadedImageFile,
  ) {
    return this.merchantProfilesService.apply(currentUser, {
      ...createMerchantProfileDto,
      storePhotoPath: storePhoto
        ? buildRelativeUploadPath('stores', storePhoto.filename)
        : null,
    });
  }

  @Patch('me')
  @UseInterceptors(
    FileInterceptor('storePhoto', {
      storage: createImageStorage('stores'),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: STORE_PHOTO_MAX_SIZE_BYTES,
      },
    }),
  )
  updateMe(
    @CurrentUser() currentUser: JwtPayload,
    @Body() updateMerchantProfileDto: UpdateMerchantProfileDto,
    @UploadedFile() storePhoto?: UploadedImageFile,
  ) {
    return this.merchantProfilesService.updateMe(
      currentUser,
      {
        ...updateMerchantProfileDto,
        storePhotoPath: storePhoto
          ? buildRelativeUploadPath('stores', storePhoto.filename)
          : undefined,
      },
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.merchantProfilesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('storePhoto', {
      storage: createImageStorage('stores'),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: STORE_PHOTO_MAX_SIZE_BYTES,
      },
    }),
  )
  create(
    @Body() createMerchantProfileDto: CreateMerchantProfileDto,
    @UploadedFile() storePhoto?: UploadedImageFile,
  ) {
    return this.merchantProfilesService.create({
      ...createMerchantProfileDto,
      storePhotoPath: storePhoto
        ? buildRelativeUploadPath('stores', storePhoto.filename)
        : null,
    });
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('storePhoto', {
      storage: createImageStorage('stores'),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: STORE_PHOTO_MAX_SIZE_BYTES,
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateMerchantProfileDto: UpdateMerchantProfileDto,
    @UploadedFile() storePhoto?: UploadedImageFile,
  ) {
    return this.merchantProfilesService.update(id, {
      ...updateMerchantProfileDto,
      storePhotoPath: storePhoto
        ? buildRelativeUploadPath('stores', storePhoto.filename)
        : undefined,
    });
  }

  @Patch(':id/disable')
  @Roles(Role.ADMIN)
  disable(@Param('id') id: string) {
    return this.merchantProfilesService.disable(id);
  }
}
