import { IMediaDataService } from "../../Interface/MediaData/IMediaDataService";
import { MediaDataParams } from "../../Models/MediaData/MediaDataParams";
import Http from "../Http/HttpClient";

export class MediaDataService implements IMediaDataService {
  async Create(model: MediaDataParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/MediaData`, model)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async CreateProfile(model: MediaDataParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/mediadata/CreateProfile`, model)
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
    if (id) {
      let result = await new Promise<any>((resolve, reject) => {
        Http.get(`/api/mediadata?id=${id}`)
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
}

const mediaDataService = new MediaDataService();
export default mediaDataService;
