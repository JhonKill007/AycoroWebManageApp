import imageCompression from "browser-image-compression";
import { useCallback, useRef, useState } from "react";
import { ReactCropperElement } from "react-cropper";
import useLanguage from "./useLanguage";

interface Filter {
  name: string;
  label: string;
  value: string;
}

export const useCropperManager = () => {
  const { getLabel } = useLanguage();
  const cropperRef = useRef<ReactCropperElement>(null);
  const [cropper, setCropper] = useState<Cropper>();
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number>(0);
  const [cropPreviewData, setCropPreviewData] = useState("#");

  const filters: Filter[] = [
    { name: "normal", label: getLabel("normal"), value: "none" },
    {
      name: "clarendon",
      label: getLabel("clarendon"),
      value: "contrast(1.2) saturate(1.2)",
    },
    {
      name: "gingham",
      label: getLabel("gingham"),
      value: "sepia(0.3) hue-rotate(-10deg)",
    },
    { name: "moon", label: "Luna", value: "grayscale(1) brightness(1.1)" },
    {
      name: "lark",
      label: getLabel("alondra"),
      value: "contrast(0.9) brightness(1.1) saturate(1.1)",
    },
    {
      name: "reyes",
      label: getLabel("reyes"),
      value: "contrast(0.8) brightness(1.2) sepia(0.2)",
    },
    {
      name: "juno",
      label: getLabel("juno"),
      value: "contrast(1.1) saturate(1.4) hue-rotate(-10deg)",
    },
    {
      name: "slumber",
      label: getLabel("suave"),
      value: "contrast(0.9) brightness(0.9) saturate(0.8)",
    },
    {
      name: "crema",
      label: getLabel("crema"),
      value: "contrast(0.9) brightness(1.1) sepia(0.1)",
    },
    {
      name: "ludwig",
      label: getLabel("ludwig"),
      value: "contrast(1.1) brightness(0.9)",
    },
  ];

  const applyCropperCrop = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      if (cropper) {
        const canvas = cropper.getCroppedCanvas();
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          }
        });
      }
    });
  }, [cropper]);

  const applyFilterToCropperImage = useCallback(
    async (filterName: string): Promise<string> => {
      return new Promise((resolve) => {
        if (cropperRef.current?.cropper) {
          const cropperInstance = cropperRef.current.cropper;
          const canvas = cropperInstance.getCroppedCanvas();
          const filteredCanvas = document.createElement("canvas");
          const ctx = filteredCanvas.getContext("2d");

          if (!ctx) {
            resolve("");
            return;
          }

          filteredCanvas.width = canvas.width;
          filteredCanvas.height = canvas.height;

          const filterObj = filters.find((f) => f.name === filterName);
          const filterValue = filterObj ? filterObj.value : "none";

          ctx.filter = filterValue;
          ctx.drawImage(canvas, 0, 0);

          resolve(filteredCanvas.toDataURL("image/jpeg"));
        } else {
          resolve("");
        }
      });
    },
    []
  );

  const applyZoomToCropper = useCallback((zoomPercentage: number) => {
    if (cropperRef.current?.cropper) {
      const cropperInstance = cropperRef.current.cropper;
      const minZoom = 0.1;
      const maxZoom = 3;

      const zoomFactor =
        zoomPercentage <= 0
          ? minZoom
          : zoomPercentage >= 100
          ? maxZoom
          : minZoom + (maxZoom - minZoom) * (zoomPercentage / 100);

      cropperInstance.zoomTo(zoomFactor);
    }
  }, []);

  // const getPreViewCropDataPost = async (filter: string) => {
  //   if (typeof cropper !== "undefined") {
  //     let processedUrl;
  //     if (filter != "normal") {
  //       processedUrl = await applyFilterToImage(
  //         cropper.getCroppedCanvas().toDataURL(),
  //         filter
  //       );
  //     } else {
  //       processedUrl = cropper.getCroppedCanvas().toDataURL();
  //     }
  //     setCropPreviewData(processedUrl);
  //     return processedUrl;
  //   }
  // };

  const getPreViewCropDataPost = async (
    filter: string
  ): Promise<string | undefined> => {
    return new Promise(async (resolve) => {
      if (!cropper) {
        resolve(undefined);
        return;
      }

      // 1. Obtener canvas cropeado
      const canvas = cropper.getCroppedCanvas();
      const baseImage = canvas.toDataURL();

      // 2. Aplicar filtro si existe
      let filteredImage = baseImage;

      if (filter !== "normal") {
        filteredImage = await applyFilterToImage(baseImage, filter);
      }

      // 3. Convertir a Blob
      const response = await fetch(filteredImage);
      const blob = await response.blob();

      const file = new File([blob], "processed_image.jpg", {
        type: blob.type,
        lastModified: Date.now(),
      });

      // 4. Comprimir
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const finalDataURL = await imageCompression.getDataUrlFromFile(
          compressedFile
        );

        // 5. Actualizar preview
        setCropPreviewData(finalDataURL);

        resolve(finalDataURL);
      } catch (error) {
        console.error("Error en compresión:", error);
        resolve(undefined);
      }
    });
  };

  const applyFilterToImage = async (
    imageUrl: string,
    filter: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.filter = filters.find((f) => f.name === filter)?.value || "none";
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL());
      };
      img.src = imageUrl;
    });
  };

  return {
    cropperRef,
    cropper,
    setCropper,
    selectedAspectRatio,
    setSelectedAspectRatio,
    applyCropperCrop,
    applyFilterToCropperImage,
    applyZoomToCropper,
    cropPreviewData,
    setCropPreviewData,
    getPreViewCropDataPost,
    filters,
  };
};
