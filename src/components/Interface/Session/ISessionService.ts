import { SessionModel } from "../../Models/Session/SessionModel";

export interface ISessionService {
  Create(model: SessionModel): Promise<any>;
  Delete(value: string): Promise<any>;
}
