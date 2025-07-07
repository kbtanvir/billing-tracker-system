// src/database/seeders/seeder.command.ts
import { Command, CommandRunner } from 'nest-commander';
import { UsageTestSeeder } from './seder.tester';

@Command({
  name: 'seed:usage-test',
  description: 'Seed test data for usage API',
})
export class SeedUsageTestCommand extends CommandRunner {
  constructor(private readonly seeder: UsageTestSeeder) {
    super();
  }

  async run(): Promise<void> {
    try {
      await this.seeder.seedTestData();
      console.log('🎉 Test data seeded successfully!');
    } catch (error) {
      console.error('❌ Error seeding test data:', error);
      process.exit(1);
    }
  }
}
