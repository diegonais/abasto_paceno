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

import { PROFILE_PHOTO_MAX_SIZE_BYTES } from '../../common/uploads/upload.constants';
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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('profilePhoto', {
      storage: createImageStorage('users'),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: PROFILE_PHOTO_MAX_SIZE_BYTES,
      },
    }),
  )
  create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() profilePhoto?: UploadedImageFile,
  ) {
    return this.usersService.create({
      ...createUserDto,
      profilePhotoPath: profilePhoto
        ? buildRelativeUploadPath('users', profilePhoto.filename)
        : null,
    });
  }

  @Patch('me')
  @UseInterceptors(
    FileInterceptor('profilePhoto', {
      storage: createImageStorage('users'),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: PROFILE_PHOTO_MAX_SIZE_BYTES,
      },
    }),
  )
  updateMe(
    @CurrentUser() currentUser: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profilePhoto?: UploadedImageFile,
  ) {
    return this.usersService.updateMe(
      currentUser.sub,
      ({
        ...updateUserDto,
        profilePhotoPath: profilePhoto
          ? buildRelativeUploadPath('users', profilePhoto.filename)
          : undefined,
      } as UpdateUserDto & { profilePhotoPath?: string }),
      currentUser,
    );
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('profilePhoto', {
      storage: createImageStorage('users'),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: PROFILE_PHOTO_MAX_SIZE_BYTES,
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: JwtPayload,
    @UploadedFile() profilePhoto?: UploadedImageFile,
  ) {
    return this.usersService.update(
      id,
      ({
        ...updateUserDto,
        profilePhotoPath: profilePhoto
          ? buildRelativeUploadPath('users', profilePhoto.filename)
          : undefined,
      } as UpdateUserDto & { profilePhotoPath?: string }),
      currentUser,
    );
  }

  @Patch(':id/disable')
  @Roles(Role.ADMIN)
  disable(@Param('id') id: string) {
    return this.usersService.disable(id);
  }
}
