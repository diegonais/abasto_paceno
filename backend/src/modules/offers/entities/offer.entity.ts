import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { SaleType } from '../../../common/enums/sale-type.enum';
import { MerchantProfile } from '../../merchant-profiles/entities/merchant-profile.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('offers')
export class Offer extends BaseEntity {
  @ManyToOne(() => MerchantProfile, (merchantProfile) => merchantProfile.offers, {
    eager: true,
    nullable: false,
  })
  merchantProfile: MerchantProfile;

  @ManyToOne(() => Product, (product) => product.offers, {
    eager: true,
    nullable: false,
  })
  product: Product;

  @Column({
    type: 'enum',
    enum: SaleType,
  })
  saleType: SaleType;

  @Column({ type: 'integer', nullable: true })
  approximateQuantity: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: string;

  @Column({ type: 'text', nullable: true })
  locationDescription: string | null;

  @Column({ type: 'timestamp', nullable: true })
  availableFrom: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  availableUntil: Date | null;

  @Column({ default: true })
  isActive: boolean;
}
