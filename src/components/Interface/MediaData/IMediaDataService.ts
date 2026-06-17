import { MediaDataParams } from "../../Models/MediaData/MediaDataParams";

export interface IMediaDataService {
  Create(model: MediaDataParams): Promise<any>;
  GetById(id: string): Promise<any>;
}
