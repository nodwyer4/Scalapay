import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PRODUCTS_REPOSITORY } from '../database/constants.js';
import { ProductDto } from '../database/products.model.js';
import { UniqueConstraintError } from 'sequelize';
import { vi } from 'vitest';
import { AppModule } from '../app.module.js';

describe('Products', () => {
  let app: INestApplication;

  const productsRepository = {
    create: vi.fn().mockReturnValue({
      id: 1,
      productToken: 'test-product-token',
      name: 'Test Product',
      price: 100,
      stock: 100,
    } satisfies ProductDto),
    // update returns the number of rows updated, we re-fetch the new product after
    // the update has been performed
    update: vi.fn().mockReturnValue([1]),
    destroy: vi.fn(),
    findAndCountAll: vi.fn().mockReturnValue({
      rows: [
        {
          id: 1,
          productToken: 'test-product-token',
          name: 'Test Product',
          price: 100,
          stock: 100,
        },
        {
          id: 2,
          productToken: 'test-product-token-2',
          name: 'Test Product 2',
          price: 200,
          stock: 200,
        },
      ] satisfies ProductDto[],
      count: 2,
    }),
    findByPk: vi.fn().mockReturnValue({
      id: 1,
      productToken: 'test-product-token',
      name: 'Test Product',
      price: 100,
      stock: 100,
    } satisfies ProductDto),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PRODUCTS_REPOSITORY)
      .useValue(productsRepository)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /products', () => {
    it(`should return the default first page and 10 items of products when called with no parameters`, () => {
      return request(app.getHttpServer()).get('/products').expect(200).expect({
        data: productsRepository.findAndCountAll().rows,
        page: 1,
        limit: 10,
        total: productsRepository.findAndCountAll().count,
      });
    });

    it(`should return a subset of products when given a valid page and limit`, () => {
      const page = 1;
      const limit = 10;
      return request(app.getHttpServer())
        .get('/products')
        .query({ page, limit })
        .expect(200)
        .expect({
          data: productsRepository.findAndCountAll().rows,
          page,
          limit,
          total: productsRepository.findAndCountAll().count,
        });
    });

    it(`should return 400 if the page is 0`, () => {
      const page = 0;
      const limit = 10;
      return request(app.getHttpServer())
        .get('/products')
        .query({ page, limit })
        .expect(400)
        .expect({
          error: 'Bad Request',
          message: 'Validation failed (minimum: 1)',
          statusCode: 400,
        });
    });

    it(`should return 400 if the page is negative`, () => {
      const page = -1;
      const limit = 10;
      request(app.getHttpServer())
        .get('/products')
        .query({ page, limit })
        .expect(400)
        .expect({
          error: 'Bad Request',
          message: 'Validation failed (minimum: 1)',
          statusCode: 400,
        });
    });

    it(`should return 400 if the limit is 0`, () => {
      const page = 1;
      const limit = 0;
      return request(app.getHttpServer())
        .get('/products')
        .query({ page, limit })
        .expect(400)
        .expect({
          error: 'Bad Request',
          message: 'Validation failed (minimum: 1)',
          statusCode: 400,
        });
    });

    it(`should return 400 if the limit is less negative`, () => {
      const page = 1;
      const limit = -1;
      return request(app.getHttpServer())
        .get('/products')
        .query({ page, limit })
        .expect(400)
        .expect({
          error: 'Bad Request',
          message: 'Validation failed (minimum: 1)',
          statusCode: 400,
        });
    });

    it(`should return 400 if the limit is greater than 100`, () => {
      const page = 1;
      const limit = 10000;

      return request(app.getHttpServer())
        .get('/products')
        .query({ page, limit })
        .expect(400)
        .expect({
          error: 'Bad Request',
          message: 'Validation failed (maximum: 100)',
          statusCode: 400,
        });
    });

    it('should return 400 if page is not a number', () => {
      return request(app.getHttpServer())
        .get('/products')
        .query({ page: 'not a number', limit: 10 })
        .expect(400);
    });

    it('should return 400 if limit is not a number', () => {
      return request(app.getHttpServer())
        .get('/products')
        .query({ page: 1, limit: 'not a number' })
        .expect(400);
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', () => {
      return request(app.getHttpServer())
        .get('/products/1')
        .expect(200)
        .expect(productsRepository.findByPk() as ProductDto);
    });

    it('should 404 when the product does not exist', () => {
      productsRepository.findByPk.mockReturnValueOnce(undefined);

      return request(app.getHttpServer())
        .get('/products/1')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Product not found',
          error: 'Not Found',
        });
    });
  });

  describe('POST /products', () => {
    it('should create a new product when given a valid name, price, and stock', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          productToken: 'test-product-token',
          price: 100,
          stock: 100,
        })
        .expect(201)
        .expect(productsRepository.create());
    });

    it('should return 400 when the product already exists', () => {
      productsRepository.create.mockImplementationOnce(() => {
        throw new UniqueConstraintError({
          message: 'Product already exists',
          fields: { productToken: 'duplicate-token' },
        });
      });

      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          productToken: 'duplicate-token',
          price: 100,
          stock: 100,
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'Product token already exists',
        });
    });

    describe('When fields are missing from the request body', () => {
      it('should return 400 when the product name is not provided', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({
            productToken: 'duplicate-token',
            price: 100,
            stock: 100,
          })
          .expect(400)
          .expect({
            statusCode: 400,
            errors: [
              {
                field: 'name',
                message: 'Field is required.',
              },
            ],
            message: 'Validation failed',
          });
      });

      it('should return 400 when the product price is not provided', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({
            productToken: 'duplicate-token',
            name: 'Test Product',
            stock: 100,
          })
          .expect(400)
          .expect({
            statusCode: 400,
            errors: [
              {
                field: 'price',
                message: 'Field is required.',
              },
            ],
            message: 'Validation failed',
          });
      });

      it('should return 400 when the product token is not provided', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({
            name: 'Test Product',
            price: 100,
            stock: 100,
          })
          .expect(400)
          .expect({
            statusCode: 400,
            errors: [
              {
                field: 'productToken',
                message: 'Field is required.',
              },
            ],
            message: 'Validation failed',
          });
      });

      it('should return 400 when the product stock is not provided', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({
            productToken: 'duplicate-token',
            name: 'Test Product',
            price: 100,
          })
          .expect(400)
          .expect({
            statusCode: 400,
            errors: [
              {
                field: 'stock',
                message: 'Field is required.',
              },
            ],
            message: 'Validation failed',
          });
      });
    });

    describe('When fields are not the correct type', () => {
      it('should return 400 when the product name is not a string', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({
            name: 100,
            productToken: 'duplicate-token',
            price: 100,
            stock: 100,
          })
          .expect(400)
          .expect({
            statusCode: 400,
            errors: [
              {
                field: 'name',
                message: 'Field must be a string.',
              },
            ],
            message: 'Validation failed',
          });
      });

      it('should return 400 when the product price is not a number', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({
            productToken: 'duplicate-token',
            name: 'Test Product',
            stock: 100,
            price: 'five hundred dollars',
          })
          .expect(400)
          .expect({
            statusCode: 400,
            errors: [
              {
                field: 'price',
                message: 'Field must be a valid positive decimal.',
              },
            ],
            message: 'Validation failed',
          });
      });

      it('should 400 when the product price is not a positive decimal', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({
            productToken: 'fresh-token',
            name: 'Test Product',
            price: -100,
            stock: 1,
          })
          .expect(400)
          .expect({
            statusCode: 400,
            errors: [
              {
                field: 'price',
                message: 'Field must be a valid positive decimal.',
              },
            ],
            message: 'Validation failed',
          });
      });

      it('should return 400 when the product token is not a string', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({
            name: 'Test Product',
            productToken: 1234,
            price: 100,
            stock: 100,
          })
          .expect(400)
          .expect({
            statusCode: 400,
            errors: [
              {
                field: 'productToken',
                message: 'Field must be a string.',
              },
            ],
            message: 'Validation failed',
          });
      });

      it('should 400 when the stock is not a positive integer', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({
            productToken: 'fresh-token',
            name: 'Test Product',
            price: 100,
            stock: -1,
          })
          .expect(400)
          .expect({
            statusCode: 400,
            errors: [
              {
                field: 'stock',
                message: 'Field must be a valid positive integer.',
              },
            ],
            message: 'Validation failed',
          });
      });

      it('should return 400 when the product stock is not a number', () => {
        return request(app.getHttpServer())
          .post('/products')
          .send({
            productToken: 'duplicate-token',
            name: 'Test Product',
            price: 100,
            stock: 'one hundred',
          })
          .expect(400)
          .expect({
            statusCode: 400,
            errors: [
              {
                field: 'stock',
                message: 'Field must be a valid positive integer.',
              },
            ],
            message: 'Validation failed',
          });
      });
    });
  });

  describe('PUT /products/:id/stock', () => {
    it('should update a product when given a valid stock value', () => {
      return request(app.getHttpServer())
        .put('/products/1/stock')
        .send({
          stock: 200,
        })
        .expect(200);
    });

    it('should 404 when the product does not exist', () => {
      productsRepository.update.mockImplementationOnce(() => {
        return [0];
      });

      return request(app.getHttpServer())
        .put('/products/1/stock')
        .send({
          stock: 200,
        })
        .expect(404)
        .expect({
          error: 'Not Found',
          statusCode: 404,
          message: 'Product not found',
        });
    });

    it('should 400 when the stock is not provided', () => {
      return request(app.getHttpServer())
        .put('/products/1/stock')
        .send({
          name: 'updated name',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          errors: [
            {
              field: 'stock',
              message: 'Field is required.',
            },
          ],
          message: 'Validation failed',
        });
    });

    it('should 400 when the stock is not a valid number', () => {
      return request(app.getHttpServer())
        .put('/products/1/stock')
        .send({
          stock: 'one hundred',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          errors: [
            {
              field: 'stock',
              message: 'Field must be a valid positive integer.',
            },
          ],
          message: 'Validation failed',
        });
    });

    it('should 400 when the stock is not a positive integer', () => {
      return request(app.getHttpServer())
        .put('/products/1/stock')
        .send({
          stock: -1,
        })
        .expect(400)
        .expect({
          statusCode: 400,
          errors: [
            {
              field: 'stock',
              message: 'Field must be a valid positive integer.',
            },
          ],
          message: 'Validation failed',
        });
    });

    it('should 400 when the stock is a decimal', () => {
      return request(app.getHttpServer())
        .put('/products/1/stock')
        .send({
          stock: 1.5,
        })
        .expect(400)
        .expect({
          statusCode: 400,
          errors: [
            {
              field: 'stock',
              message: 'Field must be a valid positive integer.',
            },
          ],
          message: 'Validation failed',
        });
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product when given a valid id', () => {
      return request(app.getHttpServer()).delete('/products/1').expect(204);
    });

    it('should 404 when the product does not exist', () => {
      productsRepository.destroy.mockImplementationOnce(() => {
        return 0;
      });

      return request(app.getHttpServer())
        .delete('/products/1')
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'Product not found',
        });
    });

    it('should 400 when the id is not a number', () => {
      return request(app.getHttpServer())
        .delete('/products/telephone')
        .expect(400)
        .expect({
          error: 'Bad Request',
          message: 'Validation failed (numeric string is expected)',
          statusCode: 400,
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
