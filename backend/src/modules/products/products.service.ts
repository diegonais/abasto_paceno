import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAllActive() {
    return this.productsRepository.find({
      where: {
        isActive: true,
        category: {
          isActive: true,
        },
      },
      order: {
        productName: 'ASC',
      },
    });
  }

  async findOneActive(id: string) {
    const product = await this.productsRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    const category = await this.findActiveCategory(createProductDto.categoryId);
    const product = this.productsRepository.create({
      productName: createProductDto.productName.trim().toLowerCase(),
      description: createProductDto.description?.trim() ?? null,
      category,
      isActive: true,
    });

    return this.productsRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (updateProductDto.productName !== undefined) {
      product.productName = updateProductDto.productName.trim().toLowerCase();
    }

    if (updateProductDto.description !== undefined) {
      product.description = updateProductDto.description?.trim() ?? null;
    }

    if (updateProductDto.categoryId) {
      product.category = await this.findActiveCategory(updateProductDto.categoryId);
    }

    return this.productsRepository.save(product);
  }

  async disable(id: string) {
    const product = await this.findOne(id);
    product.isActive = false;

    return this.productsRepository.save(product);
  }

  private async findActiveCategory(categoryId: string) {
    const category = await this.categoriesRepository.findOne({
      where: {
        id: categoryId,
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Active category not found');
    }

    return category;
  }
}
