export interface SessionLogUser {
  _id: string;
  Name?: string;
  Username?: string;
  Email?: string;
}

export interface SessionLogModel {
  _id: string;
  IdUser: string;
  DeviceOS?: string;
  AppVersion?: string;
  Country?: string;
  City?: string;
  Ip?: string;
  CreateDate?: string;
  User?: SessionLogUser | null;
}

export interface SessionLogResponse {
  data: SessionLogModel[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    totalSessions: number;
    uniqueUsers: number;
  };
  groups: {
    devices: Array<{ key: string; count: number }>;
    countries: Array<{ key: string; count: number }>;
  };
  filters: {
    deviceOS: string[];
    countries: string[];
    versions: string[];
  };
}

export interface SessionLogQuery {
  page: number;
  limit?: number;
  search?: string;
  deviceOS?: string;
  country?: string;
  appVersion?: string;
}

export interface SessionAccessAnalytics {
  days: number;
  totalSessions: number;
  uniqueUsers: number;
  averageSessionsPerUser: number;
  series: Array<{
    day: string;
    label: string;
    users: number;
    sessions: number;
  }>;
  topUsers: Array<{
    idUser: string;
    sessions: number;
    lastAccess?: string;
    user?: SessionLogUser | null;
  }>;
}
