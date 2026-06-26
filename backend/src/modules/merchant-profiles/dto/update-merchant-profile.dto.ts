import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { MerchantVerificationStatus } from '../../../common/enums/merchant-verification-status.enum';
import { CreateMerchantProfileDto } from './create-merchant-profile.dto';

export class UpdateMerchantProfileDto extends PartialType(
  CreateMerchantProfileDto,
) {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: MerchantVerificationStatus })
  @IsEnum(MerchantVerificationStatus)
  @IsOptional()
  verificationStatus?: MerchantVerificationStatus;
}
