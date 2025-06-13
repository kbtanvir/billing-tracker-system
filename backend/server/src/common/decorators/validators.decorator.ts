import { HttpException, HttpStatus } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsValidEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Regular expression to check for emails with +1 or +2 in the domain part
          const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu)$/;

          // If the email doesn't match the regex, it's invalid
          if (!regex.test(value)) return false;

          // Check if email contains +1 or +2 in the local or domain part
          const domainPart = value.split('@')[1];
          if (value.includes('+') || domainPart.includes('+')) {
            throw new HttpException(
              'Invalid email format',
              HttpStatus.BAD_REQUEST,
            );
          }

          return true; // Valid if no +1 or +2 in domain part
        },
        defaultMessage(args: ValidationArguments) {
          return 'Invalid email format';
        },
      },
    });
  };
}
