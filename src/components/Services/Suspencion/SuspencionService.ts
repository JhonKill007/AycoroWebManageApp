import {
  SuspencionQuery,
  SuspencionResponse,
} from "../../Models/Suspencion/SuspencionModel";
import Http from "../Http/HttpClient";

export class SuspencionService {
  async getAll(query: SuspencionQuery): Promise<SuspencionResponse> {
    const params = new URLSearchParams({
      page: String(query.page),
      limit: String(query.limit || 14),
      search: query.search || "",
    });

    const response = await Http.get<SuspencionResponse>(
      `/api/suspenciones?${params.toString()}`,
    );
    return response.data;
  }
}

const suspencionService = new SuspencionService();
export default suspencionService;
