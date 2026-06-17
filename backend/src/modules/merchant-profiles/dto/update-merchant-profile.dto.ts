import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateMerchantProfileDto } from './create-merchant-profile.dto';

export class UpdateMerchantProfileDto extends PartialType(
  CreateMerchantProfileDto,
) {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
