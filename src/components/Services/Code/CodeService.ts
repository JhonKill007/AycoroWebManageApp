import { ICodeService } from "../../Interface/Code/ICodeService";
import Http from "../Http/HttpClient";

export class CodeService implements ICodeService {
  async ValidateCodeFromRestorePassword(
    code: string,
    email: string
  ): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/Code/VerifyCodeResporePass?email=${email}&code=${code}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async ValidateCodeFromValidateEmail(code: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/Code/VerifyCodeValidateEmail?code=${code}`)
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

const codeService = new CodeService();
export default codeService;
