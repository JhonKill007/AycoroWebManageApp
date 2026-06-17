import axios from "axios";
import { MessageParams } from "../../Models/Message/MessageParams";
import { RequestModel } from "../../Models/Request/RequestModel";
import { MessageStatus } from "../../constants/Status";
import { ChatType, MessageType } from "../../constants/Types";
import userService from "../User/UserService";

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
  async sendRequestMessage(
    request: RequestModel,
    messageValue: string,
  ): Promise<any> {
    const AycoroAuthSystem = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const token = localStorage.getItem("systemToken");
    const receiver = request.User;
    const idUserReceiver = request.idUser || receiver?._id;

    if (!idUserReceiver) {
      throw new Error("Request user id is required to send a system message");
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
      mediaDataProfileReceiver: request.ProfilePhotoUser,
      idMediaDataProfileReceiver: receiver?.PerfilData?.IdMediaDataProfile,
      messageValue: encryptMessage(messageValue, encryptKey, messageType),
      usernameReceiver: receiver?.Username,
      verifyUserReceiver: receiver?.Verify,
      verifyTypeUserReceiver: (receiver as any)?.VerifyType,
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
}

const systemMessageService = new SystemMessageService();
export default systemMessageService;
