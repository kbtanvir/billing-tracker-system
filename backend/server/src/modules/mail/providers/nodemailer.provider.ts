import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
  EmailPayload,
  IEMailProvider,
} from '../interfaces/email.provider.interface';

@Injectable()
export class NodeMailerConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
}

@Injectable()
export class NodeMailerProvider implements IEMailProvider {
  private transporter: nodemailer.Transporter;
  private logger = new Logger(NodeMailerProvider.name);

  constructor({ smtpHost, smtpPass, smtpPort, smtpUser }: NodeMailerConfig) {
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,

      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async send({ from, html, subject, to }: EmailPayload): Promise<void> {
    await this.transporter
      .sendMail({
        from,
        html,
        subject,
        to,
      })
      .catch((e) => this.logger.error(e));
  }
}
