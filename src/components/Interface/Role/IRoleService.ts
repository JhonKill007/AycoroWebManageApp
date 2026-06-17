import { RoleParams } from "../../Models/Role/RoleParams";

export interface IRoleService {
  create(model: RoleParams): Promise<any>;
  update(model: RoleParams): Promise<any>;
  updateStatus(model: RoleParams): Promise<any>;
  delete(id: string): Promise<any>;
  find(id: string): Promise<any>;
  getAll(page: number, search: string): Promise<any>;
}
