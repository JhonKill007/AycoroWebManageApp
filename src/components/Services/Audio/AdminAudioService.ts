import { IAdminAudioService } from "../../Interface/Audio/IAdminAudioService";
import Http from "../Http/HttpClient";

export class AdminAudioService implements IAdminAudioService {
  async GetAll(page: number, search: string, status?: number): Promise<any> {
    const statusQuery =
      status !== undefined && status !== null ? `&status=${status}` : "";
    return Http.get(
      `/api/audio/all?page=${page}&search=${encodeURIComponent(search || "")}${statusQuery}`,
    );
  }

  async UpdateStatus(id: string, status: number): Promise<any> {
    return Http.put("/api/audio/status", { id, status });
  }
}

const adminAudioService = new AdminAudioService();
export default adminAudioService;
