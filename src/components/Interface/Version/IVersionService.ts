import { VersionParams } from "../../Models/Version/VersionParams";

export interface IVersionService {
  create(model: VersionParams): Promise<any>;
  updateStatus(model: VersionParams): Promise<any>;
  getAll(page: number, search: string): Promise<any>;
  getCompatibleOptions(type: string): Promise<any>;
  publish(id: string): Promise<any>;
}
