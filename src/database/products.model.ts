import { createZodDto } from 'nestjs-zod';
import {
  DataTypes,
  Model,
  type CreationOptional,
  type Sequelize,
} from 'sequelize';
import z from 'zod';
import { $ZodNumberParams } from 'zod/v4/core';

const FIELD_VALID_DECIMAL_ERROR = 'Field must be a valid positive decimal.';
export const FIELD_VALID_INTEGER_ERROR =
  'Field must be a valid positive integer.';
const FIELD_REQUIRED_ERROR = 'Field is required.';
export const FIELD_STRING_ERROR = 'Field must be a string.';

/** Handles if the value provided is undefined or missing */
const validStockErrorHandler: $ZodNumberParams = {
  error: (issue) => {
    if (issue.input === undefined) {
      return FIELD_REQUIRED_ERROR;
    }

    if (typeof issue.input !== 'number') {
      return FIELD_VALID_INTEGER_ERROR;
    }

    return FIELD_VALID_INTEGER_ERROR;
  },
};

export const productSchema = z.object({
  /** Auto Incrementing database id */
  id: z.number().describe('The database identifier for the product').meta({
    example: '1',
  }),
  /** A unique identifier for the product */
  productToken: z
    .string({
      error: (issue) =>
        issue.input === undefined ? FIELD_REQUIRED_ERROR : FIELD_STRING_ERROR,
    })
    .describe('A unique identifier for the product')
    .meta({
      example: 'TELE1',
    }),
  /** Product name can be any string, uniqueness not constrained */
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined ? FIELD_REQUIRED_ERROR : FIELD_STRING_ERROR,
    })
    .describe('The name of the product')
    .meta({
      example: 'Television',
    }),
  /**
   * Product price as a decimal
   * Coerced as sequelize returns decimals as strings
   * Preprocess to ensure we don't coerce undefined as it returns a poor error message
   */
  price: z
    .preprocess(
      (val) => (val === undefined ? undefined : Number(val)),
      z
        .number({
          error: (issue) => {
            if (issue.input === undefined) {
              return FIELD_REQUIRED_ERROR;
            }

            if (typeof issue.input !== 'number') {
              return FIELD_VALID_DECIMAL_ERROR;
            }

            return FIELD_VALID_DECIMAL_ERROR;
          },
        })
        .min(0, { message: FIELD_VALID_DECIMAL_ERROR }),
    )
    .describe('The price of the product as a decimal')
    .meta({
      example: '99.95',
    }),
  /** Current stock of the product */
  stock: z
    .number(validStockErrorHandler)
    .min(0, { message: FIELD_VALID_INTEGER_ERROR })
    .int({ message: FIELD_VALID_INTEGER_ERROR })
    .describe('The current stock of the product')
    .meta({
      example: '100',
    }),
});
export const createProductSchema = productSchema.omit({
  id: true,
});

export const updateStockSchema = productSchema.pick({ stock: true });

export class ProductDto extends createZodDto(productSchema) {}
export class CreateProductDto extends createZodDto(createProductSchema) {}
export class UpdateStockDto extends createZodDto(updateStockSchema) {}

export class ProductModel extends Model<ProductDto, CreateProductDto> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare productToken: string;
  declare price: number;
  declare stock: number;
}

export function initProductModel(sequelize: Sequelize): typeof ProductModel {
  ProductModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      productToken: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        // 10 digits total, 2 decimal places
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          isInt: true,
        },
      },
    },
    {
      sequelize,
      tableName: 'products',
    },
  );

  return ProductModel;
}
