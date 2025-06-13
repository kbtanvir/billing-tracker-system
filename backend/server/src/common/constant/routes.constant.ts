import { ControllersEnum } from '@app/enum';

export const Routes = {
  [ControllersEnum.Admin]: {},
  [ControllersEnum.Auth]: {
    register: 'register',
    registerFacebook: 'register/facebook',
    registerGoogle: 'register/google',
    loginGoogle: 'login/google',
    socialRedirect: 'social/redirect',
    socialLogin: 'social/login',
    adminLogin: 'admin/login',
    login: 'login',
    loginFacebook: 'login/facebook',
    loginRedirect: 'login/redirect',
    logout: 'logout',
    refreshJwtToken: 'refresh/jwt-token',
    verifyEmail: 'verify-email',
    resetPassword: 'reset-password',
    requestEmailVerification: 'email-verification-request',
    changePasswordRequest: 'change-password-request',
    resetPasswordSendCode: 'reset-password/send',
    myProfile: 'me',
    myProfileUpdate: 'me/update',
    myProfileUpdateAvatar: 'me/avatar',
  },

  [ControllersEnum.Roles]: {
    list: '',
  },

  [ControllersEnum.Stores]: {
    create: '',
    list: '',
    syncRedis: 'sync/redis',
    hostBucketDetails: 'bucket-details/host',
    subdomainBucketDetails: 'bucket-details/subdomain/:name',
    search: 'search/:text',
    storeSettings: 'settings',
    single: ':id',
    update: ':id',
    updateHome: ':id/home',
    updateSubdomain: ':id/subdomain',
    files: ':id/:directory',
    rootHtmlFiles: ':id/html',
    // addCustomDomain: ':id/host',
    // availableSubdomain: 'subdomain-available/:name',
    // generateThumbnails: ':id/generateThumbnails',
  },
  [ControllersEnum.Domain]: {
    subdomainBucketDetails: 'subdomain/bucket-details/:subdomain',
    availableSubdomain: 'subdomain/available/:name',
    hostBucketDetails: 'host/bucket-details',
    verifyDNS: 'dns/verify',
    verifyTXTRecord: 'dns/records/txt/verify',
    getDnsRecord: 'dns/records',
    addCustomDomain: 'host',
    customDomainCount: 'host/count',
    hostPrivacy: 'host/privacy',
    removeCustomDomain: 'host/:id',
  },

  [ControllersEnum.FileManager]: {
    upload: 'upload',
    get: '',
    regenerateURL: 'regenerate-urls',
    rename: 'rename',
    clone: 'clone',
    export: 'export',
    edit: 'edit',
    updatePrivacy: 'updatePrivacy',
    save: 'save',
    delete: '',
    cdnJsSync: 'sync-cdn-js',
  },

  [ControllersEnum.Otps]: {
    send: '',
    verify: 'verify/msisdn',
    verifyTwoStepAuth: 'verify/two-step-auth',
    resendTwoStepAuth: 'resend/two-step-auth',
    verifyEmailVerificationLink: 'verify/email-verification-link',
    resendEmailVerificationLink: 'resend/email-verification-link',
  },

  [ControllersEnum.Payments]: {
    prices: 'prices',
    current: 'current', // return companies
    intent: 'intent',
    session: 'session',
    sessionPublic: 'session-public',
    checkout: 'checkout',
    cancel: 'cancel',
    update: 'update',
    stripeWebhook: 'stripe/webhook',
    listInvoices: 'invoices',
    downloadInvoice: 'invoices/download/:invoiceId',
  },

  [ControllersEnum.Subscriptions]: {
    updatePlan: ':companyId/update-plan',
  },
};

export const APIInfo = {
  [ControllersEnum.Auth]: {
    register: {
      method: 'POST',
      description: 'Registers a new user with email and password',
    },
    registerFacebook: {
      method: 'POST',
      description: 'Registers a new user with Facebook credentials',
    },
    registerGoogle: {
      method: 'POST',
      description: 'Registers a new user with Google credentials',
    },
    login: {
      method: 'POST',
      description: 'Logs in a user with email and password',
    },
    loginFacebook: {
      method: 'POST',
      description: 'Logs in a user using Facebook credentials',
    },
    loginGoogle: {
      method: 'POST',
      description: 'Logs in a user using Google credentials',
    },
    socialRedirect: {
      method: 'GET',
      description: 'Redirect for social login OAuth flow',
    },
    socialLogin: {
      method: 'POST',
      description: 'Logs in a user via social login OAuth flow',
    },
    logout: {
      method: 'POST',
      description: 'Logs out the current user',
    },
    refreshJwtToken: {
      method: 'POST',
      description: 'Refreshes the JWT token for authentication',
    },
    verifyEmail: {
      method: 'POST',
      description: "Verifies a user's email address",
    },
    resetPassword: {
      method: 'POST',
      description: "Resets the user's password using a reset token",
    },
    requestEmailVerification: {
      method: 'POST',
      description: "Sends a request to verify a user's email address",
    },
    changePasswordRequest: {
      method: 'POST',
      description: 'Requests a password change for the user',
    },
    resetPasswordSendCode: {
      method: 'POST',
      description: 'Sends a reset code for password reset',
    },
    myProfile: {
      method: 'GET',
      description: "Gets the current user's profile information",
    },
    myProfileUpdate: {
      method: 'PATCH',
      description: "Updates the current user's profile",
    },
    myProfileUpdateAvatar: {
      method: 'PATCH',
      description: "Updates the current user's profile avatar",
    },
  },

  [ControllersEnum.Roles]: {
    list: {
      method: 'GET',
      description: 'Lists all available roles',
    },
  },

  [ControllersEnum.Stores]: {
    create: {
      method: 'POST',
      description: 'Creates a new project',
    },
    list: {
      method: 'GET',
      description: 'Lists all projects',
    },
    single: {
      method: 'GET',
      description: 'Gets details of a single project by ID',
      params: ['id'],
    },
    update: {
      method: 'PUT',
      description: 'Updates an existing project by ID',
      params: ['id'],
    },
    updateHome: {
      method: 'PUT',
      description: 'Updates the home configuration for a project by ID',
      params: ['id'],
    },
    updateSubdomain: {
      method: 'PUT',
      description: 'Updates the subdomain for a project by ID',
      params: ['id'],
    },
    subdomainBucketDetails: {
      method: 'GET',
      description: 'Gets the bucket details for a subdomain',
      params: ['name'],
    },
    hostBucketDetails: {
      method: 'GET',
      description: 'Gets the bucket details',
    },
    files: {
      method: 'GET',
      description: 'Fetches files in a specific directory of a project',
      params: ['id', 'directory'],
    },
    search: {
      method: 'GET',
      description: 'Searches for projects based on text',
      params: ['text'],
    },
    verifyDNS: {
      method: 'POST',
      description: 'Verifies DNS settings for a project',
    },
    addCustomDomain: {
      method: 'POST',
      description: 'Adds a custom domain to a project',
    },
    getDnsRecord: {
      method: 'GET',
      description: 'Fetches DNS records for the project',
    },
    availableSubdomain: {
      method: 'GET',
      description: 'Checks if a subdomain is available',
      params: ['name'],
    },
    rootHtmlFiles: {
      method: 'GET',
      description: 'Gets root HTML files of a project by ID',
      params: ['id'],
    },
    generateThumbnails: {
      method: 'POST',
      description: 'Generates thumbnails for a project',
      params: ['id'],
    },
  },

  [ControllersEnum.Domain]: {
    subdomainBucketDetails: {
      method: 'GET',
      description: 'Gets bucket details for a subdomain',
      params: ['name'],
    },
    verifyTXTRecord: {
      method: 'GET',
      description: 'Verify txt record',
      params: ['name'],
    },
    availableSubdomain: {
      method: 'GET',
      description: 'Checks if a subdomain is available',
      params: ['name'],
    },
    hostBucketDetails: {
      method: 'GET',
      description: 'Gets the bucket details',
    },
    addCustomDomain: {
      method: 'POST',
      description: 'Adds a custom domain',
    },
    removeCustomDomain: {
      method: 'POST',
      description: 'removes a custom domain',
    },
    verifyDNS: {
      method: 'POST',
      description: 'Verifies DNS settings',
    },
    getDnsRecord: {
      method: 'GET',
      description: 'Fetches DNS records',
    },
  },

  [ControllersEnum.FileManager]: {
    upload: {
      method: 'POST',
      description: 'Uploads files to the server',
    },
    get: {
      method: 'GET',
      description: 'Fetches files from the server',
    },
    regenerateURL: {
      method: 'POST',
      description: 'Regenerates file URLs',
    },
    clone: {
      method: 'POST',
      description: 'Clones a file',
    },
    export: {
      method: 'POST',
      description: 'Exports a file',
    },
    edit: {
      method: 'PATCH',
      description: 'Edits a file',
    },
    updatePrivacy: {
      method: 'PATCH',
      description: 'Updates file privacy settings',
    },
    save: {
      method: 'POST',
      description: 'Saves a file',
    },
    delete: {
      method: 'DELETE',
      description: 'Deletes a file',
    },
  },

  [ControllersEnum.Otps]: {
    send: {
      method: 'POST',
      description: 'Sends a one-time password (OTP)',
    },
    verify: {
      method: 'POST',
      description: 'Verifies an OTP',
    },
    verifyTwoStepAuth: {
      method: 'POST',
      description: 'Verifies two-step authentication',
    },
    resendTwoStepAuth: {
      method: 'POST',
      description: 'Resends two-step authentication',
    },
    verifyEmailVerificationLink: {
      method: 'POST',
      description: 'Verifies email verification link',
    },
    resendEmailVerificationLink: {
      method: 'POST',
      description: 'Resends email verification link',
    },
  },

  [ControllersEnum.Payments]: {
    prices: {
      method: 'GET',
      description: 'Fetches available prices',
    },
    current: {
      method: 'GET',
      description: 'Fetches current subscription or payment status',
    },
    intent: {
      method: 'POST',
      description: 'Creates a payment intent',
    },
    session: {
      method: 'POST',
      description: 'Creates a payment session',
    },
    checkout: {
      method: 'POST',
      description: 'Performs a checkout action',
    },
    cancel: {
      method: 'POST',
      description: 'Cancels an ongoing payment or subscription',
    },
    update: {
      method: 'PATCH',
      description: 'Updates payment or subscription details',
    },
    stripeWebhook: {
      method: 'POST',
      description: 'Handles Stripe webhook events',
    },
    listInvoices: {
      method: 'GET',
      description: 'Lists all invoices',
    },
    downloadInvoice: {
      method: 'GET',
      description: 'Downloads an invoice',
      params: ['invoiceId'],
    },
  },

  [ControllersEnum.Subscriptions]: {
    updatePlan: {
      method: 'PATCH',
      description: 'Updates the subscription plan for a company',
      params: ['companyId'],
    },
  },
};
