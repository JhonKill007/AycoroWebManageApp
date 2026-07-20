import axios from "axios";
import { IVersionService } from "../../Interface/Version/IVersionService";
import { VersionParams } from "../../Models/Version/VersionParams";
import Http from "../Http/HttpClient";

export class VersionService implements IVersionService {
  async create(model: VersionParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/version/create`, model)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async updateStatus(model: VersionParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/version/status`, model)
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
      Http.get(`/api/version/all?page=${page}&search=${search}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async getCompatibleOptions(type: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/version/compatible-options?type=${encodeURIComponent(type)}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async publish(id: string): Promise<any> {
    const AycoroAuthSystem = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
    const token = localStorage.getItem("aycoroAuthToken");
    const response = await AycoroAuthSystem.put(`/api/Version/Publish`, null, {
      params: { id },
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
    return response;
  }
}

const versionService = new VersionService();
export default versionService;
