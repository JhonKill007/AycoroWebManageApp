import { HttpTransportType, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CurrencyConversation } from "../Models/Message/CurrencyConversation";
import { MessageParams } from "../Models/Message/MessageParams";
import { NotificationModel } from "../Models/Notification/NotificationModel";
import {
  LiveActivity,
  normalizeLiveActivity,
} from "../Models/Live/LiveActivity";
import chatService from "../Services/Chat/ChatService";
import { useUserContext } from "./UserContext";

const chatUrl = process.env.REACT_APP_CHAT_URL || "https://api.aycoro.com/aycoroHubs";
const MAX_LIVE_ACTIVITIES = 40;

interface HubsContextProps {
  JoinApp: (Id: string, User: string) => void;
  usersConnecting: any[];
  lastMessage: MessageParams | undefined;
  lastNotify: NotificationModel | undefined;
  liveActivities: LiveActivity[];
  closeConnection: () => void;
  isActive: () => void;
  currencyConversations: CurrencyConversation[];
  updateCurrencyConversations: (id: string) => void;
  GetCurrencyConversation: (section: number) => void;
}

const HubsContext = createContext<HubsContextProps | undefined>(undefined);

interface HubsProviderProps {
  children: ReactNode;
}

export const HubsProvider: React.FC<HubsProviderProps> = ({ children }) => {
  const connectionRef = useRef<any>();
  const [connection, setConnection] = useState<any>();
  const [usersConnecting, setUsers] = useState<any>([]);
  const [lastMessage, setLastMessage] = useState<MessageParams>();
  const [lastNotify, setLastNotify] = useState<NotificationModel>();
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [currencyConversations, setcurrencyConversations] = useState<
    CurrencyConversation[]
  >([]);

  const { userData } = useUserContext();

  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.idUserSender === userData?.user?.id) {
      addNewCurrency(lastMessage.idMediaDataProfileReceiver!);
    } else if (lastMessage.idUserReceiver === userData?.user?.id) {
      addNewCurrency(lastMessage.idMediaDataProfileSender!);
    }
  }, [lastMessage]);

  const JoinApp = async (Id: string, User: string) => {
    try {
      const joinPayload = {
        Id,
        User,
        DeviceOS: "manage",
      };

      if (connectionRef.current) {
        try {
          await connectionRef.current.stop();
        } catch (error) {
          console.log(error);
        }
        connectionRef.current = undefined;
      }

      const connection = new HubConnectionBuilder()
        .withUrl(chatUrl, {
          transport:
            HttpTransportType.WebSockets | HttpTransportType.LongPolling,
          accessTokenFactory: () =>
            localStorage.getItem("aycoroAuthToken") ?? "",
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      connection.on("ReceiveNewChat", async (idChat: string) => {
        await connection.invoke("JoinChat", idChat);
      });

      connection.on("ActiveUsers", (users: any) => {
        setUsers(users);
      });

      connection.on("ReceiveMessage", (message: MessageParams) => {
        setLastMessage(message);
      });

      connection.on("ReceiveLiveActivity", (activity: any) => {
        const normalized = normalizeLiveActivity(activity);
        setLiveActivities((prev) =>
          [normalized, ...prev.filter((item) => item.id !== normalized.id)].slice(
            0,
            MAX_LIVE_ACTIVITIES,
          ),
        );
      });

      connection.onclose((e: any) => {
        setConnection("");
        setUsers([]);
      });

      connection.onreconnected(async () => {
        await connection.invoke("JoinApp", joinPayload);
        await connection.invoke("JoinManage");
      });

      await connection.start();
      await connection.invoke("JoinApp", joinPayload);
      await connection.invoke("JoinManage");

      GetCurrencyConversation(1);
      connectionRef.current = connection;
      setConnection(connection);
    } catch (e) {
      console.log(e);
    }
  };

  const closeConnection = async () => {
    try {
      const currentConnection = connectionRef.current ?? connection;
      if (!currentConnection) return;
      currentConnection.off("ReceiveMessage");
      currentConnection.off("ReceiveNewChat");
      currentConnection.off("ReceiveNotify");
      currentConnection.off("ReceiveLiveActivity");
      currentConnection.off("ActiveUsers");
      await currentConnection.stop();
      connectionRef.current = undefined;
    } catch (e) {
      console.log(e);
    }
  };

  const isActive = () => {
    // if (!usersConnecting.includes(userData?.user?.username, 0)) {
    //   JoinApp(userData?.user?.id!, userData?.user?.username!);
    // }
  };

  const GetCurrencyConversation = (section: number) => {
    chatService
      .GetCurrencyConversation(section)
      .then((res: any) => {
        setcurrencyConversations(res.data);
      })
      .catch((e: any) => {
        console.log(e);
      });
  };

  const addNewCurrency = (id: string) => {
    const newCurrency: CurrencyConversation = {
      idChat: lastMessage!.idChat,
      nameGroup: "",
      name: lastMessage!.nameGroup
        ? lastMessage!.nameGroup
        : lastMessage!.idUserSender === userData?.user?.id
        ? lastMessage!.nameReceiver
        : lastMessage!.nameSender,
      username:
        lastMessage!.idUserSender === userData?.user?.id
          ? lastMessage!.usernameReceiver
          : lastMessage!.usernameSender,
      verify:
        lastMessage!.idUserSender === userData?.user?.id
          ? lastMessage!.verifyUserReceiver
          : lastMessage!.verifyUserSender,
      type: lastMessage!.conversationType,
      messageType: lastMessage?.type,
      isRead: lastMessage!.idUserSender === userData?.user?.id ? true : false,
      unReadMessages:
        lastMessage?.idUserSender != userData?.user?.id
          ? currencyConversations.find((c) => c.idChat === lastMessage!.idChat)
              ?.unReadMessages! + 1 || 1
          : 0,
      idMediaDataProfile: id,
      profilePhoto: "",
      idMessageOwner: lastMessage?.idUserSender,
      messageValue: lastMessage!.messageValue,
      createDate: lastMessage!.createDate,
    };

    setcurrencyConversations((prev) => [
      newCurrency,
      ...prev.filter((cr) => cr.idChat !== lastMessage!.idChat),
    ]);
  };

  const updateCurrencyConversations = (id: string) => {
    setcurrencyConversations((prevCC) =>
      prevCC.map((c) =>
        c.idChat === id
          ? {
              ...c,
              isRead: true,
              unReadMessages: 0,
            }
          : c
      )
    );
  };

  return (
    <HubsContext.Provider
      value={{
        JoinApp,
        usersConnecting,
        lastMessage,
        closeConnection,
        isActive,
        lastNotify,
        liveActivities,
        currencyConversations,
        updateCurrencyConversations,
        GetCurrencyConversation,
      }}
    >
      {children}
    </HubsContext.Provider>
  );
};

export const useHubsContext = (): HubsContextProps => {
  const context = useContext(HubsContext);
  if (!context) {
    throw new Error("HubsContext debe ser utilizado dentro de un HubsProvider");
  }
  return context;
};
