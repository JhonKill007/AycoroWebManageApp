import Http from "../Http/HttpClient";
import { IHistorySevice } from "./../../Interface/History/IHistoryService";

export class HistoryService implements IHistorySevice {
  async Create(MediaDataValue: string): Promise<any> {
    const history = {
      IdUser: undefined,
      MediaDataValue: MediaDataValue,
    };
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/History`, history)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetHistoryList(section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/History?section=${section}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetById(id: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/History/GetById?idHistory=${id}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetMyHistorys(): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`api/History/GetMyHistorys`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetHistorysByUser(id: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`api/History/GetHistorysByUser/${id}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async SetViewHistory(idhistory: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(
        `/api/History/ViewHistory?IdHistory=${idhistory}`
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

async Delete(id: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.delete(`/api/History?idHistory=${id}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetUserHistorysViewers(id: string, section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/History/Viewers?IdHistory=${id}&section=${section}`)
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

const historyService = new HistoryService();
export default historyService;
