import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as fs from 'fs/promises';
import handlebars from 'handlebars';

import { ConfigService } from '../config/config.service';
import { EmailQueueName, Jobs } from './constants';
import { IEMailProvider } from './interfaces/email.provider.interface';
import { EmailTemplates } from './interfaces/email.templates.interface';

@Processor(EmailQueueName)
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly appConfig: ConfigService,
    private mailProvider: IEMailProvider,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(job.data)}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.debug(
      `Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(result)}`,
    );
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  @Process(Jobs.emailVerification)
  async sendEmailVerificationEmail(
    job: Job<{ email: string; token: string }>,
  ): Promise<any> {
    this.logger.log(`Sending verification email to '${job.data.email}'`);

    const { email, token } = job.data;
    try {
      const subject = 'Jamit | Email verification';

      const payload = await this.buildEmailPayload(subject, email, {
        template: 'email-verification.handlebars',
        payload: { token },
      });

      await this.mailProvider.send(payload);

      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send verification email to '${email}'`,
        error.stack,
      );
      throw error;
    }
  }

  @Process(Jobs.resetPasswordEmail)
  async sendResetPasswordEmail(
    job: Job<{ email: string; token: string }>,
  ): Promise<any> {
    this.logger.log(`Sending reset password email to '${job.data.email}'`);

    const { email, token } = job.data;
    try {
      const subject = 'Jamit | Reset Password';

      const payload = await this.buildEmailPayload(subject, email, {
        template: 'reset-password.handlebars',
        payload: { token },
      });

      await this.mailProvider.send(payload);

      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send reset password email to '${email}'`,
        error.stack,
      );
      throw error;
    }
  }

  @Process(Jobs.accountCreated)
  async sendAccountCreatedEmail(
    job: Job<{ email: string; password: string; link: string; role: string }>,
  ): Promise<any> {
    this.logger.log(`Sending account created email to '${job.data.email}'`);

    const { email } = job.data;
    try {
      const subject = 'Jamit | Welcome to our site';
      const payload = await this.buildEmailPayload(subject, email, {
        template: 'account-created.handlebars',
      });

      await this.mailProvider.send(payload);

      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send account created email to '${email}'`,
        error.stack,
      );
      throw error;
    }
  }

  private async buildEmailPayload(
    subject: string,
    recipient: string,
    data: EmailTemplates,
  ) {
    const source = await fs.readFile(
      `email_templates/${data.template}`,
      'utf8',
    );
    const compiledTemplate = handlebars.compile(source);

    return {
      from: this.appConfig.email.mailSendFrom,
      to: recipient,
      subject,
      html: compiledTemplate((data as any)?.payload),
    };
  }
}
