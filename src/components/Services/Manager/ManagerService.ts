import { IManagerService } from "../../Interface/Manager/IManagerService";
import { ManagerParams } from "../../Models/Manager/ManagerParams";
import { RoleParams } from "../../Models/Role/RoleParams";
import Http from "../Http/HttpClient";

export class ManagerService implements IManagerService {
  async create(model: ManagerParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/manager/create`, model)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async update(model: ManagerParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/manager/update`, model)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async updateStatus(model: RoleParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/manager/status`, model)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async delete(id: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.delete(`/api/manager/delete/${id}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async getAll(page: number, search: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/manager/all?page=${page}&search=${search}`)
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
const managerService = new ManagerService();
export default managerService;
