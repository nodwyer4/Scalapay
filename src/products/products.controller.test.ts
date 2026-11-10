import { vi } from 'vitest';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

import {
  existingProductsInDatabase,
  productsToCreate,
} from '../test/testData.js';

import { ProductModel } from '../database/products.model.js';
import { NotFoundException } from '@nestjs/common';
import { ValidationError } from 'sequelize';

describe('ProductsController', () => {
  let productsController: ProductsController;
  const productsService: Partial<ProductsService> = {
    createProduct: vi.fn(),
    deleteProductById: vi.fn(),
    updateProductStock: vi.fn(),
    getProductById: vi.fn(),
    getProductsPaginated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    productsController = new ProductsController(
      productsService as ProductsService,
    );
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      let expectedControllerResult = productsToCreate[0] as ProductModel;

      let productData = productsToCreate[0];

      let createdProductMock = {
        id: 1,
        productToken: productData.productToken,
        name: productData.name,
        price: productData.price,
        stock: productData.stock,
      } as ProductModel;

      let createdProductPromise = new Promise<ProductModel>((resolve) =>
        resolve(createdProductMock),
      );

      vi.spyOn(productsService, 'createProduct').mockImplementation(
        async () => createdProductPromise,
      );

      expect(await productsController.createProduct(productData)).toEqual({
        // Valid spread, we're casting the object ourself, it's actually not a class
        ...expectedControllerResult, // oxlint-disable-line @typescript/no-misused-spread
        id: 1,
      });
    });

    it('should throw an error if the product creation fails', async () => {
      let productData = productsToCreate[0];

      vi.spyOn(productsService, 'createProduct').mockImplementation(async () =>
        Promise.reject(new Error('Product creation failed')),
      );

      await expect(
        productsController.createProduct(productData),
      ).rejects.toThrow('Product creation failed');
    });

    it('should throw an error if a product with the same productToken already exists', async () => {
      const existingProduct = existingProductsInDatabase[0];
      const productData = {
        productToken: existingProduct.productToken,
        name: existingProduct.name,
        price: existingProduct.price,
        stock: existingProduct.stock,
      };

      let validationError = new ValidationError('Product already exists', []);

      vi.spyOn(productsService, 'createProduct').mockImplementation(async () =>
        Promise.reject(validationError),
      );

      await expect(
        productsController.createProduct(productData),
      ).rejects.toThrow(validationError);
    });
  });

  describe('deleteProductById', () => {
    it('should delete a product when given a valid id', async () => {
      vi.spyOn(productsService, 'deleteProductById').mockImplementation(
        async () => {},
      );

      expect(await productsController.deleteProductById(1)).toEqual(undefined);
    });

    it('should throw a 404 error if the product to delete does not exist', async () => {
      vi.spyOn(productsService, 'deleteProductById').mockImplementation(
        async () => {
          throw new NotFoundException('Product not found');
        },
      );

      await expect(productsController.deleteProductById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProductStock', () => {
    it('should update the stock of a product when given a valid id and payload', async () => {
      let expectedUpdateStockResult = {
        ...productsToCreate[0],
        stock: 100,
      } as ProductModel;

      vi.spyOn(productsService, 'updateProductStock').mockImplementation(
        async () => {
          return Promise.resolve(expectedUpdateStockResult);
        },
      );

      expect(
        await productsController.updateProductStock(1, { stock: 100 }),
      ).toEqual(expectedUpdateStockResult);
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

      vi.spyOn(productsService, 'getProductById').mockImplementation(
        async () => {
          return Promise.resolve(expectedGetProductByIdResult as ProductModel);
        },
      );

      expect(await productsController.getProductById(1)).toEqual(
        expectedGetProductByIdResult,
      );
    });
  });

  describe('getProductsPaginated', () => {
    it('should get a list of products when given a valid page and limit', async () => {
      let expectedGetProductsPaginatedResult = {
        data: [
          {
            id: 1,
            productToken: 'PROD1',
            name: 'Telephone',
            price: 99.99,
            stock: 100,
          } as ProductModel,
          {
            id: 2,
            productToken: 'PROD2',
            name: 'Laptop',
            price: 99.99,
            stock: 100,
          } as ProductModel,
          {
            id: 3,
            productToken: 'PROD3',
            name: 'Tablet',
            price: 99.99,
            stock: 100,
          } as ProductModel,
        ],
        page: 1,
        limit: 10,
        total: 1,
      };

      vi.spyOn(productsService, 'getProductsPaginated').mockImplementation(
        async () => {
          return Promise.resolve(expectedGetProductsPaginatedResult);
        },
      );

      expect(await productsController.getProductsPaginated(1, 10)).toEqual(
        expectedGetProductsPaginatedResult,
      );
    });
  });
});
