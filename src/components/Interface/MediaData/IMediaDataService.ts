import { MediaDataParams } from "../../Models/MediaData/MediaDataParams";
import { UploadRequest } from "../../Models/MediaData/UploadRequest";

export interface IMediaDataService {
  Create(model: MediaDataParams): Promise<any>;
  GetById(id: string): Promise<any>;
  GetUploadUrl(model: UploadRequest): Promise<any>;
}
