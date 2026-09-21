export interface AuthSessionUser {
  _id: string;
  Name?: string;
  Username?: string;
  Email?: string;
}

export interface NotificationSessionModel {
  _id: string;
  IdUser?: string;
  DeviceToken?: string;
  DeviceOS?: string | null;
  Type?: string;
  Status?: number;
  Language?: string;
  TimezoneOffsetMinutes?: number | null;
  IdLocation?: string;
  IP?: string;
  City?: string;
  Country?: string;
  CreateDate?: string;
  TimeDiffMs?: number;
  IsActive?: boolean;
  MatchSource?: "ACTIVE" | "LAST_REGISTERED";
}

export interface AuthSessionModel {
  _id: string;
  UserId?: string;
  TokenId?: string;
  DeviceId?: string;
  DeviceModel?: string;
  DeviceOS?: string;
  AppVersion?: string;
  Ip?: string;
  Country?: string;
  City?: string;
  IsRevoked?: boolean;
  IsActive?: boolean;
  CreatedAt?: string;
  ExpiresAt?: string;
  RefreshTokenExpiresAt?: string | null;
  RevokedAt?: string | null;
  User?: AuthSessionUser | null;
  NotificationSession?: NotificationSessionModel | null;
}

export interface AuthSessionListResponse {
  data: AuthSessionModel[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    active: number;
    filtered: number;
  };
  filters: {
    deviceOS: string[];
    countries: string[];
  };
}

export interface AuthSessionStats {
  active: number;
  total: number;
}

export interface AuthSessionQuery {
  page: number;
  limit?: number;
  search?: string;
  deviceOS?: string;
  country?: string;
  status?: "active" | "revoked" | "expired" | "all";
}
