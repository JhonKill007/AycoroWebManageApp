import { ManagerParams } from "../../Models/Manager/ManagerParams";

export interface IManagerService {
  create(model: ManagerParams): Promise<any>;
  getAll(page: number, search: string): Promise<any>;
}
