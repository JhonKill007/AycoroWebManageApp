import { IAdminComentService } from "../../Interface/Coments/IAdminComentService";
import Http from "../Http/HttpClient";

export class AdminComentService implements IAdminComentService {
  async GetAll(page: number, search: string, status?: number): Promise<any> {
    const statusQuery =
      status !== undefined && status !== null ? `&status=${status}` : "";
    return Http.get(
      `/api/coment/all?page=${page}&search=${encodeURIComponent(search || "")}${statusQuery}`,
    );
  }

  async UpdateStatus(id: string, status: number): Promise<any> {
    return Http.put("/api/coment/status", { id, status });
  }
}

const adminComentService = new AdminComentService();
export default adminComentService;
