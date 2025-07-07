import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Expose, ExposeOptions } from 'class-transformer';

export const ExposeApiProp = (
  exposeOpts?: ExposeOptions,
  apiPropOpts?: ApiPropertyOptions,
) => applyDecorators(Expose(exposeOpts), ApiProperty(apiPropOpts));
