import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Category } from '../../categories/entities/category.entity';
import { Offer } from '../../offers/entities/offer.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  productName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => Category, (category) => category.products, {
    eager: true,
    nullable: false,
  })
  category: Category;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Offer, (offer) => offer.product)
  offers?: Offer[];
}
