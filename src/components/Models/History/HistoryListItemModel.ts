import { HistoryModel } from './HistoryModel';
export class HistoryListItemModel{
    public idUser: string | undefined;
    public username: string | undefined;
    public idMediaDataProfile: string | undefined;
    public profilePhoto: string | undefined;
    public verify: number | undefined;
    public historysData: HistoryModel[] | undefined;
}