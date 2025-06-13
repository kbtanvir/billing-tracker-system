import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

import { EmailQueueName, Jobs } from './constants';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectQueue(EmailQueueName) private mailQueue: Queue) {}

  async sendResetPasswordEmail(email: string, token: string): Promise<boolean> {
    try {
      await this.mailQueue.add(Jobs.resetPasswordEmail, {
        email,
        token,
      });
      return true;
    } catch (error) {
      this.logger.error(`Error queueing reset password email to user ${email}`);
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    try {
      await this.mailQueue.add(Jobs.emailVerification, {
        email,
        token,
      });
      return true;
    } catch (error) {
      this.logger.error(`Error queueing verification email to user ${email}`);
      return false;
    }
  }

  async sendAccountCreatedEmail(email: string): Promise<boolean> {
    try {
      await this.mailQueue.add(Jobs.accountCreated, {
        email,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Error queueing account created email to user ${email}`,
      );
      return false;
    }
  }
}
