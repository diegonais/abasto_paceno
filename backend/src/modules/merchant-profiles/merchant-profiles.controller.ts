import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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
  @Roles(Role.MERCHANT)
  getMe(@CurrentUser() currentUser: JwtPayload) {
    return this.merchantProfilesService.getMe(currentUser);
  }

  @Patch('me')
  @Roles(Role.MERCHANT)
  updateMe(
    @CurrentUser() currentUser: JwtPayload,
    @Body() updateMerchantProfileDto: UpdateMerchantProfileDto,
  ) {
    return this.merchantProfilesService.updateMe(
      currentUser,
      updateMerchantProfileDto,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.merchantProfilesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createMerchantProfileDto: CreateMerchantProfileDto) {
    return this.merchantProfilesService.create(createMerchantProfileDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateMerchantProfileDto: UpdateMerchantProfileDto,
  ) {
    return this.merchantProfilesService.update(id, updateMerchantProfileDto);
  }

  @Patch(':id/disable')
  @Roles(Role.ADMIN)
  disable(@Param('id') id: string) {
    return this.merchantProfilesService.disable(id);
  }
}
