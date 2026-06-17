import { StatusParams } from './../../Models/Status/StatusParams';


export interface IStatusService {
    ApplyStatusToActive(IdPost: string): Promise<any>
    ApplyStatusToDelete(IdPost: string): Promise<any>
    ApplyStatusToArchived(IdPost: string): Promise<any>
}