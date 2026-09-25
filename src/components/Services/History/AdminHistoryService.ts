import { IAdminHistoryService } from "../../Interface/History/IAdminHistoryService";
import Http from "../Http/HttpClient";

export class AdminHistoryService implements IAdminHistoryService {
  async GetAll(
    page: number,
    search: string,
    status?: number,
    idUser?: string,
  ): Promise<any> {
    const params = new URLSearchParams({
      page: String(page),
      search: search || "",
    });
    if (status !== undefined && status !== null) {
      params.append("status", String(status));
    }
    if (idUser) {
      params.append("idUser", idUser);
    }
    return Http.get(`/api/history/all?${params.toString()}`);
  }

  async GetViews(id: string, page: number = 1): Promise<any> {
    return Http.get(`/api/history/${id}/views?page=${page}`);
  }

  async GetLikes(id: string, page: number = 1): Promise<any> {
    return Http.get(`/api/history/${id}/likes?page=${page}`);
  }

  async GetById(id: string): Promise<any> {
    return Http.get(`/api/history/${id}`);
  }

  async UpdateStatus(id: string, status: number): Promise<any> {
    return Http.put("/api/history/status", { id, status });
  }
}

const adminHistoryService = new AdminHistoryService();
export default adminHistoryService;
