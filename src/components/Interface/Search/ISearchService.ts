export interface ISearchService {
  Create(keyword: string, type: string): Promise<any>;
  Delete(value: string): Promise<any>;
  GetHistorical(type: string, section: number): Promise<any>;
  GetSimilar(keyword: string, type:string, section: number): Promise<any>;
}
