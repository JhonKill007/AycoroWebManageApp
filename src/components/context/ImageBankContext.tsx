import React, { createContext, ReactNode, useContext, useRef, useState } from "react";
import { MediaDataModel } from "../Models/MediaData/MediaDataModel";
import mediaDataService from "../Services/MediaData/MediaDataService";

interface ImageBankContextProps {
  searchImage: (id: string) => Promise<MediaDataModel | undefined>;
}

const ImageBankContext = createContext<ImageBankContextProps | undefined>(undefined);

interface ImageBankProviderProps {
  children: ReactNode;
}

export const ImageBankProvider: React.FC<ImageBankProviderProps> = ({ children }) => {
  const [imagesBank, setImagesBank] = useState<MediaDataModel[]>([]);
  const requestCache = useRef<Record<string, Promise<MediaDataModel | undefined> | undefined>>({});

  const searchImage = async (id: string): Promise<MediaDataModel | undefined> => {
    if (!id) return undefined;

    // 1️⃣ Buscar en memoria
    const cachedImage = imagesBank.find((image) => image._id === id);
    if (cachedImage) return cachedImage;

    // 2️⃣ Evitar llamadas duplicadas
    const cachedRequest = requestCache.current[id];
    if (cachedRequest) return cachedRequest;

    // 3️⃣ Guardar promesa en cache temporal
    const fetchPromise = (async () => {
      try {
        const result = await mediaDataService.GetById(id);
        const data = result?.data;
        if (data) {
          const newImage: MediaDataModel = {
            _id: data._id,
            Value: data.Value,
            Type: data.Type,
          };
          setImagesBank((prev) => [...prev, newImage]);
          return newImage;
        }
      } catch (error) {
        console.error("Error fetching image:", error);
        return undefined;
      } finally {
        delete requestCache.current[id];
      }
      return undefined;
    })();

    requestCache.current[id] = fetchPromise;
    return fetchPromise;
  };

  return (
    <ImageBankContext.Provider value={{ searchImage }}>
      {children}
    </ImageBankContext.Provider>
  );
};

export const useImageBankContext = (): ImageBankContextProps => {
  const context = useContext(ImageBankContext);
  if (!context) {
    throw new Error("useImageBankContext debe ser utilizado dentro de un ImageBankProvider");
  }
  return context;
};
