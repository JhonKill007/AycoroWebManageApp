import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostModel } from "../../../../Models/Post/PostModel";
import PublicationModalView from "../../../Modals/PublicationModalView";
import "./PerfilPublication.css";
import PerfilPublicationImage from "./PerfilPublicationImage";

interface IPerfilPublication {
  posts: PostModel[];
  update: Function;
}

const PerfilPublication = ({ posts, update }: IPerfilPublication) => {
  const navigate = useNavigate();
  const [isVisiblePublicationModalView, setVisiblePublicationModalView] =
    useState<boolean>(false);
  const [indexPost, setindexPost] = useState<number>(0);

  // const Context = useContext(AppContext);

  // if (!Context) {
  //   // Manejar el caso cuando el contexto es nulo
  //   return null;
  // }
  // const { OnLoadPost } = Context;

  const scrollToElement = (index: number) => {
    setindexPost(index);
    setVisiblePublicationModalView(true);
  };

  const removePublication = (id: string) => {
    const updatedPosts =
      posts?.filter((post: PostModel) => post.id !== id) || [];
    update(updatedPosts);
  };

  return (
    <>
      <div className="container container-post">
        {posts.map((p: PostModel, index: number) => (
          <PerfilPublicationImage
            key={index}
            index={index}
            scrollToElement={scrollToElement}
            publication={p}
          />
        ))}
      </div>

      {isVisiblePublicationModalView &&
        posts.length > 0 &&
        posts[indexPost] !== undefined && (
          <PublicationModalView
            setModalVisible={setVisiblePublicationModalView}
            isModalVisible={isVisiblePublicationModalView}
            index={indexPost}
            setIndex={setindexPost}
            publications={posts}
            setPublications={removePublication}
          />
        )}
    </>
  );
};

export default PerfilPublication;
