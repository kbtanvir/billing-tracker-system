import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
})
export class OnAppInitModule {
  constructor() {}

  private async createRoles() {
    // const roles = Object.values(UserRole);
    // await Promise.all(
    //   roles.map(async (role) => {
    //     const isRoleExists = await this.roleService.existsByName(role);
    //     if (!isRoleExists) {
    //       await this.roleService.createRole(role);
    //     }
    //   }),
    // );
  }

  async onModuleInit() {
    // await this.createRoles();
  }
}
