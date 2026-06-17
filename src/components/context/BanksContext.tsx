import React, { createContext, ReactNode, useContext, useState } from "react";
import { PostModel } from "../Models/Post/PostModel";
import { ServiceModel } from "../Models/Service/ServiceModel";

interface BanksContextProps {
  postBank: PostModel[];
  searchPost: (id: string) => Promise<PostModel | undefined>;
  savePost: (post: PostModel) => void;
  updatePost: (
    id: string,
    updates: Partial<
      Pick<PostModel, "description" | "status" | "likes" | "comments" | "liked">
    >
  ) => void;
  serviceBank: ServiceModel[];
  searchService: (id: string) => Promise<ServiceModel | undefined>;
  saveService: (service: ServiceModel) => void;
  updateService: (
    id: string,
    updates: Partial<
      Pick<
        ServiceModel,
        | "likes"
        | "comments"
        | "liked"
        | "score"
        | "cantScorer"
        | "scoreQualified"
        | "isQualified"
      >
    >
  ) => void;
}

const BanksContext = createContext<BanksContextProps | undefined>(undefined);

interface BanksProviderProps {
  children: ReactNode;
}

export const BanksProvider: React.FC<BanksProviderProps> = ({ children }) => {
  const [postBank, setPostBank] = useState<PostModel[]>([]);
  const [serviceBank, setServiceBank] = useState<ServiceModel[]>([]);

  const searchPost = async (id: string): Promise<PostModel | undefined> => {
    if (!id) return undefined;

    const existingPost = postBank.find((p) => p.id === id);
    if (existingPost) return existingPost;

    return undefined;
  };

  const searchService = async (
    id: string
  ): Promise<ServiceModel | undefined> => {
    if (!id) return undefined;

    const existingService = serviceBank.find((s) => s.id === id);
    if (existingService) return existingService;

    return undefined;
  };

  const savePost = (post: PostModel) => {
    setPostBank((prevPost) => {
      const filteredPosts = prevPost.filter((p) => p.id !== post.id);
      return [...filteredPosts, post];
    });
  };

  const saveService = (service: ServiceModel) => {
    setServiceBank((prevService) => {
      const filteredServices = prevService.filter((p) => p.id !== service.id);
      return [...filteredServices, service];
    });
  };

  const updatePost = (
    id: string,
    updates: Partial<
      Pick<PostModel, "description" | "status" | "likes" | "comments" | "liked">
    >
  ) => {
    setPostBank((prevPost) =>
      prevPost.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
            }
          : p
      )
    );
  };

  const updateService = (
    id: string,
    updates: Partial<
      Pick<
        ServiceModel,
        | "likes"
        | "comments"
        | "liked"
        | "score"
        | "cantScorer"
        | "isQualified"
        | "scoreQualified"
      >
    >
  ) => {
    setServiceBank((prevService) =>
      prevService.map((s) =>
        s.id === id
          ? {
              ...s,
              ...updates,
            }
          : s
      )
    );
  };

  return (
    <BanksContext.Provider
      value={{
        postBank,
        searchPost,
        savePost,
        updatePost,
        serviceBank,
        searchService,
        saveService,
        updateService,
      }}
    >
      {children}
    </BanksContext.Provider>
  );
};

export const useBanksContext = (): BanksContextProps => {
  const context = useContext(BanksContext);
  if (!context) {
    throw new Error(
      "useBanksContext debe ser utilizado dentro de un BanksProvider"
    );
  }
  return context;
};
