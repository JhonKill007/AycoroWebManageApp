import { IServiceService } from "../../Interface/Service/IServiceService";
import { ServiceParams } from "../../Models/Service/ServiceParams";
import Http from "../Http/HttpClient";

export class ServiceService implements IServiceService {
  async Create(model: ServiceParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post("/api/service", model)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async GetById(id: string): Promise<any> {
    const result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/service/${id}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async GetServiceTypes(): Promise<any> {
    const result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Service/ServicesType`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async GetServices(section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Service?section=${section}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async Search(
    keywords: string,
    section: number,
    options?: {
      type?: string;
      category?: string;
      activity?: string;
      minScore?: number;
    }
  ): Promise<any> {
    const params = new URLSearchParams({
      keywords,
      section: section.toString(),
    });

    if (options?.type) params.append("type", options.type);
    if (options?.category) params.append("category", options.category);
    if (options?.activity) params.append("activity", options.activity);
    if (options?.minScore !== undefined)
      params.append("minScore", options.minScore.toString());

    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Service/SearchServices?${params.toString()}`)
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

const serviceService = new ServiceService();
export default serviceService;
