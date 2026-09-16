import axios from "axios";
import { IMediaDataService } from "../../Interface/MediaData/IMediaDataService";
import { MediaDataParams } from "../../Models/MediaData/MediaDataParams";
import { UploadRequest } from "../../Models/MediaData/UploadRequest";
import Http from "../Http/HttpClient";

const createWebApiClient = () => {
  const client = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const token =
    localStorage.getItem("systemToken") ||
    localStorage.getItem("aycoroAuthToken");
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
  return client;
};

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
    const client = createWebApiClient();
    return client.post(`/api/MediaData/Upload`, model);
  }
}

const mediaDataService = new MediaDataService();
export default mediaDataService;
