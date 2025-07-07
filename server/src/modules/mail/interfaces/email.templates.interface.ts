type TokenProp = {
  token: string;
};

export type EmailTemplateName =
  | 'email-verification.handlebars'
  | 'reset-password.handlebars'
  | 'account-created.handlebars';

export type EmailTemplates =
  | {
      template: 'email-verification.handlebars';
      payload: TokenProp;
    }
  | {
      template: 'reset-password.handlebars';
      payload: TokenProp;
    }
  | {
      template: 'account-created.handlebars';
    };
