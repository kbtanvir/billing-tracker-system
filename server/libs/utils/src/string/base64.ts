export const Base64Encode = (str: string): string =>
  Buffer.from(str).toString('base64');

export const Base64Decode = (str: string): string =>
  Buffer.from(str, 'base64').toString();
