// import { AttachmentData } from '@sendgrid/helpers/classes/attachment';

export type EmailPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
};

export abstract class IEMailProvider {
  abstract send(payload: EmailPayload): Promise<void>;
}
