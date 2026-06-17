import {
  faBookmark as faBookmarkRegular,
  faComment as faCommentRegular,
  faHeart as faHeartRegular,
} from "@fortawesome/free-regular-svg-icons";
import {
  faArrowsRotate,
  faArrowTurnDown,
  faBookmark,
  faEllipsisH,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MediaDataModel } from "../../../Models/MediaData/MediaDataModel";
import { PostModel } from "../../../Models/Post/PostModel";
import { PostParams } from "../../../Models/Post/PostParams";
import { ModalOptionModel } from "../../../Models/data/ModalOptionModel";
import likeService from "../../../Services/Like/LikeService";
import postService from "../../../Services/Post/PostService";
import statusService from "../../../Services/Status/StatusService";
import UserProfile from "../../../assets/UserProfile.jpeg";
import { Colors } from "../../../constants/Colors";
import { PostStatus } from "../../../constants/Status";
import { MessageType } from "../../../constants/Types";
import { useBanksContext } from "../../../context/BanksContext";
import { useImageBankContext } from "../../../context/ImageBankContext";
import { useThemeContext } from "../../../context/ThemeContext";
import { useUserContext } from "../../../context/UserContext";
import { useAlertConfirmation } from "../../../hooks/useAlertConfirmation";
import useHourHook from "../../../hooks/useHourHook";
import useLanguage from "../../../hooks/useLanguage";
import CommentModal from "../../Home/Modal/CommentModal";
import Notify from "../../Notify/Notify";
import ConfirmationAlert from "../Modal/ConfirmationAlert";
import EditModal from "../Modal/EditModal";
import OptionsModal from "../Modal/OptionsModal";
import ShareModal from "../Modal/ShareModal";

interface IPublication {
  publication: PostModel;
  tendencia?: number;
  validations: any[];
}

const Publication = React.memo(
  ({ publication, tendencia, validations }: IPublication) => {
    const mentionRegex = /(@[^\s]+)/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const navigate = useNavigate();
    const { theme } = useThemeContext();
    const { userData } = useUserContext();
    const { getLabel } = useLanguage();
    const { searchImage } = useImageBankContext();
    const { searchPost, updatePost } = useBanksContext();
    const { getElapsedTime } = useHourHook();
    const { alertState, showAlert, handleClose } = useAlertConfirmation();

    const [post, setPost] = useState<PostModel>();
    const [classlike, setClasslike] = useState<boolean>(false);
    const [isRepost, setIsRepost] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [imagePost, setImagePost] = useState<MediaDataModel>();
    const [imageProfile, setImageProfile] = useState<MediaDataModel>();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [isModalEditVisible, setModalEditVisible] = useState<boolean>(false);
    const [optionsModalVisible, setOptionsModalVisible] =
      useState<boolean>(false);

    const [commentModalVisible, setCommentModalVisible] = useState(false);

    // Efecto para detectar cambios en el tamaño de pantalla
    useEffect(() => {
      const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
      if (classlike) {
        const timeout = setTimeout(() => {
          setClasslike(false);
        }, 1000);

        return () => clearTimeout(timeout);
      }
    }, [classlike]);

    useEffect(() => {
      const fetchImages = async () => {
        if (publication.idMediaData) {
          try {
            const [profileImage] = await Promise.all([
              searchImage(publication.idMediaDataProfile!),
            ]);
            setImageProfile(profileImage);
          } catch (error) {
            console.error("Error fetching images:", error);
          }
        }
      };

      if (userData?.user?.id !== publication.idUser) {
        fetchImages();
      } else {
        const imageProfile: MediaDataModel = {
          _id: "",
          Value: userData?.profilePhoto,
          Type: "IMAGE",
        };
        setImageProfile(imageProfile);
      }
    }, [publication, searchImage, userData]);

    useEffect(() => {
      const fetchImages = async () => {
        if (publication.idMediaData) {
          try {
            const [postImage] = await Promise.all([
              searchImage(publication.idMediaData!),
            ]);
            setImagePost(postImage!);
          } catch (error) {
            console.error("Error fetching image:", error);
          }
        }
      };

      fetchImages();
    }, [publication, searchImage]);

    useEffect(() => {
      if (!publication.id) return;

      const fetchPost = async () => {
        try {
          const post = await searchPost(publication.id!);
          if (post) {
            setPost(post);
          }
        } catch (error) {
          console.error("Error fetching post:", error);
        }
      };

      fetchPost();
    }, [publication, searchPost]);

    const ActionLike = (idPost: string) => {
      publication.liked
        ? likeService
            .RemoveLike(idPost)
            .then((e: any) => {})
            .catch((err: any) => {
              console.log(err);
            })
        : likeService
            .Setlike(idPost)
            .then((e: any) => {})
            .catch((err: any) => {
              console.log(err);
            });
    };

    const likePost = (liked: boolean, amountOfLikes: number) => {
      updatePost(publication.id!, {
        liked: liked,
        likes: amountOfLikes,
      });
    };

    const changeStatusPost = (status: number) => {
      updatePost(publication.id!, {
        status: status,
      });
    };

    const DeletePost = (id: string) => {
      statusService
        .ApplyStatusToDelete(id)
        .then((e: any) => {})
        .catch((err: any) => {
          console.error(err);
        });
    };

    const ArchivedPost = (id: string) => {
      statusService
        .ApplyStatusToArchived(id)
        .then((e: any) => {})
        .catch((err: any) => {
          console.error(err);
        });
    };

    const options: ModalOptionModel[] = [
      {
        name: getLabel("eliminar"),
        function: () => {
          showAlert(
            "danger",
            getLabel("eliminar_publicacion"),
            getLabel("confirmacion_eliminar_publicacion")
          );
        },
        color: "red",
      },
      // {
      //   name: getLabel("reportar_publicacion"),
      //   function: () => {
      //     console.log("Publicacion reportada");
      //   },
      //   color: "#ff9500",
      // },
      {
        name: getLabel("editar"),
        function: () => setModalEditVisible(true),
        color: "",
      },

      post?.status === PostStatus.ARCHIVED
        ? {
            name: getLabel("descarchivar"),
            function: () => {
              changeStatusPost(PostStatus.PUBLISHED);
              ArchivedPost(publication.id!);
            },
            color: "",
          }
        : {
            name: getLabel("archivar"),
            function: () => {
              changeStatusPost(PostStatus.ARCHIVED);
              ArchivedPost(publication.id!);
            },
            color: "",
          },
      {
        name: getLabel("copiar_enlace"),
        function: async () => {
          await navigator.clipboard.writeText(
            `https://aycoro.com/publication/${publication.id}`
          );
          Notify(getLabel("enlace_copiado"), "#17459aff");
        },
        color: "",
      },
    ];

    const editePost = (description: string) => {
      const post: PostParams = {
        id: publication.id,
        idUser: userData?.user?.id,
        photo: "",
        description: description,
      };
      postService
        .Update(post)
        .then((e: any) => {
          updatePost(publication.id!, {
            description: description,
            status: PostStatus.EDITED,
          });
        })
        .catch((err: any) => {
          console.log(err);
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
      post?.description && post?.description.trim() !== ""
        ? post!.description!.split(combinedRegex)
        : "ghost description".split(combinedRegex);

    const handleDeleteConfirm = () => {
      changeStatusPost(PostStatus.DELETED);
      DeletePost(publication.id!);
    };

    return (
      <>
        {post &&
          (post.status == validations[0] || post.status == validations[1]) && (
            <div
              style={{
                backgroundColor:
                  theme === "light"
                    ? Colors.light.colors.background
                    : Colors.dark.colors.background,
                borderRadius: "12px",
                border: `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
                marginBottom: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              {/* Encabezado de la publicación */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      // border: "2px solid #e1306c",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate(`/${publication.username}`);
                    }}
                  >
                    <img
                      src={imageProfile ? imageProfile?.Value : UserProfile}
                      alt={post.username}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: "600",
                        fontSize: "14px",
                        color:
                          theme === "light"
                            ? Colors.light.colors.text
                            : Colors.dark.colors.text,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        navigate(`/${publication.username}`);
                      }}
                    >
                      {post.username}
                    </div>
                    {/* {post.location && ( */}
                    {/* <div
                      style={{
                        fontSize: "12px",
                        color: "#8e8e8e",
                        cursor: "pointer",
                      }}
                    >
                      {post.location}
                      San Juan, Chile
                    </div> */}
                    {/* )} */}
                  </div>
                </div>
                {userData?.user?.id === publication.idUser && (
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color:
                        theme === "light"
                          ? Colors.light.colors.primary
                          : Colors.dark.colors.primary,
                      padding: "8px",
                    }}
                    onClick={() => setOptionsModalVisible(true)}
                  >
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </button>
                )}
              </div>

              {/* Imagen de la publicación */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                }}
              >
                {imagePost ? (
                  <img
                    src={imagePost?.Value}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifySelf: "center",
                    }}
                    className="color-changing"
                  />
                )}
              </div>

              {/* Acciones de la publicación */}
              <div
                style={{
                  padding: "12px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    marginBottom: "30px",
                    marginTop: isMobile ? "-360px" : "-430px",
                    zIndex: 0,
                    position: "relative",
                  }}
                >
                  <div>
                    <div style={{ marginBottom: isMobile ? 15 : 30 }}>
                      <button
                        onClick={() => {
                          ActionLike(publication.id!);
                          likePost(
                            !post.liked,
                            post.liked ? post.likes! - 1 : post.likes! + 1
                          );
                        }}
                        style={{
                          width: 50,
                          height: 50,
                          background:
                            theme === "light"
                              ? Colors.light.colors.background
                              : Colors.dark.colors.background,
                          borderRadius: 50,
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={post.liked ? faHeart : faHeartRegular}
                          size="lg"
                          color={
                            post.liked
                              ? "#ed4956"
                              : theme === "light"
                              ? Colors.light.colors.primary
                              : Colors.dark.colors.primary
                          }
                        />
                      </button>
                    </div>

                    <div style={{ marginBottom: isMobile ? 15 : 30 }}>
                      <button
                        onClick={() => setCommentModalVisible(true)}
                        style={{
                          width: 50,
                          height: 50,
                          background:
                            theme === "light"
                              ? Colors.light.colors.background
                              : Colors.dark.colors.background,
                          borderRadius: 50,
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faCommentRegular}
                          size="lg"
                          color={
                            theme === "light"
                              ? Colors.light.colors.primary
                              : Colors.dark.colors.primary
                          }
                        />
                      </button>
                    </div>

                    <div style={{ marginBottom: isMobile ? 15 : 30 }}>
                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        style={{
                          width: 50,
                          height: 50,
                          background:
                            theme === "light"
                              ? Colors.light.colors.background
                              : Colors.dark.colors.background,
                          borderRadius: 50,
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faArrowTurnDown}
                          size="lg"
                          style={{
                            transform: "rotate(-90deg)",
                          }}
                          color={
                            theme === "light"
                              ? Colors.light.colors.primary
                              : Colors.dark.colors.primary
                          }
                        />
                      </button>
                    </div>

                    <div style={{ marginBottom: isMobile ? 15 : 30 }}>
                      <button
                        onClick={() => setIsRepost(!isRepost)}
                        style={{
                          width: 50,
                          height: 50,
                          background:
                            theme === "light"
                              ? Colors.light.colors.background
                              : Colors.dark.colors.background,
                          borderRadius: 50,
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faArrowsRotate}
                          size="lg"
                          color={
                            isRepost
                              ? Colors.detailAppColor
                              : theme === "light"
                              ? Colors.light.colors.primary
                              : Colors.dark.colors.primary
                          }
                        />
                      </button>
                    </div>

                    <div style={{ marginBottom: isMobile ? 15 : 30 }}>
                      <button
                        onClick={() => {
                          //  safe publication
                          setIsSaved(!isSaved);
                        }}
                        style={{
                          width: 50,
                          height: 50,
                          background:
                            theme === "light"
                              ? Colors.light.colors.background
                              : Colors.dark.colors.background,
                          borderRadius: 50,
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={isSaved ? faBookmark : faBookmarkRegular}
                          size="lg"
                          color={
                            isSaved
                              ? Colors.detailAppColor
                              : theme === "light"
                              ? Colors.light.colors.primary
                              : Colors.dark.colors.primary
                          }
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {post.likes !== 0 && (
                  // {/* Información de likes */}
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "8px",
                      color:
                        theme === "light"
                          ? Colors.light.colors.primary
                          : Colors.dark.colors.primary,
                    }}
                  >
                    {post.likes === 1
                      ? getLabel("me_gusta", { param: `${post.likes}` })
                      : getLabel("me_gustas", { param: `${post.likes}` })}
                  </div>
                )}

                {/* Pie de foto */}
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.4",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "600",
                      marginRight: "4px",
                      color:
                        theme === "light"
                          ? Colors.light.colors.primary
                          : Colors.dark.colors.primary,
                    }}
                  >
                    {post.username}
                  </span>
                  <span
                    style={{
                      color:
                        theme === "light"
                          ? Colors.light.colors.primary
                          : Colors.dark.colors.primary,
                    }}
                  >
                    {post.description &&
                      post.description.trim() !== "" &&
                      stringDescription.map((part, index) => {
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
                            <span
                              key={index}
                              onClick={() => handlePressMention(part)}
                              style={{ color: "#0095f6", cursor: "pointer" }}
                            >
                              {part}
                            </span>
                          );
                        }
                        return part;
                      })}
                  </span>
                </div>

                {/* Comentarios */}
                {post.comments !== 0 && (
                  <button
                    onClick={() => setCommentModalVisible(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color:
                        theme === "light"
                          ? Colors.light.colors.primary
                          : Colors.dark.colors.primary,
                      fontSize: "14px",
                      cursor: "pointer",
                      padding: 0,
                      // marginBottom: "8px",
                    }}
                  >
                    {post.comments === 1
                      ? getLabel("ver_comentario", {
                          param: `${post.comments}`,
                        })
                      : getLabel("ver_comentarios", {
                          params: `${post.comments}`,
                        })}
                  </button>
                )}

                {/* Tiempo de publicación */}
                <div
                  style={{
                    color: "#8e8e8e",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    marginTop: 8,
                  }}
                >
                  {getElapsedTime(new Date(publication.createDate!))}
                </div>
              </div>

              <CommentModal
                visible={commentModalVisible}
                onClose={() => setCommentModalVisible(false)}
                publicationId={publication.id!}
                countOfComent={post.comments!}
              />

              <OptionsModal
                visible={optionsModalVisible}
                onClose={() => setOptionsModalVisible(false)}
                options={options}
              />

              <EditModal
                isOpen={isModalEditVisible}
                onClose={() => setModalEditVisible(false)}
                onSave={editePost}
                item={publication.description!}
                title={getLabel("editar_publicacion")}
                maxLength={2200}
              />

              <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                idItem={publication.id!}
                type={MessageType.PUBLICATION}
              />

              <ConfirmationAlert
                isOpen={alertState.isOpen}
                onClose={handleClose}
                onConfirm={handleDeleteConfirm}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type as any}
                confirmText={
                  alertState.type === "danger"
                    ? getLabel("eliminar")
                    : "Confirmar"
                }
                cancelText={getLabel("cancelar")}
              />
            </div>
          )}
      </>
    );
  }
);
export default Publication;
