export type BlockedEmailDomainModel = {
  id: string;
  domain: string;
  isActive: boolean;
  reason: string;
  includeSubdomains: boolean;
  createDate: string;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export type UpsertBlockedEmailDomainParams = {
  domain: string;
  reason: string;
  includeSubdomains: boolean;
  isActive: boolean;
};
