import { IRoleService } from "../../Interface/Role/IRoleService";
import { RoleParams } from "../../Models/Role/RoleParams";
import Http from "../Http/HttpClient";

export class RoleService implements IRoleService {
  async create(model: RoleParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/role/create`, model)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async update(model: RoleParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/role/update`, model)
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
      Http.put(`/api/role/status`, model)
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
      Http.delete(`/api/role/delete/${id}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async find(id: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/role/${id}`)
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
      Http.get(`/api/role/all?page=${page}&search=${search}`)
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

const roleService = new RoleService();
export default roleService;
