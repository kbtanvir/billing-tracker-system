import { Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

@Processor('domain-management')
export class QueueProcessor {
  constructor() {}
  private readonly logger = new Logger(QueueProcessor.name);
}
