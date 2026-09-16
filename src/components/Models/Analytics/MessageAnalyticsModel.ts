export type MessageAnalyticsPeriod = 7 | 30 | 90 | "all";

export interface MessageAnalyticsUser {
  _id: string;
  Name?: string;
  Username?: string;
  Email?: string;
}

export interface MessageAnalytics {
  period: MessageAnalyticsPeriod;
  granularity: "day" | "month";
  totalMessages: number;
  uniqueUsers: number;
  averageMessagesPerUser: number;
  series: Array<{
    day: string;
    label: string;
    users: number;
    messages: number;
  }>;
  topUsers: Array<{
    idUser: string;
    messages: number;
    lastSent?: string;
    user?: MessageAnalyticsUser | null;
  }>;
}
