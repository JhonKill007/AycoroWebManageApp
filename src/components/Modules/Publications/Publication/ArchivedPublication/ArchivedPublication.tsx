import {
  faClose
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../../context/AppContext";
import { PostModel } from "../../../../Models/Post/PostModel";
import Post from "../../../../Services/Post/PostService";
import PublicationModalView from "../../../Modals/PublicationModalView";
import PerfilPublicationImage from "../PerfilPublication/PerfilPublicationImage";

const ArchivedPublication = ({ setArchivedView }: any) => {
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [SearchData, setSearchData] = useState<boolean>(true);
  const [archivedPostSection, setArchivedPostSection] = useState<number>(1);

  const [isVisiblePublicationModalView, setVisiblePublicationModalView] =
    useState<boolean>(false);
  const [indexPost, setIndexPost] = useState<number>(0);

  useEffect(() => {
    if (SearchData) {
      getPost();
    }
  }, [SearchData]);

  const getPost = () => {
    Post.GetArchivedPost(archivedPostSection)
      .then((e: any) => {
        console.log(e.data);
        setPosts(e.data);
        setSearchData(false);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const Context = useContext(AppContext);

  if (!Context) {
    return null;
  }
  const { OnLoadPost } = Context;

  const scrollToElement = (index: number) => {
    setIndexPost(index);
    setVisiblePublicationModalView(true);
  };

  const setPostDelete = (id: string) => {
    setPosts(posts.filter((p: PostModel) => p.id != id));
    setVisiblePublicationModalView(false);
  };

  return (
    <div className="AP_modal_box">
      <div className="AP_modal_container">
        <div className="AP_modal_container_tittle">
          <br />
          <h2>Publicaciones Archivadas</h2>
          {SearchData && (
            <div className="puntos-container">
              <div className="punto"></div>
              <div className="punto"></div>
              <div className="punto"></div>
            </div>
          )}
        </div>
        <div className="AP_div_view_container">
          <div className="container container-post">
            {posts.map((p: PostModel, index: number) => (
              <PerfilPublicationImage
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
                setIndex={setIndexPost}
                publications={posts}
                setPublications={setPostDelete}
              />
            )}
        </div>
      </div>
      <div>
        <div
          onClick={() => {
            setArchivedView(false);
          }}
        >
          <FontAwesomeIcon className="AP_closeIcon" icon={faClose} />
        </div>
      </div>
    </div>
  );
};

export default ArchivedPublication;
