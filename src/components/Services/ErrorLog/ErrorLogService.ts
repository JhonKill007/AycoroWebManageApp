import {
  ErrorLogExportQuery,
  ErrorLogQuery,
  ErrorLogResponse,
} from "../../Models/ErrorLog/ErrorLogModel";
import Http from "../Http/HttpClient";

export class ErrorLogService {
  async getAll(query: ErrorLogQuery): Promise<ErrorLogResponse> {
    const params = new URLSearchParams({
      page: String(query.page),
      limit: String(query.limit || 12),
      search: query.search || "",
      groupBy: query.groupBy || "day",
    });

    if (query.level && query.level !== "todos") {
      params.append("level", query.level);
    }

    if (query.source && query.source !== "todos") {
      params.append("source", query.source);
    }

    if (query.platform && query.platform !== "todos") {
      params.append("platform", query.platform);
    }

    if (query.status && query.status !== "todos") {
      params.append("status", query.status);
    }

    const response = await Http.get<ErrorLogResponse>(
      `/api/logs?${params.toString()}`,
    );
    return response.data;
  }

  async resolve(id: string): Promise<void> {
    await Http.put(`/api/logs/${id}/resolve`);
  }

  async export(query: ErrorLogExportQuery): Promise<Blob> {
    const params = new URLSearchParams({
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      format: query.format,
      search: query.search || "",
    });

    if (query.level && query.level !== "todos") {
      params.append("level", query.level);
    }

    if (query.source && query.source !== "todos") {
      params.append("source", query.source);
    }

    if (query.platform && query.platform !== "todos") {
      params.append("platform", query.platform);
    }

    if (query.status && query.status !== "todos") {
      params.append("status", query.status);
    }

    try {
      const response = await Http.get<Blob>(
        `/api/logs/export?${params.toString()}`,
        { responseType: "blob" },
      );
      return response.data;
    } catch (error: any) {
      const payload = error.response?.data;
      let message = "No se pudo exportar los registros.";

      if (payload instanceof Blob) {
        try {
          const body = JSON.parse(await payload.text());
          message = body.details || body.message || message;
        } catch {
          // La respuesta no contiene un error JSON legible.
        }
      } else if (payload?.details || payload?.message) {
        message = payload.details || payload.message;
      }

      if (message === "No error logs were found in the selected date range") {
        message = "No hay registros en el rango y filtros seleccionados.";
      }

      throw new Error(message);
    }
  }
}

const errorLogService = new ErrorLogService();
export default errorLogService;
