import {
  faBookmark as faBookmarkRegular,
  faComment as faCommentRegular,
  faHeart as faHeartRegular,
} from "@fortawesome/free-regular-svg-icons";
import {
  faArrowsRotate,
  faArrowTurnDown,
  faBookmark,
  faChevronLeft,
  faChevronRight,
  faEllipsis,
  faHeart,
  faPaperPlane,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../../assets/UserProfile.jpeg";
import { Colors } from "../../../constants/Colors";
import { PostStatus } from "../../../constants/Status";
import { CommentType, MessageType } from "../../../constants/Types";
import { useBanksContext } from "../../../context/BanksContext";
import { useImageBankContext } from "../../../context/ImageBankContext";
import { useThemeContext } from "../../../context/ThemeContext";
import { useUserContext } from "../../../context/UserContext";
import { useAlertConfirmation } from "../../../hooks/useAlertConfirmation";
import useHourHook from "../../../hooks/useHourHook";
import useLanguage from "../../../hooks/useLanguage";
import { ComentModel } from "../../../Models/Coment/ComentModel";
import { ComentParams } from "../../../Models/Coment/ComentParams";
import { ModalOptionModel } from "../../../Models/data/ModalOptionModel";
import { MediaDataModel } from "../../../Models/MediaData/MediaDataModel";
import { PostModel } from "../../../Models/Post/PostModel";
import { PostParams } from "../../../Models/Post/PostParams";
import comentService from "../../../Services/Coments/ComentService";
import likeService from "../../../Services/Like/LikeService";
import postService from "../../../Services/Post/PostService";
import statusService from "../../../Services/Status/StatusService";
import CommentModal from "../../Home/Modal/CommentModal";
import Notify from "../../Notify/Notify";
import { CommentViewerPostCard } from "../Card/CommentViewerPostCard";
import ConfirmationAlert from "../Modal/ConfirmationAlert";
import EditModal from "../Modal/EditModal";
import OptionsModal from "../Modal/OptionsModal";
import ShareModal from "../Modal/ShareModal";

export const PostViewerModal = ({
  isOpen,
  onClose,
  publications,
  index,
}: {
  isOpen: boolean;
  onClose: () => void;
  publications: PostModel[];
  index: number;
}) => {
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

  const [currentIndex, setCurrentIndex] = useState<number>(index);

  const [post, setPost] = useState<PostModel>();
  const [classlike, setClasslike] = useState<boolean>(false);
  const [isRepost, setIsRepost] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [imagePost, setImagePost] = useState<MediaDataModel>();
  const [imageProfile, setImageProfile] = useState<MediaDataModel>();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isModalEditVisible, setModalEditVisible] = useState<boolean>(false);
  const [optionsModalVisible, setOptionsModalVisible] =
    useState<boolean>(false);

  const [coments, setComents] = useState<ComentModel[]>([]);
  const [commentModalVisible, setCommentModalVisible] =
    useState<boolean>(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
    const fetchImages = async () => {
      if (publications[currentIndex].idMediaData) {
        try {
          const [profileImage] = await Promise.all([
            searchImage(publications[currentIndex].idMediaDataProfile!),
          ]);
          setImageProfile(profileImage);
        } catch (error) {
          console.error("Error fetching images:", error);
        }
      }
    };

    if (userData?.user?.id !== publications[currentIndex].idUser) {
      fetchImages();
    } else {
      const imageProfile: MediaDataModel = {
        _id: "",
        Value: userData?.profilePhoto,
        Type: "IMAGE",
      };
      setImageProfile(imageProfile);
    }
  }, [publications[currentIndex], searchImage, userData]);

  useEffect(() => {
    const fetchImages = async () => {
      if (publications[currentIndex].idMediaData) {
        try {
          const [postImage] = await Promise.all([
            searchImage(publications[currentIndex].idMediaData!),
          ]);
          setImagePost(postImage!);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [publications[currentIndex], searchImage]);

  useEffect(() => {
    if (!publications[currentIndex].id) return;

    const fetchPost = async () => {
      try {
        const post = await searchPost(publications[currentIndex].id!);
        if (post) {
          setPost(post);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [publications[currentIndex], searchPost]);

  useEffect(() => {
    const getComents = () => {
      comentService
        .GetAll(publications[currentIndex].id!, 1)
        .then((e: any) => {
          setComents(e.data);
        })
        .catch((err: any) => {
          console.log(err);
        });
    };
    getComents();
  }, [publications[currentIndex]]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const handleNextImage = () => {
    if (currentIndex < publications.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const ActionLike = (idPost: string) => {
    post.liked
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
    updatePost(publications[currentIndex].id!, {
      liked: liked,
      likes: amountOfLikes,
    });
  };

  const changeStatusPost = (status: number) => {
    updatePost(publications[currentIndex].id!, {
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
    {
      name: getLabel("reportar_publicacion"),
      function: () => {
        console.log("Publicacion reportada");
      },
      color: "#ff9500",
    },
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
            ArchivedPost(publications[currentIndex].id!);
          },
          color: "",
        }
      : {
          name: getLabel("archivar"),
          function: () => {
            changeStatusPost(PostStatus.ARCHIVED);
            ArchivedPost(publications[currentIndex].id!);
          },
          color: "",
        },
    {
      name: getLabel("copiar_enlace"),
      function: async () => {
        await navigator.clipboard.writeText(
          `https://aycoro.com/publication/${publications[currentIndex].id}`
        );
        Notify(getLabel("enlace_copiado"), "#17459aff");
      },
      color: "",
    },
  ];

  const editePost = (description: string) => {
    const post: PostParams = {
      id: publications[currentIndex].id,
      idUser: userData?.user?.id,
      photo: "",
      description: description,
    };
    postService
      .Update(post)
      .then((e: any) => {
        updatePost(publications[currentIndex].id!, {
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
    DeletePost(publications[currentIndex].id!);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const commentModel: ComentParams = {
        idcoment: "",
        iditem: publications[currentIndex].id,
        iduser: userData?.user?.id,
        coment: newComment,
        type: CommentType.PUBLICATION,
      };
      const newComent = await comentService.Save(commentModel);
      setComents((coments: any) => [...coments, newComent.data]);
      updatePost(publications[currentIndex].id!, {
        comments: post.comments! + 1,
      });
      setNewComment("");
      //   inputRef.current?.focus();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleComentChange = (modifiedComent: ComentModel) => {
    const updatedComents = coments.map((coment) => {
      if (coment.id === modifiedComent.id) {
        return modifiedComent;
      }
      return coment;
    });
    setComents(updatedComents);
  };

  const deleteComment = (id: string) => {
    const updatedComments = coments.filter((_, index) => _.id !== id);
    setComents(updatedComments);
    updatePost(publications[currentIndex].id!, {
      comments: post.comments! - 1,
    });
  };

  const renderComment = (item: ComentModel, index: number) => (
    <CommentViewerPostCard
      key={index}
      coment={item}
      handleComentChange={handleComentChange}
      onDelete={deleteComment}
    />
  );

  return !isMobile ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      // onClick={onClose}
    >
      <div>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "rgba(0, 0, 0, 0.5)",
            border: "none",
            color: "white",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            fontSize: "18px",
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
        {publications.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              disabled={currentIndex === 0}
              style={{
                position: "absolute",
                left: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0, 0, 0, 0.5)",
                border: "none",
                color: "white",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                fontSize: "16px",
                opacity: currentIndex === 0 ? 0.5 : 1,
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              onClick={handleNextImage}
              disabled={currentIndex === publications.length - 1}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0, 0, 0, 0.5)",
                border: "none",
                color: "white",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
                fontSize: "16px",
                opacity: currentIndex === publications.length - 1 ? 0.5 : 1,
              }}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </>
        )}
        <div
          style={{
            backgroundColor:
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background,
            borderRadius: "12px",
            maxWidth: "1200px",
            maxHeight: "90vh",
            width: "100%",
            display: "flex",
            overflow: "hidden",
            position: "relative",
            border: `1px solid ${
              theme === "light"
                ? Colors.light.colors.border
                : Colors.dark.colors.border
            }`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: "flex",
              flexDirection: window.innerWidth < 768 ? "column" : "row",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                width: "1000px",
              }}
            >
              <img
                src={imagePost?.Value}
                alt={`Post by ${post.username}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderTopLeftRadius: "12px",
                  borderBottomLeftRadius: "12px",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  marginBottom: "30px",
                  marginTop: "-530px",
                  zIndex: 0,
                  position: "relative",
                }}
              >
                <div>
                  <div style={{ marginBottom: 30 }}>
                    <button
                      onClick={() => {
                        ActionLike(post.id!);
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

                  <div style={{ marginBottom: 30 }}>
                    <button
                      onClick={() => inputRef.current?.focus()}
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

                  <div style={{ marginBottom: 30 }}>
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

                  <div style={{ marginBottom: 30 }}>
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

                  <div style={{ marginBottom: 30 }}>
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

              {/* {images.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  {images.map((_, index) => (
                    <div
                      key={index}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor:
                          index === currentImageIndex
                            ? "#0095f6"
                            : "rgba(255, 255, 255, 0.5)",
                      }}
                    />
                  ))}
                </div>
              )} */}
            </div>

            <div
              style={{
                flex: "0 0 40%",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                maxHeight: window.innerWidth < 768 ? "40%" : "90vh",
                borderLeft: `1px solid${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
              }}
            >
              <div
                style={{
                  padding: "16px",
                  borderBottom: `1px solid ${
                    theme === "light"
                      ? Colors.light.colors.border
                      : Colors.dark.colors.border
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <img
                    src={imageProfile ? imageProfile?.Value : UserProfile}
                    alt={post.username}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: "600",
                        fontSize: "14px",
                        color:
                          theme === "light"
                            ? Colors.light.colors.text
                            : Colors.dark.colors.text,
                      }}
                    >
                      {post.username}
                    </div>
                    {/* {post.location && ( */}
                    {/* <div style={{ fontSize: "12px", color: "#666" }}> */}
                    {/* {post.location} */}
                    {/* San Juan, Chile */}
                    {/* </div> */}
                    {/* )} */}
                  </div>
                </div>
                {userData?.user?.id === post.idUser && (
                  <button
                    onClick={() => setOptionsModalVisible(true)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color:
                        theme === "light"
                          ? Colors.light.colors.primary
                          : Colors.dark.colors.primary,
                      fontSize: "16px",
                    }}
                  >
                    <FontAwesomeIcon icon={faEllipsis} />
                  </button>
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                }}
              >
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <img
                      src={imageProfile ? imageProfile?.Value : UserProfile}
                      alt={post.username}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          lineHeight: "1.4",
                          color: "#666",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "600",
                            marginRight: "8px",
                            color:
                              theme === "light"
                                ? Colors.light.colors.text
                                : Colors.dark.colors.text,
                          }}
                        >
                          {post.username}
                        </span>
                        {/* {post.description} */}

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
                                    style={{
                                      color: "#0095f6",
                                      cursor: "pointer",
                                    }}
                                  >
                                    {part}
                                  </span>
                                );
                              }
                              return part;
                            })}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "4px",
                        }}
                      >
                        {getElapsedTime(new Date(post.createDate!))}
                      </div>
                    </div>
                  </div>
                </div>

                {coments.length > 0 ? (
                  coments.map(renderComment)
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "60px 0",
                      color: "#666",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        textAlign: "center",
                        color:
                          theme === "light"
                            ? Colors.light.colors.text
                            : Colors.dark.colors.text,
                      }}
                    >
                      {getLabel("publicacion_no_comentarios")}
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: `1px solid ${
                    theme === "light"
                      ? Colors.light.colors.border
                      : Colors.dark.colors.border
                  }`,
                  padding: "16px",
                }}
              >
                {/* <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px" }}>
                    <button
                      onClick={() => {
                        ActionLike(publications[currentIndex].id!);
                        likePost(
                          !post.liked,
                          post.liked ? post.likes! - 1 : post.likes! + 1
                        );
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: post.liked
                          ? "#ed4956"
                          : theme === "light"
                          ? Colors.light.colors.primary
                          : Colors.dark.colors.primary,
                        fontSize: "24px",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={post.liked ? faHeart : faHeartRegular}
                      />
                    </button>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "24px",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faCommentRegular}
                        color={
                          theme === "light"
                            ? Colors.light.colors.primary
                            : Colors.dark.colors.primary
                        }
                      />
                    </button>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "24px",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faArrowTurnDown}
                        // size="lg"
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
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color:
                        theme === "light"
                          ? Colors.light.colors.primary
                          : Colors.dark.colors.primary,
                      fontSize: "24px",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={isSaved ? faBookmark : faBookmarkRegular}
                    />
                  </button>
                </div> */}
                {post.likes !== 0 && (
                  <div style={{ marginBottom: "8px" }}>
                    <div
                      style={{
                        fontWeight: "600",
                        fontSize: "14px",
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
                  </div>
                )}

                <div style={{ marginBottom: "16px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      textTransform: "uppercase",
                    }}
                  >
                    {getElapsedTime(
                      new Date(publications[currentIndex].createDate!)
                    )}
                  </span>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <input
                      ref={inputRef}
                      className="comment-textarea"
                      style={{
                        flex: 1,
                        borderRadius: "20px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        resize: "vertical",
                        minHeight: "44px",
                        maxHeight: "120px",
                        fontFamily: "inherit",
                        transition: "border-color 0.2s",
                        outline: "none",
                        border: `1px solid ${
                          theme === "light"
                            ? Colors.light.colors.inputBorder
                            : Colors.dark.colors.inputBorder
                        }`,
                        backgroundColor:
                          theme === "light"
                            ? Colors.light.colors.inputBackground
                            : Colors.dark.colors.inputBackground,
                        color:
                          theme === "light"
                            ? Colors.light.colors.text
                            : Colors.dark.colors.text,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = Colors.detailAppColor;
                        e.target.style.backgroundColor =
                          theme === "light"
                            ? Colors.light.colors.inputActiveBackground
                            : Colors.dark.colors.inputActiveBackground;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor =
                          theme === "light"
                            ? Colors.light.colors.inputBorder
                            : Colors.dark.colors.inputBorder;
                        e.target.style.backgroundColor =
                          theme === "light"
                            ? Colors.light.colors.inputBackground
                            : Colors.dark.colors.inputBackground;
                      }}
                      placeholder={getLabel("escribe_un_comentario")}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={handleKeyPress}
                      maxLength={500}
                      disabled={isSubmitting}
                      // rows={3}
                    />

                    <button
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        border: "none",
                        background:
                          newComment.trim() && !isSubmitting
                            ? Colors.detailAppColor
                            : "#e0e0e0",
                        cursor:
                          newComment.trim() && !isSubmitting
                            ? "pointer"
                            : "not-allowed",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transition: "all 0.2s",
                        fontSize: "16px",
                        opacity: isSubmitting ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (newComment.trim() && !isSubmitting) {
                          e.currentTarget.style.transform = "scale(1.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                          }}
                        >
                          ...
                        </span>
                      ) : (
                        <FontAwesomeIcon
                          icon={faPaperPlane}
                          size="lg"
                          color={
                            newComment.trim()
                              ? "#e0e0e0"
                              : Colors.detailAppColor
                          }
                        />
                      )}
                    </button>
                  </div>

                  {newComment.length > 0 && (
                    <div
                      style={{
                        fontSize: "11px",
                        textAlign: "right",
                        marginTop: "4px",
                        color: "#666",
                      }}
                    >
                      {newComment.length}/500
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <OptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        options={options}
      />

      <EditModal
        isOpen={isModalEditVisible}
        onClose={() => setModalEditVisible(false)}
        onSave={editePost}
        item={post.description!}
        title={getLabel("editar_publicacion")}
        maxLength={2200}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        idItem={post.id!}
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
          alertState.type === "danger" ? getLabel("eliminar") : "Confirmar"
        }
        cancelText={getLabel("cancelar")}
      />
    </div>
  ) : (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: isMobile ? "0" : "20px",
        overflow: isMobile ? "auto" : "visible",
      }}
    >
      <div
        style={{
          width: isMobile ? "100%" : "auto",
          height: isMobile ? "100%" : "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: isMobile ? "10px" : "15px",
            right: isMobile ? "10px" : "15px",
            background: isMobile ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
            border: "none",
            color: "white",
            borderRadius: "50%",
            width: isMobile ? "35px" : "40px",
            height: isMobile ? "35px" : "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 1001,
            fontSize: isMobile ? "16px" : "18px",
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <div
          style={{
            backgroundColor:
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background,
            borderRadius: isMobile ? "0" : "12px",
            maxWidth: isMobile ? "100%" : "1200px",
            maxHeight: isMobile ? "100vh" : "90vh",
            width: "100%",
            display: "flex",
            overflow: isMobile ? "auto" : "hidden",
            position: "relative",
            border: isMobile
              ? "none"
              : `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.border
                    : Colors.dark.colors.border
                }`,
            flexDirection: isMobile ? "column" : "row",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              width: "100%",
              minHeight: isMobile ? "50vh" : "auto",
              maxHeight: isMobile ? "60vh" : "auto",
              backgroundColor: isMobile
                ? theme === "light"
                  ? "#000"
                  : "#111"
                : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <img
              src={imagePost?.Value}
              alt={`Post by ${post.username}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                backgroundColor: isMobile ? "black" : "transparent",
              }}
            />

            {/* Botones de interacción en móvil (superpuestos) */}
            <div
              style={{
                position: "absolute",
                right: "15px",
                bottom: "100px",
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                zIndex: 10,
              }}
            >
              <button
                onClick={() => {
                  ActionLike(post.id!);
                  likePost(
                    !post.liked,
                    post.liked ? post.likes! - 1 : post.likes! + 1
                  );
                }}
                style={{
                  width: isMobile ? "45px" : "50px",
                  height: isMobile ? "45px" : "50px",
                  background: "rgba(0, 0, 0, 0.7)",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={post.liked ? faHeart : faHeartRegular}
                  size={isMobile ? "lg" : "lg"}
                  color={post.liked ? "#ed4956" : "white"}
                />
              </button>

              <button
                onClick={() => setCommentModalVisible(true)}
                style={{
                  width: isMobile ? "45px" : "50px",
                  height: isMobile ? "45px" : "50px",
                  background: "rgba(0, 0, 0, 0.7)",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={faCommentRegular}
                  size={isMobile ? "lg" : "lg"}
                  color="white"
                />
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                style={{
                  width: isMobile ? "45px" : "50px",
                  height: isMobile ? "45px" : "50px",
                  background: "rgba(0, 0, 0, 0.7)",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FontAwesomeIcon
                  icon={faArrowTurnDown}
                  size={isMobile ? "lg" : "lg"}
                  style={{
                    transform: "rotate(-90deg)",
                  }}
                  color="white"
                />
              </button>

              <button
                onClick={() => setIsRepost(!isRepost)}
                style={{
                  width: isMobile ? "45px" : "50px",
                  height: isMobile ? "45px" : "50px",
                  background: "rgba(0, 0, 0, 0.7)",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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

              <button
                onClick={() => setIsSaved(!isSaved)}
                style={{
                  width: isMobile ? "45px" : "50px",
                  height: isMobile ? "45px" : "50px",
                  background: "rgba(0, 0, 0, 0.7)",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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

          {/* Sección de información en móvil */}
          <div
            style={{
              marginTop: "10px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              maxHeight: isMobile ? "40vh" : "auto",
              overflowY: "auto",
              borderTop: `1px solid ${
                theme === "light"
                  ? Colors.light.colors.border
                  : Colors.dark.colors.border
              }`,
            }}
          >
            {publications.length > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "25px",
                }}
              >
                <button
                  onClick={handlePrevImage}
                  disabled={currentIndex === 0}
                  style={{
                    // position: "absolute",
                    // left: isMobile ? "5px" : "15px",
                    // top: "70%",
                    // transform: "translateY(-50%)",
                    background: isMobile
                      ? "rgba(0, 0, 0, 0.7)"
                      : "rgba(0, 0, 0, 0.5)",
                    border: "none",
                    color: "white",
                    borderRadius: "50%",
                    width: isMobile ? "35px" : "40px",
                    height: isMobile ? "35px" : "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                    zIndex: 1001,
                    fontSize: isMobile ? "14px" : "16px",
                    opacity: currentIndex === 0 ? 0.3 : 1,
                  }}
                >
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    style={{ fontSize: "20px" }}
                  />
                </button>
                <button
                  onClick={handleNextImage}
                  disabled={currentIndex === publications.length - 1}
                  style={{
                    // position: "absolute",
                    // right: isMobile ? "5px" : "15px",
                    // top: "65%",
                    // transform: "translateY(-50%)",
                    background: isMobile
                      ? "rgba(0, 0, 0, 0.7)"
                      : "rgba(0, 0, 0, 0.5)",
                    border: "none",
                    color: "white",
                    borderRadius: "50%",
                    width: isMobile ? "35px" : "40px",
                    height: isMobile ? "35px" : "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor:
                      currentIndex === publications.length - 1
                        ? "not-allowed"
                        : "pointer",
                    zIndex: 1001,
                    fontSize: isMobile ? "14px" : "16px",
                    opacity: currentIndex === publications.length - 1 ? 0.3 : 1,
                  }}
                >
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    style={{ fontSize: "20px" }}
                  />
                </button>
              </div>
            )}
            {/* Header con información del usuario */}
            <div
              style={{
                marginTop: "10px",
                padding: isMobile ? "12px" : "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <img
                  src={imageProfile ? imageProfile?.Value : UserProfile}
                  alt={post.username}
                  style={{
                    width: isMobile ? "36px" : "32px",
                    height: isMobile ? "36px" : "32px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: isMobile ? "15px" : "14px",
                      color:
                        theme === "light"
                          ? Colors.light.colors.text
                          : Colors.dark.colors.text,
                    }}
                  >
                    {post.username}
                  </div>
                </div>
              </div>
              {userData?.user?.id === post.idUser && (
                <button
                  onClick={() => setOptionsModalVisible(true)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color:
                      theme === "light"
                        ? Colors.light.colors.primary
                        : Colors.dark.colors.primary,
                    fontSize: isMobile ? "18px" : "16px",
                    padding: "8px",
                  }}
                >
                  <FontAwesomeIcon icon={faEllipsis} />
                </button>
              )}
            </div>

            {/* Descripción */}
            <div
              style={{
                paddingInline: "12px",
              }}
            >
              {/* Contador de likes */}
              {post.likes !== 0 && (
                <div
                  style={{
                    marginTop: "12px",
                    fontWeight: "600",
                    fontSize: isMobile ? "13px" : "14px",
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

              <div
                style={{
                  fontSize: isMobile ? "14px" : "14px",
                  lineHeight: "1.5",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    marginRight: "8px",
                  }}
                >
                  {post.username}
                </span>
                {post.description &&
                  post.description.trim() !== "" &&
                  stringDescription.map((part, index) => {
                    if (mentionRegex.test(part)) {
                      return (
                        <span
                          key={index}
                          onClick={() => handlePressMention(part)}
                          style={{
                            color: "#0095f6",
                            cursor: "pointer",
                          }}
                        >
                          {part}
                        </span>
                      );
                    }
                    return part;
                  })}
              </div>

              <div
                style={{
                  fontSize: isMobile ? "12px" : "12px",
                  color: "#666",
                  marginTop: "2px",
                }}
              >
                {getElapsedTime(new Date(post.createDate!))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CommentModal
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        publicationId={publications[currentIndex].id!}
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
        item={post.description!}
        title={getLabel("editar_publicacion")}
        maxLength={2200}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        idItem={post.id!}
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
          alertState.type === "danger" ? getLabel("eliminar") : "Confirmar"
        }
        cancelText={getLabel("cancelar")}
      />
    </div>
  );
};
