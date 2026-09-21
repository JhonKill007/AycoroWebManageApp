import {
  AuthSessionListResponse,
  AuthSessionModel,
  AuthSessionQuery,
  AuthSessionStats,
} from "../../Models/Session/AuthSessionModel";
import Http from "../Http/HttpClient";

export class AuthSessionService {
  async getStats(): Promise<AuthSessionStats> {
    const response = await Http.get<AuthSessionStats>(
      "/api/session-logs/auth-sessions/stats",
    );
    return response.data;
  }

  async getAll(query: AuthSessionQuery): Promise<AuthSessionListResponse> {
    const params = new URLSearchParams({
      page: String(query.page),
      limit: String(query.limit || 14),
      search: query.search || "",
      status: query.status || "active",
    });

    if (query.deviceOS && query.deviceOS !== "todos") {
      params.append("deviceOS", query.deviceOS);
    }

    if (query.country && query.country !== "todos") {
      params.append("country", query.country);
    }

    const response = await Http.get<AuthSessionListResponse>(
      `/api/session-logs/auth-sessions?${params.toString()}`,
    );
    return response.data;
  }

  async getById(id: string): Promise<AuthSessionModel> {
    const response = await Http.get<AuthSessionModel>(
      `/api/session-logs/auth-sessions/${id}`,
    );
    return response.data;
  }

  async activateNotificationSession(id: string): Promise<AuthSessionModel> {
    const response = await Http.put<AuthSessionModel>(
      `/api/session-logs/auth-sessions/${id}/notification-session/activate`,
    );
    return response.data;
  }
}

const authSessionService = new AuthSessionService();
export default authSessionService;
