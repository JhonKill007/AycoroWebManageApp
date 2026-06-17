import { MessageParams } from "../../Models/Message/MessageParams";

export interface IChatService {
  IsExist(idUser: string | undefined): Promise<any>;
  CreateGroup(Dta: [any] | undefined): Promise<any>;
  GetCurrencyConversation(section: number): Promise<any>;
  GetAllMessages(id: string, section: number): Promise<any>;
  Save(Dta: MessageParams | undefined): Promise<any>;
  DeleteMessage(id: string | undefined): Promise<any>;
  setChatRead(id: string): Promise<any>;
  getEncryptKey(idchat: string): Promise<any>;
}
