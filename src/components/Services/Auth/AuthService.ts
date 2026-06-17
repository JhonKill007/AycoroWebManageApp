import { IAuthService } from "../../Interface/Auth/IAuthService";
import Http from "../Http/HttpClient";

export class AuthService implements IAuthService {
  async Authenticate(authcode: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/auth`, {
        authcode,
      })
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

const authService = new AuthService();
export default authService;
