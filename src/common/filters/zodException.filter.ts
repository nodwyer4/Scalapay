import { $ZodIssue } from 'zod/v4/core';
import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import {
  FIELD_STRING_ERROR,
  FIELD_VALID_INTEGER_ERROR,
} from '../../database/products.model.js';

export type FormattedZodError = {
  field: string;
  message: string;
};

/** API response schema for when zod validation fails, mainly used for swagger docs */
export class ZodValidationResponseDto extends createZodDto(
  z.object({
    statusCode: z.literal(400),
    message: z.literal('Validation failed'),
    errors: z.array(
      z.object({
        field: z.string().meta({ example: 'name' }),
        message: z.string().meta({ example: FIELD_STRING_ERROR }),
      }),
    ),
  }),
) {}

/** API response schema for when zod validation fails on stock, mainly used for swagger docs */
export class ZodValidationResponseDtoForStock extends createZodDto(
  z.object({
    statusCode: z.literal(400),
    message: z.literal('Validation failed'),
    errors: z.array(
      z.object({
        field: z.string().meta({ example: 'stock' }),
        message: z.string().meta({ example: FIELD_VALID_INTEGER_ERROR }),
      }),
    ),
  }),
) {}

export function formatZodIssues(issues: $ZodIssue[]): FormattedZodError[] {
  return issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}
