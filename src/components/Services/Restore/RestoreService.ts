import { IRestoreService } from "../../Interface/Restore/IRestoreService";
import { RestoreModel } from "../../Models/res/RestoreModel";
import Http from "../Http/HttpClient";

export class RestoreService implements IRestoreService {
  async RestorePassword(restore: RestoreModel): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/RestorePassword/Restore`, restore)
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

const restoreService = new RestoreService();
export default restoreService;
