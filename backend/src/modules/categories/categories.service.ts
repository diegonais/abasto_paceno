import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAllActive() {
    return this.categoriesRepository.find({
      where: { isActive: true },
      order: { categoryName: 'ASC' },
    });
  }

  async findOneActive(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const normalizedName = createCategoryDto.categoryName.trim().toLowerCase();
    const existing = await this.categoriesRepository.findOne({
      where: { categoryName: normalizedName },
    });

    if (existing) {
      throw new ConflictException('Category name already exists');
    }

    const category = this.categoriesRepository.create({
      categoryName: normalizedName,
      isActive: true,
    });

    return this.categoriesRepository.save(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (updateCategoryDto.categoryName) {
      const normalizedName = updateCategoryDto.categoryName.trim().toLowerCase();
      const existing = await this.categoriesRepository.findOne({
        where: { categoryName: normalizedName },
      });

      if (existing && existing.id !== category.id) {
        throw new ConflictException('Category name already exists');
      }

      category.categoryName = normalizedName;
    }

    return this.categoriesRepository.save(category);
  }

  async disable(id: string) {
    const category = await this.findOne(id);
    category.isActive = false;

    return this.categoriesRepository.save(category);
  }
}
