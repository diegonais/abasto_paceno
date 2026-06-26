import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import { OfferAvailability } from '../../../common/enums/offer-availability.enum';
import { SaleType } from '../../../common/enums/sale-type.enum';

export class CreateOfferDto {
  @ApiPropertyOptional({
    description:
      'Required for admin. Ignored for merchants because it uses their own merchant profile.',
  })
  @IsUUID()
  @IsOptional()
  merchantProfileId?: string;

  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty({ enum: SaleType })
  @IsEnum(SaleType)
  saleType: SaleType;

  @ApiPropertyOptional({ enum: OfferAvailability })
  @IsOptional()
  @IsEnum(OfferAvailability)
  availabilityType?: OfferAvailability;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  approximateQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(280)
  locationDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  availableUntil?: string;
}
