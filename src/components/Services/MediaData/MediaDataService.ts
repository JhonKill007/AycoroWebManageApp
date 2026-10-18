import { IMediaDataService } from "../../Interface/MediaData/IMediaDataService";
import { MediaDataParams } from "../../Models/MediaData/MediaDataParams";
import { UploadRequest } from "../../Models/MediaData/UploadRequest";
import { aycoroWebApi } from "../Http/aycoroWebApi";
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

  async GetUploadUrl(model: UploadRequest): Promise<any> {
    const token =
      localStorage.getItem("systemToken") ||
      localStorage.getItem("aycoroAuthToken");
    return aycoroWebApi.post(`/api/MediaData/Upload`, model, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  }
}

const mediaDataService = new MediaDataService();
export default mediaDataService;
