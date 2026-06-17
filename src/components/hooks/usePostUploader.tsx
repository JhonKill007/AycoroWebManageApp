import { useHistoryContext } from "../context/HistoryContext";
import { usePublicationHandleContext } from "../context/PublicationHandleContext";
import { useUserContext } from "../context/UserContext";
import { PostParams } from "../Models/Post/PostParams";
import historyService from "../Services/History/HistoryService";
import postService from "../Services/Post/PostService";

export const usePostUploader = () => {
  const { userData } = useUserContext();
  const { uploadPost, settingOnLoadingPost } = usePublicationHandleContext();
  const { uploadHistory } = useHistoryContext();

  const savePublication = async (cropPreviewData: any, descripcion: string) => {
    const MockupNewPost: PostParams = {
      id: "",
      idUser: userData?.user?.id,
      photo: cropPreviewData,
      description: descripcion,
    };

    settingOnLoadingPost(MockupNewPost);

    try {
      const newPost: PostParams = {
        id: "",
        idUser: userData?.user?.id,
        photo: cropPreviewData,
        description: descripcion,
      };

      const response = await postService.Create(newPost);

      if (response) {
        uploadPost(response.data);
        settingOnLoadingPost(undefined);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const SaveHistory = async (cropPreviewData: any) => {
    try {
      const response = await historyService.Create(cropPreviewData);
      if (response) {
        uploadHistory(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return { savePublication, SaveHistory };
};
