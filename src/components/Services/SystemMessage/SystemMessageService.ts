import axios from "axios";
import { MessageParams } from "../../Models/Message/MessageParams";
import { RequestModel } from "../../Models/Request/RequestModel";
import { MessageStatus } from "../../constants/Status";
import { ChatType, MessageType } from "../../constants/Types";
import userService from "../User/UserService";

type SystemMessageReceiver = {
  _id?: string;
  IdUser?: string;
  Username?: string;
  Name?: string;
  Verify?: number;
  VerifyType?: string;
  PerfilData?: {
    IdMediaDataProfile?: string;
  };
  ProfilePhoto?: string;
};

const generateUUID = () => crypto.randomUUID();

const textToBytes = (text: string) => new TextEncoder().encode(text);

const xorEncrypt = (data: Uint8Array, key: string) => {
  const keyBytes = textToBytes(key);
  const result = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ keyBytes[i % keyBytes.length];
  }

  return result;
};

const encryptMessage = (value: string, key: string, type: string) => {
  if (!value) return "";
  if (type === MessageType.AUDIO) return value;

  const valueBytes = textToBytes(value);
  const encryptedBytes = xorEncrypt(valueBytes, key);
  let binary = "";
  encryptedBytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

export class SystemMessageService {
  private async sendToReceiver(
    receiver: SystemMessageReceiver | undefined,
    messageValue: string,
    profilePhoto?: string,
  ): Promise<any> {
    const AycoroAuthSystem = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const token = localStorage.getItem("systemToken");
    const idUserReceiver = receiver?._id || receiver?.IdUser;

    if (!idUserReceiver) {
      throw new Error("Receiver user id is required to send a system message");
    }

    const authHeaders = token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined;

    const chatResponse = await AycoroAuthSystem.post(
      `/api/Chat?idUser=${idUserReceiver}`,
      undefined,
      {
        headers: authHeaders,
      },
    );
    const idChat = chatResponse.data;
    const encryptKeyResponse = await AycoroAuthSystem.get(
      `/api/Chat/EncryptKey?idChat=${idChat}`,
      {
        headers: authHeaders,
      },
    );
    const encryptKey = encryptKeyResponse.data;
    const aycoroResponse = await userService.GetUserByUsername("aycoro");
    const aycoroUser = aycoroResponse.data?.User;
    const messageType = MessageType.TEXT;

    const message: MessageParams = {
      uuid: generateUUID(),
      replayIdMessage: undefined,
      idChat,
      idUserSender: aycoroUser?._id,
      mediaDataProfileSender: aycoroResponse.data?.ProfilePhoto,
      idMediaDataProfileSender: aycoroUser?.PerfilData?.IdMediaDataProfile,
      idUserReceiver,
      mediaDataProfileReceiver: profilePhoto || receiver?.ProfilePhoto,
      idMediaDataProfileReceiver: receiver?.PerfilData?.IdMediaDataProfile,
      messageValue: encryptMessage(messageValue, encryptKey, messageType),
      usernameReceiver: receiver?.Username,
      verifyUserReceiver: receiver?.Verify,
      verifyTypeUserReceiver: receiver?.VerifyType,
      usernameSender: aycoroUser?.Username,
      verifyUserSender: aycoroUser?.Verify,
      verifyTypeUserSender: (aycoroUser as any)?.VerifyType,
      nameReceiver: receiver?.Name,
      nameSender: aycoroUser?.Name,
      nameGroup: "",
      type: messageType,
      status: MessageStatus.DRAFT,
      idMedia: undefined,
      mediaData: undefined,
      conversationType: ChatType.DIRECT,
      createDate: `${new Date()}`,
    };

    return AycoroAuthSystem.post(`api/Chat/Message`, message, {
      headers: authHeaders,
    });
  }

  async sendRequestMessage(
    request: RequestModel,
    messageValue: string,
  ): Promise<any> {
    const receiver = request.User;

    return this.sendToReceiver(
      { ...receiver, _id: request.idUser || receiver?._id },
      messageValue,
      request.ProfilePhotoUser,
    );
  }

  async sendUserMessage(
    receiver: SystemMessageReceiver,
    messageValue: string,
  ): Promise<any> {
    return this.sendToReceiver(receiver, messageValue);
  }
}

const systemMessageService = new SystemMessageService();
export default systemMessageService;
