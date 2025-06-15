import { Module } from '@nestjs/common';

import { UsageModule } from '../usage/usage.module';

@Module({
  imports: [UsageModule],
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
