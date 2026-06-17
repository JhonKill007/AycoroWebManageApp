export interface INotificationService {
  GetAll(section: number): Promise<any>;
  GetUnreadNotificationCount(): Promise<any>;
  SetNotificationRead(): Promise<any>;
}
