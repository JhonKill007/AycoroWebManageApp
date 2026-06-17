import { DataResLogModel } from "../data/DataResLogModel";

export class resLogModel {
    public config: [any] | undefined;
    public data: DataResLogModel | undefined;
    public headers: [any] | undefined;
    public request: any | undefined;
    public status: number | undefined;
    public statusText: string | undefined;
}
