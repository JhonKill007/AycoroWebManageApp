import { IAdminHistoryService } from "../../Interface/History/IAdminHistoryService";
import Http from "../Http/HttpClient";

export class AdminHistoryService implements IAdminHistoryService {
  async GetAll(page: number, search: string, status?: number): Promise<any> {
    const statusQuery =
      status !== undefined && status !== null ? `&status=${status}` : "";
    return Http.get(
      `/api/history/all?page=${page}&search=${encodeURIComponent(search || "")}${statusQuery}`,
    );
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
