import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { User } from '../../users/entities/user.entity';

@Entity('merchantProfiles')
export class MerchantProfile extends BaseEntity {
  @OneToOne(() => User, (user) => user.merchantProfile, { eager: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  businessName: string | null;

  @Column()
  ownerFullName: string;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Offer, (offer) => offer.merchantProfile)
  offers?: Offer[];
}
