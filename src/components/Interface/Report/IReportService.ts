
export interface IReportService {
  getAll(
    page: number,
    search: string,
    filters?: {
      status?: number | "todos";
      type?: string;
      priority?: string;
      sortBy?: string;
    },
  ): Promise<any>;
  updateStatus(id: string, status: number): Promise<any>;
  deleteReportedItem(id: string): Promise<any>;
  banReportedUser(id: string): Promise<any>;
}
