import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { UniqueConstraintError, ValidationError } from 'sequelize';

@Catch(ValidationError)
export class SequelizeErrorHandlerFilter extends BaseExceptionFilter {
  catch(exception: ValidationError, host: ArgumentsHost) {
    let httpException: HttpException;

    // UniqueConstraintError extends ValidationError
    if (exception instanceof UniqueConstraintError) {
      httpException = new HttpException(
        'Product token already exists',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      // Fallback for Sequelize validation mismatches not caught by Zod
      httpException = new HttpException(
        'Validation error, please check your request body',
        HttpStatus.BAD_REQUEST,
      );
    }

    super.catch(httpException, host);
  }
}
