import { vi } from 'vitest';
import { ProductsService } from './products.service.js';

import {
  existingProductsInDatabase,
  productsToCreate,
} from '../test/testData.js';

import { ProductModel } from '../database/products.model.js';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let productsService: ProductsService;

  const productsRepository: Partial<typeof ProductModel> = {
    create: vi.fn(),
    destroy: vi.fn(),
    update: vi.fn(),
    findByPk: vi.fn(),
    findAndCountAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    productsService = new ProductsService(
      productsRepository as typeof ProductModel,
    );
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const productToCreate = productsToCreate[0];
      let expectedCreateProductResult = {
        id: 1,
        productToken: productToCreate.productToken,
        name: productToCreate.name,
        price: productToCreate.price,
        stock: productToCreate.stock,
      };

      vi.spyOn(productsRepository, 'create').mockImplementation(
        async () => expectedCreateProductResult,
      );

      expect(await productsService.createProduct(productToCreate)).toEqual(
        expectedCreateProductResult,
      );
    });

    it('should throw an error if the product creation fails', async () => {
      let productToCreate = productsToCreate[0];

      vi.spyOn(productsRepository, 'create').mockImplementation(async () => {
        throw new Error('Product creation failed');
      });

      await expect(
        productsService.createProduct(productToCreate),
      ).rejects.toThrow('Product creation failed');
    });

    it('should throw an error if a product with the same productToken already exists', async () => {
      const existingProduct = existingProductsInDatabase[0];
      const productToCreate = {
        productToken: existingProduct.productToken,
        name: existingProduct.name,
        price: existingProduct.price,
        stock: existingProduct.stock,
      };

      vi.spyOn(productsRepository, 'create').mockImplementation(async () => {
        throw new Error('Product already exists');
      });

      await expect(
        productsService.createProduct(productToCreate),
      ).rejects.toThrow('Product already exists');
    });
  });

  describe('deleteProductById', () => {
    it('should delete a product when given a valid id', async () => {
      // returns 1 deleted items if successful
      vi.spyOn(productsRepository, 'destroy').mockImplementation(async () =>
        Promise.resolve(1),
      );

      expect(await productsService.deleteProductById(1)).toEqual(undefined);
    });

    it('should throw a 404 error if the product to delete does not exist', async () => {
      vi.spyOn(productsRepository, 'destroy').mockImplementation(async () => {
        return Promise.resolve(0);
      });

      await expect(productsService.deleteProductById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProductStock', () => {
    it('should update the stock of a product when given a valid id and payload', async () => {
      const expectedNewValue = { ...productsToCreate[0], stock: 999 };

      vi.spyOn(productsRepository, 'update').mockImplementation(async () =>
        Promise.resolve([1]),
      );

      vi.spyOn(productsRepository, 'findByPk').mockImplementation(async () =>
        Promise.resolve(expectedNewValue as ProductModel),
      );

      expect(
        await productsService.updateProductStock(1, { stock: 999 }),
      ).toEqual(expectedNewValue);
    });

    it('should throw a 404 error if the product to update does not exist', async () => {
      vi.spyOn(productsRepository, 'update').mockImplementation(async () => {
        return Promise.resolve([0]);
      });

      await expect(
        productsService.updateProductStock(1, { stock: 100 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProductById', () => {
    it('should get a product by id when given a valid id', async () => {
      let expectedGetProductByIdResult = {
        id: 1,
        productToken: 'PROD1',
        name: 'Telephone',
        price: 99.99,
        stock: 100,
      };

      vi.spyOn(productsRepository, 'findByPk').mockImplementation(async () => {
        return Promise.resolve(expectedGetProductByIdResult as ProductModel);
      });

      expect(await productsService.getProductById(1)).toEqual(
        expectedGetProductByIdResult,
      );
    });

    it('should throw a 404 error if the product does not exist', async () => {
      vi.spyOn(productsRepository, 'findByPk').mockResolvedValue(null);

      await expect(productsService.getProductById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getProductsPaginated', () => {
    it('should get a list of products when given a valid page and limit', async () => {
      const allProducts = Array.from({ length: 20 }, (_, index) => ({
        id: index + 1,
        productToken: `PROD${index + 1}`,
        name: `Product ${index + 1}`,
        price: 99.99,
        stock: 100,
      }));

      let expectedGetProductsPaginatedResult = {
        data: allProducts.slice(0, 10),
        page: 1,
        limit: 10,
        total: allProducts.length,
      };

      let expectedGetProductsPaginatedResult2 = {
        data: allProducts.slice(5, 10),
        page: 2,
        limit: 5,
        total: allProducts.length,
      };

      vi.spyOn(productsRepository, 'findAndCountAll').mockImplementation(
        (async () => {
          const result = {
            rows: expectedGetProductsPaginatedResult.data as ProductModel[],
            count: expectedGetProductsPaginatedResult.total,
          } as { rows: ProductModel[]; count: number };

          return Promise.resolve(result);
          // resolving as typeof ProductModel.findAndCountAll to avoid issue with overloaded findAndCountAll method
        }) as typeof ProductModel.findAndCountAll,
      );

      // First page with 10 products per page
      expect(await productsService.getProductsPaginated(1, 10)).toEqual(
        expectedGetProductsPaginatedResult,
      );

      // Second page with 5 products per page
      vi.spyOn(productsRepository, 'findAndCountAll').mockImplementation(
        (async () => {
          const result = {
            rows: expectedGetProductsPaginatedResult2.data as ProductModel[],
            count: expectedGetProductsPaginatedResult2.total,
          } as { rows: ProductModel[]; count: number };

          return Promise.resolve(result);
          // resolving as typeof ProductModel.findAndCountAll to avoid issue with overloaded findAndCountAll method
        }) as typeof ProductModel.findAndCountAll,
      );

      expect(await productsService.getProductsPaginated(2, 5)).toEqual(
        expectedGetProductsPaginatedResult2,
      );
    });
  });
});
