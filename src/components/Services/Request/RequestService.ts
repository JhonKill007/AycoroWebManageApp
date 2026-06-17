import { IRequestService } from "../../Interface/Request/IRequestService";
import { RequestParams } from "../../Models/Request/RequestParams";
import Http from "../Http/HttpClient";

export class RequestService implements IRequestService {
  async getAll(
    page: number,
    search: string,
    status?: string,
    requestType?: string,
  ): Promise<any> {
    const params = new URLSearchParams({
      page: String(page),
      search,
    });

    if (status && status !== "todos") params.set("status", status);
    if (requestType && requestType !== "todos") params.set("requestType", requestType);

    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/request/all?${params.toString()}`)
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
      Http.get(`/api/request/${id}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async updateStatus(model: RequestParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/request/status`, model)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async reject(id: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/request/${id}/reject`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async apply(id: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/request/${id}/apply`)
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

const requestService = new RequestService();
export default requestService;
