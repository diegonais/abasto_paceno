import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
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
import { Public } from '../../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @UseInterceptors(
    FileInterceptor('profilePhoto', {
      storage: createImageStorage('users'),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: PROFILE_PHOTO_MAX_SIZE_BYTES,
      },
    }),
  )
  register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() profilePhoto?: UploadedImageFile,
  ) {
    return this.authService.register(
      registerDto,
      profilePhoto
        ? buildRelativeUploadPath('users', profilePhoto.filename)
        : null,
    );
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() currentUser: JwtPayload) {
    return this.authService.me(currentUser);
  }
}
