import { ComentParams } from "./../../Models/Coment/ComentParams";

export interface IComentsService {
  Save(coment: ComentParams): Promise<any>;
  Update(coment: ComentParams): Promise<any>;
  GetAll(IdPost: string, section: number): Promise<any>;
  Delete(id: string): Promise<any>;
}
