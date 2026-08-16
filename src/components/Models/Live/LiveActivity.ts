export type LiveActivity = {
  id: string;
  username: string;
  profilePhoto?: string;
  action: string;
  message: string;
  targetType: "post" | "user" | "history" | string;
  targetId?: string;
  targetImage?: string;
  targetUsername?: string;
  mediaType?: string;
  createDate?: string;
};

export const normalizeLiveActivity = (raw: any): LiveActivity => ({
  id: raw?.id ?? raw?.Id ?? `${Date.now()}-${Math.random()}`,
  username: raw?.username ?? raw?.Username ?? "",
  profilePhoto: raw?.profilePhoto ?? raw?.ProfilePhoto ?? "",
  action: raw?.action ?? raw?.Action ?? "",
  message: raw?.message ?? raw?.Message ?? "",
  targetType: raw?.targetType ?? raw?.TargetType ?? "post",
  targetId: raw?.targetId ?? raw?.TargetId ?? "",
  targetImage: raw?.targetImage ?? raw?.TargetImage ?? "",
  targetUsername: raw?.targetUsername ?? raw?.TargetUsername ?? "",
  mediaType: raw?.mediaType ?? raw?.MediaType ?? "",
  createDate: raw?.createDate ?? raw?.CreateDate,
});
