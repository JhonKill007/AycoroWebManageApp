import React, { useEffect, useState } from "react";
import { Colors } from "../../../../../constants/Colors";
import { useThemeContext } from "../../../../../context/ThemeContext";
import { useUserContext } from "../../../../../context/UserContext";
import useLanguage from "../../../../../hooks/useLanguage";
import { MessagesModel } from "../../../../../Models/Message/MessagesModel";
import { UserPerfilModel } from "../../../../../Models/User/UserPerfilModel";
import ChargerSlice from "../../../../ChargerSlice/ChargerSlice";
import LeftChatTag from "./LeftChatTag";
import "./MessageContainer.css";
import RightChatTag from "./RightChatTag";

interface IMessageContainer {
  user: UserPerfilModel | undefined;
  messages?: any;
  idChat: string | undefined;
  setMessages: Function;
  encryptKey: string;
}
const MessageContainer = ({
  user,
  messages,
  idChat,
  setMessages,
  encryptKey,
}: IMessageContainer) => {
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  const messageRef = React.createRef<HTMLInputElement>();
  const { userData } = useUserContext();
  const [isLoading, setisLoading] = useState<boolean>(false);

  useEffect(() => {
    if (messageRef && messageRef.current) {
      const { scrollHeight, clientHeight } = messageRef.current;
      messageRef.current.scrollTo({
        left: 0,
        top: scrollHeight - clientHeight,
        behavior: "smooth",
      });
    }
  }, [messages, messageRef]);

  useEffect(() => {
    document.title = `${process.env.REACT_APP_TITTLE_BASE} • ${getLabel(
      "chat"
    )} (${user?.User?.Username})`;
    return () => {
      document.title = `${process.env.REACT_APP_TITTLE_BASE}`;
    };
  }, [user]);

  return (
    <>
      <style>
        {`
          /* Scrollbar styling */
          .scroll::-webkit-scrollbar {
            width: 6px;
          }  
          .scroll::-webkit-scrollbar-track {
            background: ${
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background
            };
            border-radius: 3px;
          }  
          .scroll::-webkit-scrollbar-thumb {
            background: ${Colors.detailAppColor};
            border-radius: 3px;
          }  
          .scroll::-webkit-scrollbar-thumb:hover {
            background: ${Colors.detailAppColor};
          }  
      `}
      </style>
      <div
        className="scroll"
        ref={messageRef}
        style={{
          flex: 1,
          padding: "24px",
          overflowY: "auto",
          backgroundColor:
            theme === "light"
              ? Colors.light.colors.background
              : Colors.dark.colors.background,
          // backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23dbdbdb' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "#8e8e8e",
            }}
          >
            {!idChat || (isLoading && <ChargerSlice />)}
          </div>
        ) : (
          <>
            {idChat &&
              messages.map((m: MessagesModel, index: number) => {
                if (m.idChat === idChat) {
                  return (
                    <div key={index}>
                      {m.idUser === userData?.user?.id ? (
                        <RightChatTag
                          message={m.messageValue!}
                          createDate={new Date(m.createDate!)}
                          type={m.type!}
                          idMedia={m.idMedia}
                          encryptKey={encryptKey}
                        />
                      ) : (
                        <LeftChatTag
                          message={m.messageValue!}
                          createDate={new Date(m.createDate!)}
                          user={user!}
                          type={m.type!}
                          idMedia={m.idMedia}
                          encryptKey={encryptKey}
                        />
                      )}
                    </div>
                  );
                }
              })}
          </>
        )}
      </div>
    </>
  );
};

export default MessageContainer;
