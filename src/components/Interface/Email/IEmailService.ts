
export interface IEmailService {
  SendEmailToRestorePassword(email: string, lenguage: string): Promise<any>;
  SendEmailToValidateEmail(lenguage: string): Promise<any>;
}
