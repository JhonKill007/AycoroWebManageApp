import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { PostModel } from "../Models/Post/PostModel";
import { PostParams } from "../Models/Post/PostParams";
import postService from "../Services/Post/PostService";
import { useBanksContext } from "./BanksContext";

interface PublicationHandleContextProps {
  indexPost: PostModel[];
  tendencias: PostModel[];
  mosaicos: PostModel[];
  uploadPost: (data: PostModel) => void;
  loadingPublication: PostParams | undefined;
  settingOnLoadingPost: (data: PostParams | undefined) => void;
}

const PublicationHandleContext = createContext<
  PublicationHandleContextProps | undefined
>(undefined);

interface PublicationHandleProviderProps {
  children: ReactNode;
}

export const PublicationHandleProvider: React.FC<
  PublicationHandleProviderProps
> = ({ children }) => {
  const { savePost } = useBanksContext();
  const [loadingPublication, setLoadingPublication] = useState<
    PostParams | undefined
  >(undefined);
  const [indexPost, setIndexPost] = useState<PostModel[]>([]);
  const [tendencias, setTendencias] = useState<PostModel[]>([]);
  const [mosaicos, setMosaicos] = useState<PostModel[]>([]);

  useEffect(() => {
    getPost(1);
    getTendencias();
    fetchMosaico(1);
  }, []);

  const getPost = (section: number) => {
    // setChargingPost(true);
    postService
      .GetIndexPost(section)
      .then((e: any) => {
        setIndexPost((prevBdPost) => [...prevBdPost, ...e.data]);
        e.data.map((e: any) => savePost(e));
        if (e.data.length < 10) {
          // setCanSearchMorePost(false);
        }
      })
      .catch((err: any) => {
        console.error(err);
      })
      .finally(() => {
        // setRefreshing(false);
        // setChargingPost(false);
      });
  };

  const getTendencias = async () => {
    try {
      const res = await postService.GetTendenciasPost();
      res.data.forEach(savePost);
      setTendencias(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      // setLoading(false);
    }
  };

  const fetchMosaico = async (section: number) => {
    try {
      const res = await postService.GetMosaicoPost(section);
      res.data.forEach(savePost);
      setMosaicos((prev) => [...prev, ...res.data]);
    } catch (err) {
      console.error(err);
    } finally {
      // setLoading(false);
    }
  };

  const uploadPost = async (data: PostModel) => {
    if (data) {
      setIndexPost((prevBdPost: any) => [data, ...prevBdPost]);
    }
  };

  const settingOnLoadingPost = (data: PostParams | undefined) => {
    setLoadingPublication(data);
  };

  return (
    <PublicationHandleContext.Provider
      value={{
        indexPost,
        tendencias,
        mosaicos,
        uploadPost,
        settingOnLoadingPost,
        loadingPublication,
      }}
    >
      {children}
    </PublicationHandleContext.Provider>
  );
};

export const usePublicationHandleContext =
  (): PublicationHandleContextProps => {
    const context = useContext(PublicationHandleContext);
    if (!context) {
      throw new Error(
        "usePublicationHandleContext debe ser utilizado dentro de un PublicationHandleProvider"
      );
    }
    return context;
  };
