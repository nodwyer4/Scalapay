import { ProductModel } from '../database/products.model.js';
import { SEQUELIZE, PRODUCTS_REPOSITORY } from '../database/constants.js';

export const productsProviders = [
  {
    provide: PRODUCTS_REPOSITORY,
    inject: [SEQUELIZE],
    useFactory: (): typeof ProductModel => ProductModel,
  },
];
