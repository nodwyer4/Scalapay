import { BadRequestException, Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module.js';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';
import { formatZodIssues } from './common/filters/zodException.filter.js';

@Module({
  imports: [ProductsModule],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: createZodValidationPipe({
        createValidationException: (error) =>
          new BadRequestException({
            statusCode: 400,
            message: 'Validation failed',
            errors: formatZodIssues((error as ZodError).issues),
          }),
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
