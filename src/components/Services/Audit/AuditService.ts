import Http from "../Http/HttpClient";

export class AuditService {
  async getLogs(
    page: number,
    search: string,
    resource = "todos",
  ): Promise<any> {
    const params = new URLSearchParams({
      page: String(page),
      search,
    });
    if (resource && resource !== "todos") {
      params.append("resource", resource);
    }
    return Http.get(`/api/audit?${params.toString()}`);
  }
}

const auditService = new AuditService();
export default auditService;
