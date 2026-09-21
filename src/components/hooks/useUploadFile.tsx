import { MediaDataParams } from "../Models/MediaData/MediaDataParams";
import { UploadRequest } from "../Models/MediaData/UploadRequest";
import mediaDataService from "../Services/MediaData/MediaDataService";

type UploadMediaType = "image" | "audio" | "video";

const mimeMap: Record<UploadMediaType, string> = {
  image: "image/jpeg",
  audio: "audio/m4a",
  video: "video/mp4",
};

const normalizeUploadType = (type: string): UploadMediaType => {
  const normalized = `${type}`.toLowerCase();
  if (normalized === "video" || normalized.startsWith("video/")) return "video";
  if (normalized === "audio" || normalized.startsWith("audio/")) return "audio";
  return "image";
};

const getSignedContentType = (type: UploadMediaType, file?: File | Blob) => {
  const fileType = `${(file as File)?.type ?? ""}`.trim().toLowerCase();
  if (fileType) return fileType;
  return mimeMap[type];
};

export const useUploadFile = () => {
  const uploadMedia = async (
    file: File | Blob,
    type: string,
    extra?: {
      duration?: number;
      width?: number;
      height?: number;
    },
  ) => {
    const mediaType = normalizeUploadType(type);
    const contentType = getSignedContentType(mediaType, file);
    const uploadData = await getUploadUrl(
      file,
      mediaType,
      extra?.duration,
      contentType,
    );
    const payload = uploadData?.data ?? uploadData;
    const uploadUrl = payload.uploadUrl ?? payload.UploadUrl;
    const fileUrl = payload.fileUrl ?? payload.FileUrl;
    const key = payload.key ?? payload.Key;

    if (!uploadUrl || !fileUrl || !key) {
      throw new Error("Invalid upload URL response");
    }

    await uploadBinary(file, uploadUrl, contentType);

    const mediaModel: MediaDataParams = {
      url: fileUrl as string,
      key: key as string,
      type: mediaType,
      mimeType: contentType,
      size: file.size,
      duration: extra?.duration,
      width: extra?.width,
      height: extra?.height,
    };

    return mediaModel;
  };

  const getUploadUrl = async (
    file: File | Blob,
    type: UploadMediaType,
    duration?: number,
    contentType?: string,
  ) => {
    const request: UploadRequest = {
      type,
      contentType: contentType || getSignedContentType(type, file),
      size: file.size || 0,
      duration,
    };
    return mediaDataService.GetUploadUrl(request);
  };

  const uploadBinary = async (
    file: File | Blob,
    uploadUrl: string,
    contentType: string,
  ) => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: file,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`R2 upload failed: ${response.status} ${text}`);
    }
  };

  return { uploadMedia };
};
