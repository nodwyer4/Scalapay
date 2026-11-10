import {
  ArgumentMetadata,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseIntPipeOptions,
  Post,
  Put,
  Query,
  UseFilters,
} from '@nestjs/common';
import {
  ProductModel,
  productSchema,
  updateStockSchema,
  CreateProductDto,
  UpdateStockDto,
  ProductDto,
  createProductSchema,
} from '../database/products.model.js';
import { ProductsService } from './products.service.js';
import { SequelizeErrorHandlerFilter } from '../common/filters/sequelizeErrorHandler.filter.js';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import z from 'zod';

import {
  ZodValidationResponseDto,
  ZodValidationResponseDtoForStock,
} from '../common/filters/zodException.filter.js';

const PaginatedResponseSchema = z.object({
  data: z.array(productSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
});

const PaginatedResponseDto = createZodDto(PaginatedResponseSchema);

/** Custom parse int pipe that enforces a minimum */
class MinMaxIntPipe extends ParseIntPipe {
  constructor(
    private limits: {
      minimum?: number;
      maximum?: number;
    },
    options?: ParseIntPipeOptions,
  ) {
    super(options);
  }
  async transform(value: unknown, metadata: ArgumentMetadata) {
    const n = await super.transform(value, metadata);

    if (this.limits.minimum && n != null && n < this.limits.minimum) {
      throw this.exceptionFactory(
        `Validation failed (minimum: ${this.limits.minimum})`,
      );
    }

    if (this.limits.maximum && n != null && n > this.limits.maximum) {
      throw this.exceptionFactory(
        `Validation failed (maximum: ${this.limits.maximum})`,
      );
    }

    return n;
  }
}

@Controller('products')
@UseFilters(SequelizeErrorHandlerFilter)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ZodResponse({ type: PaginatedResponseDto })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    default: 1,
    minimum: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  async getProductsPaginated(
    @Query('page', new MinMaxIntPipe({ minimum: 1 }, { optional: true }))
    page: number = 1,
    @Query(
      'limit',
      new MinMaxIntPipe({ minimum: 1, maximum: 100 }, { optional: true }),
    )
    limit: number = 10,
  ) {
    return this.productsService.getProductsPaginated(
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @ZodResponse({ type: ProductDto })
  @ApiNotFoundResponse({
    description: 'Not Found',
    type: NotFoundException,
    example: {
      statusCode: 404,
      error: 'Not Found',
      message: 'Product not found',
    },
  })
  async getProductById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductModel> {
    return this.productsService.getProductById(id);
  }

  @Post()
  @ZodResponse({ type: ProductDto })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    type: ZodValidationResponseDto,
  })
  async createProduct(
    @Body({ schema: createProductSchema }) product: CreateProductDto,
  ) {
    return await this.productsService.createProduct(product);
  }

  @Put(':id/stock')
  @ZodResponse({ type: ProductDto })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    type: ZodValidationResponseDtoForStock,
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
    type: NotFoundException,
    example: {
      statusCode: 404,
      error: 'Not Found',
      message: 'Product not found',
    },
  })
  async updateProductStock(
    @Param('id', ParseIntPipe) id: number,
    @Body({ schema: updateStockSchema }) product: UpdateStockDto,
  ): Promise<ProductModel> {
    return await this.productsService.updateProductStock(id, product);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiBadRequestResponse({
    description: 'Bad Request',
    example: {
      error: 'Bad Request',
      message: 'Validation failed (numeric string is expected)',
      statusCode: 400,
    },
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
    type: NotFoundException,
    example: {
      statusCode: 404,
      error: 'Not Found',
      message: 'Product not found',
    },
  })
  @ApiNoContentResponse({
    description: 'No Content sent back when delete succeeds',
  })
  async deleteProductById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return await this.productsService.deleteProductById(id);
  }
}
