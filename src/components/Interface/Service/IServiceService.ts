import { ServiceParams } from "../../Models/Service/ServiceParams";

export interface IServiceService {
  Create(model: ServiceParams): Promise<any>;
  GetById(id: string): Promise<any>;
  GetServices(section: number): Promise<any>;
  Search(
    keywords: string,
    section: number,
    options?: {
      type?: string;
      category?: string;
      activity?: string;
      minScore?: number;
    }
  ): Promise<any>;
  GetServiceTypes(): Promise<any>;
}
