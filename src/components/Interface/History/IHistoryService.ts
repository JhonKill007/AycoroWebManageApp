export interface IHistorySevice {
  Create(MediaDataValue: string): Promise<any>;
  GetHistoryList(section: number): Promise<any>;
  GetById(id: string): Promise<any>;
  GetMyHistorys(): Promise<any>;
  GetHistorysByUser(id: string): Promise<any>;
  SetViewHistory(idhistory: string): Promise<any>;
  Delete(id: string): Promise<any>;
  GetUserHistorysViewers(id: string, section: number): Promise<any>;
}
