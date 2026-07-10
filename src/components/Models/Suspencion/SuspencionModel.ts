export interface SuspencionModel {
  _id: string;
  IdUser: string;
  Username: string;
  SuspensionDate?: string;
  EndDate?: string;
  Reason?: string;
  CreateDate?: string;
}

export interface SuspencionResponse {
  data: SuspencionModel[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalSuspensions: number;
    activeSuspensions: number;
  };
  groups: {
    reasons: Array<{ key: string; count: number }>;
  };
}

export interface SuspencionQuery {
  page: number;
  limit?: number;
  search?: string;
}
