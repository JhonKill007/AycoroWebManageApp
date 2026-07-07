import {
  SessionLogQuery,
  SessionLogResponse,
} from "../../Models/SessionLog/SessionLogModel";
import Http from "../Http/HttpClient";

export class SessionLogService {
  async getAll(query: SessionLogQuery): Promise<SessionLogResponse> {
    const params = new URLSearchParams({
      page: String(query.page),
      limit: String(query.limit || 14),
      search: query.search || "",
    });

    if (query.deviceOS && query.deviceOS !== "todos") {
      params.append("deviceOS", query.deviceOS);
    }

    if (query.country && query.country !== "todos") {
      params.append("country", query.country);
    }

    if (query.appVersion && query.appVersion !== "todos") {
      params.append("appVersion", query.appVersion);
    }

    const response = await Http.get<SessionLogResponse>(
      `/api/session-logs?${params.toString()}`,
    );
    return response.data;
  }
}

const sessionLogService = new SessionLogService();
export default sessionLogService;
