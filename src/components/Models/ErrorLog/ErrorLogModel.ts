export interface ErrorLogModel {
  _id: string;
  IdUser?: string;
  Level?: string;
  Source?: string;
  Message: string;
  Stack?: string;
  Screen?: string;
  Action?: string;
  Endpoint?: string;
  Method?: string;
  StatusCode?: number;
  AppVersion?: string;
  Platform?: string;
  DeviceModel?: string;
  OsVersion?: string;
  Extra?: string;
  Breadcrumbs?: string[];
  Status?: number;
  CreateDate?: string;
  ResolvedDate?: string | null;
}

export interface ErrorLogGroup {
  key: string | number;
  count: number;
  errors: number;
  warnings: number;
  latest?: string;
}

export interface ErrorLogResponse {
  data: ErrorLogModel[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    total: number;
    errors: number;
    warnings: number;
    unresolved: number;
    resolved: number;
  };
  groups: ErrorLogGroup[];
  filters: {
    levels: string[];
    sources: string[];
    platforms: string[];
  };
}

export interface ErrorLogQuery {
  page: number;
  limit?: number;
  search?: string;
  level?: string;
  source?: string;
  platform?: string;
  status?: string;
  groupBy?: string;
}

export interface ErrorLogExportQuery {
  dateFrom: string;
  dateTo: string;
  format: "json" | "csv";
  search?: string;
  level?: string;
  source?: string;
  platform?: string;
  status?: string;
}
