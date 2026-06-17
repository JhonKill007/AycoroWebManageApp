import { ISessionService } from "../../Interface/Session/ISessionService";
import { SessionModel } from "../../Models/Session/SessionModel";
import Http from "../Http/HttpClient";

export class SessionService implements ISessionService {
  async Create(model: SessionModel): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/Session`, model)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async Delete(token: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.delete(`/api/Session?token=${token}`)
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

const sessionService = new SessionService();
export default sessionService;
