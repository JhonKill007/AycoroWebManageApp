import { RestoreModel } from "../../Models/res/RestoreModel";

export interface IRestoreService {
  RestorePassword(restore: RestoreModel): Promise<any>;
}
