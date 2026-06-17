import { IStatusService } from "../../Interface/Status/IStatusService";
import Http from "../Http/HttpClient";

export class StatusService implements IStatusService{
    async ApplyStatusToDelete(IdPost:string): Promise<any> {
        let result = await new Promise<any>((resolve, reject) => {
            Http.put(`/api/StatusPost/ApplyStatusToDelete?idPost=${IdPost}`)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
        return result;
    }
    async ApplyStatusToArchived(IdPost:string): Promise<any> {
        let result = await new Promise<any>((resolve, reject) => {
            Http.put(`/api/StatusPost/ApplyStatusToAchived?idPost=${IdPost}`)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
        return result;
    }
    
    async ApplyStatusToActive(IdPost:string): Promise<any> {
        let result = await new Promise<any>((resolve, reject) => {
            Http.put(`/api/StatusPost/ApplyStatusToActive?idPost=${IdPost}`)
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

const statusService = new StatusService();
export default statusService;