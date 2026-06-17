import { useCallback } from "react";

interface EditedMedia {
  id: string;
  file: File;
  type: "image" | "video";
  url: string;
  previewUrl: string;
  caption: string;
  filter: string;
  crop: CropData;
  zoom: number;
  startTime?: number;
  endTime?: number;
  duration?: number;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: string;
}

export const useMediaProcessing = () => {
  const getVideoDuration = useCallback((url: string): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        resolve(video.duration);
      });
    });
  }, []);

  const processFile = useCallback(
    async (file: File): Promise<EditedMedia> => {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith("image/") ? "image" : "video";

      let duration = 0;
      if (type === "video") {
        duration = await getVideoDuration(url);
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type,
        url,
        previewUrl: url,
        caption: "",
        filter: "normal",
        crop: { x: 0, y: 0, width: 100, height: 100 },
        zoom: 1,
        duration,
        startTime: 0,
        endTime: duration,
      };
    },
    [getVideoDuration]
  );

  return { processFile };
};
