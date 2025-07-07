import { SetMetadata } from '@nestjs/common';
import { ROLES_REFLECTOR } from '../constant/roles-reflector';
import { UserRole } from '../enum';

export const Roles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_REFLECTOR, roles);
