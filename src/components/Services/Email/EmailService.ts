import { IEmailService } from "../../Interface/Email/IEmailService";
import Http from "../Http/HttpClient";

export class EmailService implements IEmailService {
  async SendEmailToRestorePassword(
    email: string,
    lenguage: string
  ): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Email/RestorePassword?email=${email}&lenguage=${lenguage}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async SendEmailToValidateEmail(lenguage: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Email/ValidateEmail?lenguage=${lenguage}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
}

const emailService = new EmailService();
export default emailService;
