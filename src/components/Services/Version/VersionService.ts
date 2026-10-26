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

  async getById(id: string): Promise<any> {
    return Http.get(`/api/version/${id}`);
  }

  async getCompatibleOptions(type: string, id?: string): Promise<any> {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (id) params.set("id", id);
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/version/compatible-options?${params.toString()}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async updateCompatibleVersions(
    id: string,
    compatibleVersions: string[],
  ): Promise<any> {
    return Http.put(`/api/version/${encodeURIComponent(id)}/compatible`, {
      CompatibleVersions: compatibleVersions,
    });
  }

  async publish(id: string): Promise<any> {
    return Http.post(`/api/version/${encodeURIComponent(id)}/publish`);
  }

  async addStories(
    id: string,
    releaseMedia: VersionParams["ReleaseMedia"],
  ): Promise<any> {
    return Http.post(`/api/version/${encodeURIComponent(id)}/stories`, {
      ReleaseMedia: releaseMedia || [],
    });
  }
}

const versionService = new VersionService();
export default versionService;
