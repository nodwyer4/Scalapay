import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SequelizeErrorHandlerFilter } from './sequelizeErrorHandler.filter.js';

describe('SequelizeErrorHandlerFilter', () => {
  const filter = new SequelizeErrorHandlerFilter();
  const host = {} as ArgumentsHost;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps UniqueConstraintError to 400 when Product token already exists', () => {
    const superCatch = vi
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation(() => undefined);

    filter.catch(new UniqueConstraintError({ message: 'duplicate' }), host);

    expect(superCatch).toHaveBeenCalledOnce();
    const [httpException, passedHost] = superCatch.mock.calls[0];

    expect(passedHost).toBe(host);
    expect(httpException).toBeInstanceOf(HttpException);
    expect((httpException as HttpException).getStatus()).toBe(
      HttpStatus.BAD_REQUEST,
    );
    expect((httpException as HttpException).message).toBe(
      'Product token already exists',
    );
  });

  it('maps ValidationError to 400 when validation fails', () => {
    const superCatch = vi
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation(() => undefined);

    filter.catch(new ValidationError('Validation error', []), host);

    expect(superCatch).toHaveBeenCalledOnce();
    const [httpException, passedHost] = superCatch.mock.calls[0];

    expect(passedHost).toBe(host);
    expect(httpException).toBeInstanceOf(HttpException);
    expect((httpException as HttpException).getStatus()).toBe(
      HttpStatus.BAD_REQUEST,
    );
    expect((httpException as HttpException).message).toBe(
      'Validation error, please check your request body',
    );
  });
});
