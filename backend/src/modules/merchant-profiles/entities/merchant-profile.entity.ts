import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { MerchantKind } from '../../../common/enums/merchant-kind.enum';
import { MerchantVerificationStatus } from '../../../common/enums/merchant-verification-status.enum';
import { Offer } from '../../offers/entities/offer.entity';
import { User } from '../../users/entities/user.entity';

@Entity('merchantProfiles')
export class MerchantProfile extends BaseEntity {
  @OneToOne(() => User, (user) => user.merchantProfile, { eager: true })
  @JoinColumn()
  user: User;

  @Column({ type: 'text', nullable: true })
  businessName: string | null;

  @Column()
  ownerFullName: string;

  @Column({
    type: 'enum',
    enum: MerchantKind,
    default: MerchantKind.INDIVIDUAL,
  })
  merchantKind: MerchantKind;

  @Column({ type: 'text', nullable: true })
  documentId: string | null;

  @Column({ type: 'text', nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  contactEmail: string | null;

  @Column({ type: 'text', nullable: true })
  city: string | null;

  @Column({ type: 'text', nullable: true })
  zone: string | null;

  @Column({ type: 'text', nullable: true })
  addressLine: string | null;

  @Column({ type: 'text', nullable: true })
  reference: string | null;

  @Column({ type: 'text', nullable: true })
  openingHours: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  storePhotoPath: string | null;

  @Column({
    type: 'enum',
    enum: MerchantVerificationStatus,
    default: MerchantVerificationStatus.PENDING,
  })
  verificationStatus: MerchantVerificationStatus;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Offer, (offer) => offer.merchantProfile)
  offers?: Offer[];
}
