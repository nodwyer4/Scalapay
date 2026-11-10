import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ProductModel,
  CreateProductDto,
  UpdateStockDto,
} from '../database/products.model.js';
import { PRODUCTS_REPOSITORY } from '../database/constants.js';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productsRepository: typeof ProductModel,
  ) {}

  async getProductsPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: ProductModel[];
    page: number;
    limit: number;
    total: number;
  }> {
    const offset = (page - 1) * limit;

    const { rows, count } = await this.productsRepository.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    return {
      data: rows,
      page,
      limit,
      total: count,
    };
  }

  async getProductById(id: number): Promise<ProductModel> {
    const product = await this.productsRepository.findByPk(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createProduct(product: CreateProductDto): Promise<ProductModel> {
    return this.productsRepository.create(product);
  }

  async updateProductStock(
    id: number,
    payload: UpdateStockDto,
  ): Promise<ProductModel> {
    const [affectedRows] = await this.productsRepository.update(
      { stock: payload.stock },
      { where: { id } },
    );

    if (affectedRows === 0) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.getProductById(id);

    return product;
  }

  async deleteProductById(id: number): Promise<void> {
    const deleted = await this.productsRepository.destroy({ where: { id } });

    if (deleted === 0) {
      throw new NotFoundException('Product not found');
    }
  }
}
