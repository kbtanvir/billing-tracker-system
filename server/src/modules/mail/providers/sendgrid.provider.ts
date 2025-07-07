import { Injectable, Logger } from '@nestjs/common';
import {
  EmailPayload,
  IEMailProvider,
} from '../interfaces/email.provider.interface';
import MailService from '@sendgrid/mail';

@Injectable()
export class SendgridConfig {
  apiKey: string;
}

@Injectable()
export class SendgridProvider implements IEMailProvider {
  private transporter;
  private logger = new Logger(SendgridProvider.name);

  constructor({ apiKey }: SendgridConfig) {
    this.transporter = MailService;
    this.transporter.setApiKey(apiKey);
  }

  async send({
    from,
    html,
    subject,
    to,
    attachments,
  }: EmailPayload): Promise<void> {
    await this.transporter
      .send({
        from,
        html,
        subject,
        to,
        attachments: attachments?.length ? attachments : [],
      })
      .catch((e) => this.logger.error(e));
  }
}
