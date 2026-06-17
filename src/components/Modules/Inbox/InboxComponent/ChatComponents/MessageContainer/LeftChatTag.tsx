import { useEffect, useState } from "react";
import { MessageType } from "../../../../../constants/Types";
import { useBanksContext } from "../../../../../context/BanksContext";
import { useImageBankContext } from "../../../../../context/ImageBankContext";
import { useUserContext } from "../../../../../context/UserContext";
import useEncryptHook from "../../../../../hooks/useEncryptHook";
import useGetHour from "../../../../../hooks/useHourHook";
import useLanguage from "../../../../../hooks/useLanguage";
import { MediaDataModel } from "../../../../../Models/MediaData/MediaDataModel";
import { PostModel } from "../../../../../Models/Post/PostModel";
import { ServiceModel } from "../../../../../Models/Service/ServiceModel";
import { UserPerfilModel } from "../../../../../Models/User/UserPerfilModel";
import postService from "../../../../../Services/Post/PostService";
import serviceService from "../../../../../Services/Service/ServiceService";
import PublicationModalView from "../../../../Modals/PublicationModalView";

interface ILeftChatTag {
  message: string;
  createDate: Date;
  user: UserPerfilModel;
  type: string;
  idMedia: string | undefined;
  encryptKey: string;
}

const LeftChatTag = ({
  message,
  createDate,
  user,
  type,
  idMedia,
  encryptKey,
}: ILeftChatTag) => {
  const { getLabel } = useLanguage();
  const { getElapsedTime } = useGetHour();
  const { userData } = useUserContext();
  const { Desencrypt } = useEncryptHook();
  const [decryptedMessage, setDecryptedMessage] = useState<string>("");
  const { searchImage } = useImageBankContext();
  const { saveService, savePost } = useBanksContext();
  const [mediaData, setMediaData] = useState<MediaDataModel>();
  const [imageProfile, setImageProfile] = useState<MediaDataModel>();
  const [publication, setPublication] = useState<PostModel>();
  const [service, setService] = useState<ServiceModel>();
  const [isVisiblePublicationModalView, setVisiblePublicationModalView] =
    useState<boolean>(false);

  useEffect(() => {
    const decryptMessage = async () => {
      if (message && encryptKey) {
        const result = Desencrypt(message, encryptKey, type);
        setDecryptedMessage(result);
      }
    };

    decryptMessage();
  }, [message, Desencrypt, encryptKey]);

  useEffect(() => {
    if (idMedia) {
      if (type == MessageType.IMAGE || type == MessageType.AUDIO) {
        fetchImages(idMedia);
      }
      if (type == MessageType.PUBLICATION) {
        getPost(idMedia);
      }
      if (type == MessageType.SERVICE) {
        getService(idMedia);
      }
    }
  }, [message]);

  const fetchImages = async (id: string) => {
    try {
      const [MediaData] = await Promise.all([searchImage(id)]);
      setMediaData(MediaData!);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const fetchProfileImages = async (id: string) => {
    try {
      const [profileImage] = await Promise.all([searchImage(id)]);
      setImageProfile(profileImage);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const getPost = async (id: string) => {
    postService
      .GetById(id)
      .then((e: any) => {
        if (e.data) {
          setPublication(e.data);
          savePost(e.data);
          fetchImages(e.data?.idMediaData);
          if (userData?.user?.id !== e.data?.idUser) {
            fetchProfileImages(e.data?.idMediaDataProfile);
          } else {
            const imageProfile: MediaDataModel = {
              _id: "",
              Value: userData?.profilePhoto,
              Type: "IMAGE",
            };
            setImageProfile(imageProfile);
          }
        }
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const getService = async (id: string) => {
    serviceService
      .GetById(id)
      .then((e: any) => {
        if (e.data) {
          setService(e.data);
          saveService(e.data);
          fetchImages(e.data?.idMediaData);
        }
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const updatePublication = (
    id: string,
    updates: Partial<
      Pick<PostModel, "description" | "status" | "likes" | "comments" | "liked">
    >
  ) => {
    if (publication?.id === id) {
      setPublication((prev) => ({ ...prev!, ...updates }));
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: "16px",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            maxWidth: "65%",
            backgroundColor: "white",
            color: "#262626",
            padding: "12px 16px",
            borderTopLeftRadius: "18px",
            borderTopRightRadius: "18px",
            borderBottomRightRadius: "18px",
            border: "1px solid #e0e0e0",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            position: "relative",
          }}
        >
          {/* Mensaje de imagen */}
          {type == MessageType.IMAGE && (
            <div>
              {mediaData && (
                <img
                  src={mediaData.Value}
                  // alt="Imagen compartida"
                  style={{
                    maxWidth: "300px",
                    borderRadius: "12px",
                    marginBottom: "8px",
                  }}
                />
              )}
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    opacity: 0.7,
                  }}
                >
                  {message.timestamp}
                </span>
                {message.senderId === "current" &&
                  getMessageStatusIcon(message.status)}
              </div> */}
            </div>
          )}

          {/* Mensaje de audio */}
          {type == MessageType.AUDIO && mediaData && (
            <audio controls>
              <source src={mediaData.Value} type="audio/mpeg" />
              {getLabel("navegador_no_audio")}
            </audio>
          )}
          {/* {message.type === "audio" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: "200px",
              }}
            >
              <button
                onClick={() => toggleAudio(message.id, message.content)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "inherit",
                  fontSize: "12px",
                }}
              >
                <FontAwesomeIcon
                  icon={audioPlayer[message.id] ? faPause : faPlay}
                />
              </button>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: "4px",
                    backgroundColor: "rgba(255,255,255,0.3)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: audioPlayer[message.id] ? "60%" : "0%",
                      height: "100%",
                      backgroundColor: "currentColor",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "60px",
                }}
              >
                <span style={{ fontSize: "12px" }}>
                  {message.duration
                    ? formatRecordingTime(message.duration)
                    : "0:00"}
                </span>
                {message.senderId === "current" &&
                  getMessageStatusIcon(message.status)}
              </div>
            </div>
          )} */}

          {/* Mensaje de ubicación */}
          {/* {message.type === "location" && message.locationData && (
            <div
              style={{
                textAlign: "center",
                minWidth: "250px",
              }}
            >
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                style={{
                  fontSize: "32px",
                  marginBottom: "12px",
                  color: "#ef4444",
                }}
              />
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                📍 Ubicación compartida
              </div>
              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.9,
                  marginBottom: "12px",
                }}
              >
                {message.locationData.name}
              </div>
              {message.locationData.address && (
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    marginBottom: "12px",
                  }}
                >
                  {message.locationData.address}
                </div>
              )}
              <button
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "inherit",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Ver en mapa
              </button>
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    opacity: 0.7,
                  }}
                >
                  {message.timestamp}
                </span>
                {message.senderId === "current" &&
                  getMessageStatusIcon(message.status)}
              </div>
            </div>
          )} */}

          {/* Mensaje de publicación */}
          {type == MessageType.PUBLICATION && (
            <div
              onClick={() => setVisiblePublicationModalView(true)}
              style={{
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "12px",
                overflow: "hidden",
                minWidth: "280px",
              }}
            >
              {mediaData && (
                <img
                  src={mediaData.Value}
                  // alt="Publicación compartida"
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
              )}
              <div style={{ padding: "12px" }}>
                {/* <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.8,
                    marginBottom: "6px",
                  }}
                >
                  Publicación de @{message.postData.username}
                </div> */}
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.4",
                    marginBottom: "12px",
                  }}
                >
                  {publication?.description}
                </div>
                {/* <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                    paddingTop: "8px",
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>
                    ❤️ {message.postData.likes} • 💬 {message.postData.comments}
                  </div>
                </div> */}
                {/* <div
                  style={{
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "none",
                      color: "inherit",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      flex: 1,
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    Me gusta
                  </button>
                  <button
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "none",
                      color: "inherit",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      flex: 1,
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesomeIcon icon={faShare} />
                    Compartir
                  </button>
                </div> */}
              </div>
              {/* <div
                style={{
                  padding: "8px 12px",
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    opacity: 0.7,
                  }}
                >
                  {getElapsedTime(new Date(createDate))}
                </span>
                {message.senderId === "current" &&
                  getMessageStatusIcon(message.status)}
              </div> */}
            </div>
          )}

          {/* Mensaje de texto */}
          {(type === MessageType.TEXT ||
            type === MessageType.IMAGE ||
            type === MessageType.PUBLICATION) &&
          message ? (
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.4",
                  marginBottom: "4px",
                }}
              >
                {decryptedMessage}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    opacity: 0.7,
                  }}
                >
                  {getElapsedTime(new Date(createDate))}
                </span>
                {/* {message.senderId === "current" &&
                  getMessageStatusIcon(message.status)} */}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {isVisiblePublicationModalView && (
        <PublicationModalView
          setModalVisible={setVisiblePublicationModalView}
          isModalVisible={isVisiblePublicationModalView}
          index={0}
          setIndex={() => {}}
          publications={[publication!]}
          setPublications={updatePublication}
        />
      )}
    </>
  );
};

export default LeftChatTag;
