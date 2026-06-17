
import { INotificationService } from "../../Interface/Notificacion/INotificationService";
import Http from "../Http/HttpClient";

export class NotificationService implements INotificationService {
  async GetAll(section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Notification?section=${section}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetUnreadNotificationCount(): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Notification/GetUnreadNotificationCount`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async SetNotificationRead(): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Notification/NotifyRead`)
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

const notificationService = new NotificationService();
export default notificationService;
