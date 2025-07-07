import { ROLES_REFLECTOR } from '@app/common/constant/roles-reflector';
import { UserRole } from '@app/common/enum';
import { UserRepository } from '@app/modules/usage/users.repository';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRepo: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndMerge<UserRole[]>(ROLES_REFLECTOR, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (!roles || !roles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const userId = request.params.userId;

    const user = await this.userRepo.findById(userId);
    // const user = request.user;

    return roles.includes(user?.roleId as UserRole);
  }
}
