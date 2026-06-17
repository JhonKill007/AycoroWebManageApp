import { IReportService } from "../../Interface/Report/IReportService";
import Http from "../Http/HttpClient";

export class ReportService implements IReportService {
  // async update(model: RoleParams): Promise<any> {
  //   let result = await new Promise<any>((resolve, reject) => {
  //     Http.put(`/api/role/update`, model)
  //       .then((res) => {
  //         resolve(res);
  //       })
  //       .catch((err) => {
  //         reject(err);
  //       });
  //   });
  //   return result;
  // }

  // async updateStatus(model: RoleParams): Promise<any> {
  //   let result = await new Promise<any>((resolve, reject) => {
  //     Http.put(`/api/role/status`, model)
  //       .then((res) => {
  //         resolve(res);
  //       })
  //       .catch((err) => {
  //         reject(err);
  //       });
  //   });
  //   return result;
  // }


  // async find(id: string): Promise<any> {
  //   let result = await new Promise<any>((resolve, reject) => {
  //     Http.get(`/api/role/${id}`)
  //       .then((res) => {
  //         resolve(res);
  //       })
  //       .catch((err) => {
  //         reject(err);
  //       });
  //   });
  //   return result;
  // }

  async getAll(
    page: number,
    search: string,
    filters?: {
      status?: number | "todos";
      type?: string;
      priority?: string;
      sortBy?: string;
    },
  ): Promise<any> {
    const params = new URLSearchParams({
      page: String(page),
      search,
    });

    if (filters?.status !== undefined && filters.status !== "todos") {
      params.append("status", String(filters.status));
    }

    if (filters?.type && filters.type !== "todos") {
      params.append("type", filters.type);
    }

    if (filters?.priority && filters.priority !== "todos") {
      params.append("priority", filters.priority);
    }

    if (filters?.sortBy) {
      params.append("sortBy", filters.sortBy);
    }

    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/report/all?${params.toString()}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async updateStatus(id: string, status: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/report/status`, { id, status })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async deleteReportedItem(id: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/report/${id}/delete-item`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async banReportedUser(id: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/report/${id}/ban-user`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
}

const reportService = new ReportService();
export default reportService;
