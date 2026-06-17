export interface IUserService {
  GetUser(page: number, search: string, status: number): Promise<any>;
  SuspendUser(id: string): Promise<any>;
  BannedUser(id: string): Promise<any>;
  ReactiveUser(id: string): Promise<any>;
  UnBannedUser(id: string): Promise<any>;
  SearchUser(key: string, section: number): Promise<any>;
}
