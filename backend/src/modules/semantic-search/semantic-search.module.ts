import { Module } from '@nestjs/common';

import { OffersModule } from '../offers/offers.module';
import { ProductsModule } from '../products/products.module';
import { SemanticSearchController } from './semantic-search.controller';
import { SemanticSearchService } from './semantic-search.service';

@Module({
  imports: [OffersModule, ProductsModule],
  controllers: [SemanticSearchController],
  providers: [SemanticSearchService],
})
export class SemanticSearchModule {}
