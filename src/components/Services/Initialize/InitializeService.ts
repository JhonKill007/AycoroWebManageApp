import { IInitializeService } from "../../Interface/Initialize/IInitializeService";
import Http from "../Http/HttpClient";

export class InitializeService implements IInitializeService {
  async initialize(idUser: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/initialize/${idUser}`)
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

const initializeService = new InitializeService();
export default initializeService;
