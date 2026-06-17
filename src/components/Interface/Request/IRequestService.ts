import { RequestParams } from "../../Models/Request/RequestParams";

export interface IRequestService {
  getAll(
    page: number,
    search: string,
    status?: string,
    requestType?: string,
  ): Promise<any>;
  find(id: string): Promise<any>;
  updateStatus(model: RequestParams): Promise<any>;
  reject(id: string): Promise<any>;
  apply(id: string): Promise<any>;
}
