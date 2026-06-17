import { ISearchService } from "../../Interface/Search/ISearchService";
import Http from "../Http/HttpClient";

export class SearchService implements ISearchService {
  async Create(keyword: string, type: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/Search?keyword=${keyword}&type=${type}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async Delete(value: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.delete(`/api/Search?value=${value}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async GetHistorical(type: string, section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(
        `/api/Search/GetHistoricalSearch?type=${type}&section=${section}`
      )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async GetSimilar(
    keyword: string,
    type: string,
    section: number
  ): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(
        `/api/Search/GetSimilarSearch?keyword=${keyword}&type=${type}&section=${section}`
      )
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

const searchService = new SearchService();
export default searchService;
