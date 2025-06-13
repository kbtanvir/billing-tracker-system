// src/seeder.ts
import { CommandFactory } from 'nest-commander';
import { SeederModule } from './modules/seed/seeder.module';

async function bootstrap() {
  await CommandFactory.run(SeederModule, ['warn', 'error']);
}

void bootstrap();
