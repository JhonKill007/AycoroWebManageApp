import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MediaDataModel } from "../../../../Models/MediaData/MediaDataModel";
import { MessagesModel } from "../../../../Models/Message/MessagesModel";
import { UserPerfilModel } from "../../../../Models/User/UserPerfilModel";
import UserProfile from "../../../../assets/UserProfile.jpeg";
import IconVerify from "../../../../assets/img/verified-badge-profile-icon-png.webp";
import { useHubsContext } from "../../../../context/HubsContext";
import { useImageBankContext } from "../../../../context/ImageBankContext";
import { useThemeContext } from "../../../../context/ThemeContext";

import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import chatService from "../../../../Services/Chat/ChatService";
import User from "../../../../Services/User/UserService";
import { Colors } from "../../../../constants/Colors";
import { VerificationStatus } from "../../../../constants/Status";
import { useUserContext } from "../../../../context/UserContext";
import useLanguage from "../../../../hooks/useLanguage";
import "./Chat.css";
import BandejaChatStart from "./MessageContainer/BandejaChatStart";
import MessageContainer from "./MessageContainer/MessageContainer";
import SendMessageForm from "./SendMessageForm/SendMessageForm";

interface IChat {
  setchatPlease: Function;
}

const Chat = ({ setchatPlease }: IChat) => {
  let { username } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  const { userData } = useUserContext();
  const { usersConnecting, lastMessage } = useHubsContext();
  const { searchImage } = useImageBankContext();
  const [messages, setMessages] = useState<MessagesModel[]>([]);
  const [conversationSelect, setConversationSelect] = useState<boolean>(false);
  const [user, setUser] = useState<UserPerfilModel>();
  const [idChat, setIdChat] = useState<string | undefined>();
  const [chatEncryptKey, setChatEncryptKey] = useState<string | undefined>(
    undefined
  );
  const [userProfilePhoto, setuserProfilePhoto] = useState<MediaDataModel>();

  useEffect(() => {
    if (username === userData?.user?.id) {
      navigate(`/Inbox`);
    }
    if (username !== undefined) {
      setConversationSelect(true);
    } else {
      setConversationSelect(false);
    }
  }, [username, navigate]);

  useEffect(() => {
    if (username !== undefined) {
      GetUser(username);
    }
  }, [username]);

  useEffect(() => {
    const fetchImages = async () => {
      if (user?.User?.PerfilData?.IdMediaDataProfile) {
        try {
          const [profileMediaData] = await Promise.all([
            searchImage(user?.User?.PerfilData?.IdMediaDataProfile!),
          ]);
          setuserProfilePhoto(profileMediaData!);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [user, searchImage]);

  const GetUser = async (username: string) => {
    try {
      const e = await User.GetUserByUsername(username);
      if (e.status === 200) {
        const user: UserPerfilModel = {
          User: {
            _id: e.data._id,
            Name: e.data.Name,
            Username: e.data.Username,
            Email: e.data.Email,
            Password: undefined,
            Phone: e.data.Phone,
            Birthday: e.data.Birthday,
            Gender: e.data.Gender,
            Status: e.data.Status,
            Verify: e.data.Verify,
            Validate: e.data.Validate,
            PerfilData: {
              Presentation: e.data.PerfilData.Presentation,
              IdMediaDataProfile: e.data.PerfilData.IdMediaDataProfile,
            },
            CreateDate: new Date(e.data.CreateDate),
          },
          ProfilePhoto: e.data.ProfilePhoto,
          Followings: e.data.Followings,
          Followers: e.data.Followers,
          Post: e.data.Post,
        };
        setUser(user);
        IsExist(e.data.id);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const IsExist = (id: string) => {
    chatService
      .IsExist(id)
      .then((res: any) => {
        setIdChat(res.data);
        getEncryptKey(res.data);
      })
      .catch((e: any) => {
        console.error(e);
      });
  };

  const active = usersConnecting.find(
    (element: string) => element === username
  );

  const getEncryptKey = async (idChat: string) => {
    let encryptKey = await chatService.getEncryptKey(idChat);
    setChatEncryptKey(encryptKey.data);
  };

  useEffect(() => {
    if (lastMessage && lastMessage.idChat === idChat) {
      setMessages((prevMessages) => {
        const alreadyExists = prevMessages.some(
          (msg) =>
            new Date(`${msg.createDate}`).getTime() ===
            new Date(`${lastMessage.createDate}`).getTime()
        );
        if (alreadyExists) return prevMessages;

        const newMessage: MessagesModel = {
          id: undefined,
          idChat: lastMessage.idChat,
          idUser: lastMessage.idUserSender,
          messageValue: lastMessage.messageValue,
          type: lastMessage.type,
          idMedia: lastMessage.idMedia,
          isActive: undefined,
          isRead: false,
          createDate: new Date(lastMessage.createDate!),
        };

        return [...prevMessages, newMessage];
      });
    }
  }, [lastMessage, idChat]);

  useEffect(() => {
    if (idChat !== undefined) {
      setMessages([]);
      GetMessages(idChat, 1);
    }
  }, [idChat]);

  const GetMessages = (id: string | undefined, section: number) => {
    chatService
      .GetAllMessages(id!, section)
      .then((res: any) => {
        setMessages((prevMessages) => [...res.data, ...prevMessages]);
      })
      .catch((e: any) => {
        console.log(e);
      });
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
        minWidth: 0,
      }}
    >
      {conversationSelect ? (
        <>
          {/* Header del chat */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: `1px solid ${
                theme === "light"
                  ? Colors.light.colors.border
                  : Colors.dark.colors.border
              }`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor:
                theme === "light"
                  ? Colors.light.colors.background
                  : Colors.dark.colors.background,
            }}
          >
            <div
              onClick={() => {
                navigate(`/${username}`);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={userProfilePhoto ? userProfilePhoto.Value : UserProfile}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      right: "2px",
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#4ade80",
                      border: "2px solid white",
                      borderRadius: "50%",
                    }}
                  />
                )}
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "gray",
                    }}
                  >
                    {user?.User?.Name}
                  </h2>
                  {/* {selectedConversation.user.isVerified && (
                    <FontAwesomeIcon
                      icon={faCheck}
                      style={{ color: "#0095f6", fontSize: "14px" }}
                    />
                  )} */}

                  {user?.User?.Verify == VerificationStatus.VERIFIED && (
                    <img src={IconVerify} style={{ width: "15px" }} alt="" />
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: active ? "#4ade80" : "#8e8e8e",
                  }}
                >
                  {active && getLabel("en_linea")}
                  {/* // : selectedConversation.user.lastSeen */}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {/* <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "gray",
                  fontSize: "18px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <FontAwesomeIcon icon={faPhone} />
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "gray",
                  fontSize: "18px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <FontAwesomeIcon icon={faVideo} />
              </button> */}
              <button
                onClick={() => {
                  navigate(`/${username}`);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "gray",
                  fontSize: "18px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                }}
                // onMouseEnter={(e) => {
                //   e.currentTarget.style.backgroundColor = "#f8f9fa";
                // }}
                // onMouseLeave={(e) => {
                //   e.currentTarget.style.backgroundColor = "transparent";
                // }}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
              </button>
            </div>
          </div>

          <MessageContainer
            user={user}
            messages={messages}
            idChat={idChat}
            setMessages={setMessages}
            encryptKey={chatEncryptKey!}
          />

          <SendMessageForm
            user={user}
            idChat={idChat}
            encryptKey={chatEncryptKey!}
          />
        </>
      ) : (
        <BandejaChatStart />
      )}
    </div>
  );
};

export default Chat;
