export type UsageTimePeriod = 7 | 30 | 90;

export interface UsageTimeDayPoint {
  date: string;
  label: string;
  averageUsageSeconds: number;
  activeUsers: number;
  totalUsageSeconds: number;
}

export interface UsageTimeAnalytics {
  periodDays: UsageTimePeriod;
  averageUsageSeconds: number;
  activeUsers: number;
  activeUserDays: number;
  totalUsageSeconds: number;
  completedSessions: number;
  authenticatedUsageSessions: number;
  legacyUsageSessions: number;
  daily: UsageTimeDayPoint[];
}
