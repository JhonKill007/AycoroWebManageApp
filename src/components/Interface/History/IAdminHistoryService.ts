export interface IAdminHistoryService {
  GetAll(page: number, search: string, status?: number): Promise<any>;
  GetById(id: string): Promise<any>;
  UpdateStatus(id: string, status: number): Promise<any>;
}
