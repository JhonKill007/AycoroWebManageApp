export type ActivityPreview = {
  type: string;
  available: boolean;
  reason?: string;
  data?: Record<string, any> | null;
};

export type UserActivityItem = {
  id: string;
  action: string;
  createDate: string | Date;
  source?: string | null;
  outcome?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  dedupKey?: string | null;
  schemaVersion?: number | null;
  description: string;
  metadata?: Record<string, unknown> | null;
  preview?: ActivityPreview | null;
};

export type UserActivityHistoryResponse = {
  data: UserActivityItem[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export type UserActivityHistoryQuery = {
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  cursor?: string;
  limit?: number;
  source?: string;
};
