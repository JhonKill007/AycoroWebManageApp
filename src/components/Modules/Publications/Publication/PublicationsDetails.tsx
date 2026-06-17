import {
  faComment,
  faEllipsisVertical,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ComentModel } from "../../../Models/Coment/ComentModel";
import { ComentParams } from "../../../Models/Coment/ComentParams";
import { PostModel } from "../../../Models/Post/PostModel";
import { ModalOptionModel } from "../../../Models/data/ModalOptionModel";
import Coment from "../../../Services/Coments/ComentService";
import Like from "../../../Services/Like/LikeService";
import Status from "../../../Services/Status/StatusService";
import { PostStatus } from "../../../constants/Status";
import { CommentType } from "../../../constants/Types";
import { useBanksContext } from "../../../context/BanksContext";
import { useImageBankContext } from "../../../context/ImageBankContext";
import { useUserContext } from "../../../context/UserContext";
import useGetHour from "../../../hooks/useHourHook";
import useLanguage from "../../../hooks/useLanguage";
import Coments from "../Coments/Coments";
import "./Publication.css";

interface IPublicationsDetails {
  publication: PostModel;
  removePublication: Function;
}

const PublicationsDetails = React.memo(
  ({ publication, removePublication }: IPublicationsDetails) => {
    const navigate = useNavigate();
    const mentionRegex = /(@[^\s]+)/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const { getElapsedTime } = useGetHour();
    const { getLabel } = useLanguage();
    const { userData } = useUserContext();
    const { searchPost, updatePost } = useBanksContext();
    const { searchImage } = useImageBankContext();
    const [allComents, setAllComents] = useState<ComentModel[]>([]);
    const [inputComent, setInputComent] = useState<boolean>(false);
    const [seeComents, setSeeComents] = useState<boolean>(false);
    const [comentText, setComentText] = useState<string>("");
    const [spinnerComent, setSpinnerComent] = useState<boolean>(false);
    const [classlike, setClasslike] = useState<boolean>(false);
    const [image, setImage] = useState<any>();
    const [isModalOptionsVisible, setModalOptionsVisible] =
      useState<boolean>(false);
    const [post, setPost] = useState<PostModel>();

    useEffect(() => {
      if (classlike) {
        const timeout = setTimeout(() => {
          setClasslike(false);
        }, 1000);

        return () => clearTimeout(timeout);
      }
    }, [classlike]);

    useEffect(() => {
      if (!publication._id) return;

      const fetchPost = async () => {
        try {
          const post = await searchPost(publication._id!);
          if (post) {
            setPost(post);
          }
        } catch (error) {
          console.error("Error fetching post:", error);
        }
      };

      fetchPost();
    }, [publication, searchPost]);

    const getComents = () => {
      Coment.GetAll(publication._id!, 1)
        .then((e: any) => {
          setAllComents(e.data);
        })
        .catch((err: any) => {
          console.log(err);
        });
    };

    const ActionLike = (idPost: string) => {
      publication.liked
        ? Like.RemoveLike(idPost)
            .then((e: any) => {})
            .catch((err: any) => {
              console.log(err);
            })
        : Like.Setlike(idPost)
            .then((e: any) => {})
            .catch((err: any) => {
              console.log(err);
            });
    };

    const handleKeyPress = (e: any) => {
      if (e.key == "Enter") {
        SaveComent();
      }
    };

    const SaveComent = () => {
      if (comentText) {
        setSpinnerComent(true);
        const C: ComentParams = {
          idcoment: "",
          iditem: publication.id!,
          iduser: userData!.user?.id,
          coment: comentText,
          type: CommentType.PUBLICATION,
        };
        Coment.Save(C)
          .then((e: any) => {
            setAllComents((allComents: any) => [...allComents, e.data]);
            updatePost(publication.id!, {
              comments: publication.comments! + 1,
            });
            setComentText("");
            setInputComent(false);
            setSpinnerComent(false);
          })
          .catch((err: any) => {
            console.log(err);
          });
      }
    };

    const handleComentChange = (modifiedComent: ComentModel) => {
      const updatedComents = allComents.map((coment) => {
        if (coment.id === modifiedComent.id) {
          return modifiedComent;
        }
        return coment;
      });
      setAllComents(updatedComents);
    };

    const deleteComment = (indexToDelete: number) => {
      const updatedComments = allComents.filter(
        (_, index) => index !== indexToDelete
      );
      setAllComents(updatedComments);
      updatePost(publication.id!, {
        comments: publication.comments! - 1,
      });
    };

    useEffect(() => {
      const fetchImages = async () => {
        if (publication.idMediaData) {
          try {
            const [postImage] = await Promise.all([
              searchImage(publication.idMediaData!),
            ]);
            setImage(postImage!);
          } catch (error) {
            console.error("Error fetching image:", error);
          }
        }
      };

      fetchImages();
    }, [publication, searchImage]);

    const DeletePost = (id: string) => {
      Status.ApplyStatusToDelete(id)
        .then((e: any) => {})
        .catch((err: any) => {
          console.error(err);
        });
    };

    const ArchivedPost = (id: string) => {
      Status.ApplyStatusToArchived(id)
        .then((e: any) => {})
        .catch((err: any) => {
          console.error(err);
        });
    };

    const DesArchived = (id: string) => {
      Status.ApplyStatusToActive(id)
        .then((e: any) => {})
        .catch((err: any) => {
          console.error(err);
        });
    };

    const options: ModalOptionModel[] = [
      {
        name: getLabel("eliminar"),
        function: () => {
          DeletePost(publication.id!);
          removePublication(publication.id!);
          setModalOptionsVisible(false);
        },
        color: "red",
      },
      {
        name: getLabel("editar"),
        function: () => {},
        color: "",
      },

      publication.status === PostStatus.ARCHIVED
        ? {
            name: getLabel("descarchivar"),
            function: () => {
              DesArchived(publication.id!);
              removePublication(publication.id!);
              setModalOptionsVisible(false);
            },
            color: "",
          }
        : {
            name: getLabel("archivar"),
            function: () => {
              ArchivedPost(publication.id!);
              removePublication(publication.id!);
              setModalOptionsVisible(false);
            },
            color: "",
          },
    ];

    const likePost = (liked: boolean, amountOfLikes: number) => {
      updatePost(publication.id!, {
        liked: liked,
        likes: amountOfLikes,
      });
    };

    const handlePressMention = (mention: string) => {
      const username = mention.slice(1);
      navigate(`/${username}`);
    };

    const combinedRegex = new RegExp(
      `${urlRegex.source}|${mentionRegex.source}`,
      "g"
    );

    const stringDescription =
      publication?.description && publication?.description.trim() !== ""
        ? publication!.description!.split(combinedRegex)
        : "ghost description".split(combinedRegex);

    return (
      <>
        {publication.id && (
          <div
            key={publication.id}
            className="container list-item"
            id="publication.id"
          >
            <div className="row">
              <div className="col-md-10 publication publicationsFlex">
                <div className="col-md-8">
                  {image ? (
                    <div className="ImageBox">
                      <img
                        src={image?.value}
                        onDoubleClick={() => {
                          setClasslike(true);
                          if (!publication.liked) {
                            ActionLike(publication.id!);
                            likePost(
                              !publication.liked,
                              publication.liked
                                ? publication.likes! - 1
                                : publication.likes! + 1
                            );
                          }
                        }}
                      />
                      <FontAwesomeIcon
                        style={{ color: "white" }}
                        className={classlike ? "like" : ""}
                        id="icon_Heart_like"
                        icon={faHeart}
                      />
                    </div>
                  ) : (
                    <div className="ImageBoxCharger color-changing" />
                  )}
                </div>
                <div className="col-md-4 PublicationInteractionPading">
                  <div className="InteratorPost">
                    <div className="LikeComentIcon">
                      <div
                        className="LikeIcon"
                        onClick={() => {
                          ActionLike(publication.id!);
                          likePost(
                            !publication.liked,
                            publication.liked
                              ? publication.likes! - 1
                              : publication.likes! + 1
                          );
                        }}
                      >
                        {post?.liked ? (
                          <FontAwesomeIcon
                            style={{ color: "red" }}
                            className="icon"
                            icon={faHeart}
                          />
                        ) : (
                          <FontAwesomeIcon className="icon" icon={faHeart} />
                        )}
                      </div>
                      <div
                        className="ComentnIcon"
                        onClick={() => setInputComent(!inputComent)}
                      >
                        <FontAwesomeIcon className="icon" icon={faComment} />
                      </div>
                    </div>
                    {publication.idUser == userData?.user?.id && (
                      <div
                        className="settingIcon"
                        onClick={() => {
                          setModalOptionsVisible(true);
                        }}
                      >
                        <FontAwesomeIcon
                          className="icon"
                          icon={faEllipsisVertical}
                        />
                      </div>
                    )}
                  </div>
                  <div className="statePublication">
                    {post?.likes !== 0 && (
                      <span>
                        {post?.likes === 1
                          ? getLabel("me_gusta", { param: `${post?.likes}` })
                          : getLabel("me_gustas", { param: `${post?.likes}` })}
                      </span>
                    )}
                  </div>
                  {post?.description && post?.description.trim() !== "" && (
                    <div className="statePublication">
                      <span>
                        {stringDescription.map((part, index) => {
                          // if (urlRegex.test(part)) {
                          //   return (
                          //     <TouchableOpacity
                          //       key={index}
                          //       onPress={() => handlePressUrl(part)}
                          //     >
                          //       <Text style={{ color: "blue" }}>{part}</Text>
                          //     </TouchableOpacity>
                          //   );
                          // }
                          if (mentionRegex.test(part)) {
                            return (
                              <b
                                key={index}
                                onClick={() => handlePressMention(part)}
                                style={{ color: "green", cursor: "pointer" }}
                              >
                                {part}
                              </b>
                            );
                          }
                          return <span key={index}>{part}</span>;
                        })}
                      </span>
                    </div>
                  )}
                  <div className="statePublication">
                    <strong
                      className="userPublication"
                      onClick={() => navigate(`/${publication.username}`)}
                    >
                      {publication.username}
                    </strong>
                  </div>
                  {post?.comments !== 0 && (
                    <div className="statePublication">
                      <span
                        className="NumComent"
                        onClick={() => {
                          setSeeComents(!seeComents);
                        }}
                      >
                        {post?.comments === 1
                          ? getLabel("ver_comentario", {
                              param: `${post?.comments}`,
                            })
                          : getLabel("ver_comentarios", {
                              params: `${post?.comments}`,
                            })}
                      </span>
                    </div>
                  )}
                  <span style={{ fontSize: "10px" }}>
                    {getElapsedTime(new Date(publication.createDate!))}
                  </span>
                  {inputComent && (
                    <div
                      className="comentInputBox d-flex"
                      style={{ width: "100%" }}
                    >
                      <div className="InputComent" style={{ width: "85%" }}>
                        <input
                          type="text"
                          placeholder="Agrega un comentario..."
                          value={comentText}
                          onChange={(e) => setComentText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          autoComplete="off"
                          disabled={spinnerComent}
                        />
                      </div>
                      {!spinnerComent && (
                        <div
                          className="text-center texto-publi"
                          style={{
                            width: "70px",
                            margin: "auto",
                            marginLeft: "10px",
                          }}
                          onClick={SaveComent}
                        >
                          <b style={{ color: "#1877f2", marginLeft: "-10px" }}>
                            Publicar
                          </b>
                        </div>
                      )}
                      {spinnerComent && (
                        <div
                          className="text-center texto-publi"
                          style={{ width: "10%" }}
                        >
                          <div
                            className="spinner-border text-primary coment-spinner"
                            role="status"
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    {seeComents &&
                      (allComents.length > 0 ? (
                        allComents.map((c: ComentModel, index: number) => (
                          <Coments
                            coment={c}
                            key={index}
                            handleComentChange={handleComentChange}
                            onDelete={() => deleteComment(index)}
                          />
                        ))
                      ) : (
                        <div className="col-md-12 text-center texto-publi">
                          {getComents()}
                          <div
                            className="spinner-border text-primary coment-spinner"
                            role="status"
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              {/* {isModalOptionsVisible && (
                <ModalOptions
                  setModalVisible={setModalOptionsVisible}
                  isModalVisible={isModalOptionsVisible}
                  options={options}
                />
              )} */}
            </div>
            <br />
            <br />
          </div>
        )}
      </>
    );
  }
);
export default PublicationsDetails;
