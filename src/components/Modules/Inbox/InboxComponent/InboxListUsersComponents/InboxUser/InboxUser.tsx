import { faCamera, faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GroupProfile from "../../../../../assets/GroupProfile.jpeg";
import UserProfile from "../../../../../assets/UserProfile.jpeg";
import { useHubsContext } from "../../../../../context/HubsContext";
import { useImageBankContext } from "../../../../../context/ImageBankContext";
import { useThemeContext } from "../../../../../context/ThemeContext";
import useEncryptHook from "../../../../../hooks/useEncryptHook";
import useGetHour from "../../../../../hooks/useHourHook";
import { MediaDataModel } from "../../../../../Models/MediaData/MediaDataModel";
import { CurrencyConversation } from "../../../../../Models/Message/CurrencyConversation";
import chatService from "../../../../../Services/Chat/ChatService";

import { faImage } from "@fortawesome/free-regular-svg-icons";
import { Colors } from "../../../../../constants/Colors";
import { ChatType, MessageType } from "../../../../../constants/Types";
import { useUserContext } from "../../../../../context/UserContext";
import useLanguage from "../../../../../hooks/useLanguage";
import "./InboxUser.css";

interface ICurrencyConversation {
  conversation: CurrencyConversation;
  setRead: Function;
}

const InboxUser = ({ conversation }: ICurrencyConversation) => {
  const navigate = useNavigate();
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  const { userData } = useUserContext();
  const { usersConnecting } = useHubsContext();
  const { Desencrypt } = useEncryptHook();
  const { searchImage } = useImageBankContext();
  const { getElapsedTime, formatDuration } = useGetHour();
  const [decryptedMessage, setDecryptedMessage] = useState<string>("");
  const [userProfilePhoto, setuserProfilePhoto] = useState<MediaDataModel>();

  const active = conversation.type === ChatType.DIRECT
    ? usersConnecting.includes(conversation.username, 0)
    : false;

  useEffect(() => {
    const fetchImages = async () => {
      if (conversation.idMediaDataProfile) {
        try {
          const [profileMediaData] = await Promise.all([
            searchImage(conversation.idMediaDataProfile),
          ]);
          setuserProfilePhoto(profileMediaData!);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [conversation, searchImage]);

  useEffect(() => {
    const decryptMessage = async () => {
      if (conversation) {
        let encryptKey = await chatService.getEncryptKey(conversation.idChat!);

        if (conversation.messageValue && encryptKey) {
          const result = Desencrypt(
            conversation.messageValue,
            encryptKey.data,
            conversation.messageType!
          );
          setDecryptedMessage(result);
        }
      }
    };

    decryptMessage();
  }, [conversation, Desencrypt]);

  return (
    <div
      onClick={() =>
        conversation.type === ChatType.DIRECT
          ? navigate(`/Inbox/${conversation.username}`)
          : navigate(`/Inbox/Group/${conversation.idChat}`)
      }
      style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: `1px solid ${
          theme === "light"
            ? Colors.light.colors.border
            : Colors.dark.colors.border
        }`,
        cursor: "pointer",
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
        transition: "background-color 0.2s",
        position: "relative",
      }}
    >
      {/* Avatar con indicador online */}
      <div style={{ position: "relative", marginRight: "16px" }}>
        <img
          src={
            conversation.type === ChatType.DIRECT
              ? userProfilePhoto
                ? userProfilePhoto.Value
                : UserProfile
              : GroupProfile
          }
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            objectFit: "cover",
            // border:
            //   conversation.unreadCount > 0
            //     ? "2px solid #0095f6"
            //     : "2px solid transparent",
          }}
          alt=""
        />
        {active && (
          <div
            style={{
              position: "absolute",
              bottom: "4px",
              right: "4px",
              width: "14px",
              height: "14px",
              backgroundColor: "#4ade80",
              border: "2px solid white",
              borderRadius: "50%",
            }}
          />
        )}
        {/* {conversation.user.isVerified && (
          <div
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "18px",
              height: "18px",
              backgroundColor: "#0095f6",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faCheck}
              style={{ color: "white", fontSize: "10px" }}
            />
          </div>
        )} */}
      </div>

      {/* Información de la conversación */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: "600",
                color:
                  theme === "light"
                    ? Colors.light.colors.text
                    : Colors.dark.colors.text,
              }}
            >
              {conversation.type === ChatType.DIRECT
                ? conversation.name
                : conversation.nameGroup}
            </h3>
            {/* {conversation.isMuted && (
              <FontAwesomeIcon
                icon={faVolumeMute}
                style={{ color: "#8e8e8e", fontSize: "12px" }}
              />
            )} */}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* {conversation.isPinned && (
              <FontAwesomeIcon
                icon={faStar}
                style={{ color: "#0095f6", fontSize: "12px" }}
              />
            )} */}
            <span
              style={{
                fontSize: "12px",
                color: "#666",
                fontWeight: "400",
              }}
            >
              {getElapsedTime(new Date(conversation.createDate!))}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "gray",
              fontWeight: conversation.unReadMessages! > 0 ? "600" : "400",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "200px",
            }}
          >
            {conversation?.idMessageOwner === userData?.user?.id &&
              `${getLabel("tu")}: `}
            {conversation?.messageType === MessageType.AUDIO && (
              <>
                <FontAwesomeIcon
                  style={{ marginRight: "6px" }}
                  icon={faMicrophone}
                />
                {`${getLabel("audio")} ${formatDuration(
                  Number(conversation?.messageValue)
                )}`}
              </>
            )}
            {conversation?.messageType === MessageType.IMAGE && (
              <>
                <FontAwesomeIcon
                  style={{ marginRight: "6px" }}
                  icon={faCamera}
                />
                {!decryptedMessage && getLabel("imagen")}
              </>
            )}
            {/* {conversation.lastMessage.type === "location" && "📍 Ubicación"} */}
            {conversation?.messageType === MessageType.PUBLICATION && (
              <>
                <FontAwesomeIcon
                  style={{ marginRight: "6px" }}
                  icon={faImage}
                />
                {!decryptedMessage && getLabel("publicacion")}
              </>
            )}
            {decryptedMessage}
          </p>

          {conversation.unReadMessages! > 0 && (
            <div
              style={{
                backgroundColor: "#0095f6",
                color: "white",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "600",
                flexShrink: 0,
              }}
            >
              {conversation.unReadMessages}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxUser;
