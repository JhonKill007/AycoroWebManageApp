import {
  BlockedEmailDomainModel,
  UpsertBlockedEmailDomainParams,
} from "../../Models/Security/BlockedEmailDomainModel";
import Http from "../Http/HttpClient";

const BASE = "/api/blocked-email-domains";

const asModel = (row: any): BlockedEmailDomainModel => ({
  id: String(row?.id || ""),
  domain: String(row?.domain || ""),
  isActive: !!row?.isActive,
  reason: String(row?.reason || ""),
  includeSubdomains: !!row?.includeSubdomains,
  createDate: String(row?.createDate || ""),
  updatedAt: row?.updatedAt || null,
  createdBy: row?.createdBy || null,
  updatedBy: row?.updatedBy || null,
});

export class BlockedEmailDomainService {
  async list(activeOnly = false): Promise<BlockedEmailDomainModel[]> {
    const response = await Http.get(BASE, {
      params: { activeOnly },
    });
    const rows = Array.isArray(response.data?.data) ? response.data.data : [];
    return rows.map(asModel);
  }

  async create(model: UpsertBlockedEmailDomainParams): Promise<BlockedEmailDomainModel> {
    const response = await Http.post(BASE, model);
    return asModel(response.data?.data);
  }

  async update(
    id: string,
    model: UpsertBlockedEmailDomainParams,
  ): Promise<BlockedEmailDomainModel> {
    const response = await Http.put(`${BASE}/${encodeURIComponent(id)}`, model);
    return asModel(response.data?.data);
  }

  async activate(id: string): Promise<BlockedEmailDomainModel> {
    const response = await Http.post(
      `${BASE}/${encodeURIComponent(id)}/activate`,
    );
    return asModel(response.data?.data);
  }

  async deactivate(id: string): Promise<BlockedEmailDomainModel> {
    const response = await Http.post(
      `${BASE}/${encodeURIComponent(id)}/deactivate`,
    );
    return asModel(response.data?.data);
  }
}

const blockedEmailDomainService = new BlockedEmailDomainService();
export default blockedEmailDomainService;
