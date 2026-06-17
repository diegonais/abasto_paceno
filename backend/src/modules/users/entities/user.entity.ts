import { Exclude } from 'class-transformer';
import { Column, Entity, OneToOne } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from '../../../common/enums/role.enum';
import { MerchantProfile } from '../../merchant-profiles/entities/merchant-profile.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => MerchantProfile, (merchantProfile) => merchantProfile.user)
  merchantProfile?: MerchantProfile | null;
}
