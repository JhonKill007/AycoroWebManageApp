import { IChatService } from "../../Interface/Chat/IChatService";
import { MessageParams } from "../../Models/Message/MessageParams";
import Http from "../Http/HttpClient";

export class ChatService implements IChatService {
  async IsExist(idUser: string | undefined): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/Chat?idUser=${idUser}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async CreateGroup(Dta: [any] | undefined): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/Chat/CreateGroup `, Dta)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetCurrencyConversation(section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Chat/GetCurrencyConversation?section=${section}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetAllMessages(id: string, section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Chat?idChat=${id}&section=${section}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async getEncryptKey(idchat: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Chat/EncryptKey?idChat=${idchat}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async Save(message: MessageParams | undefined): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`api/Chat/Message`, message)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async DeleteMessage(id: string | undefined): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/Chat?id=${id}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async setChatRead(id: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/Chat/MessageRead?id=${id}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
}
const chatService = new ChatService();
export default chatService;
