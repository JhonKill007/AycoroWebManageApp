import { ComentParams } from "../../Models/Coment/ComentParams";
import Http from "../Http/HttpClient";
import { IComentsService } from "./../../Interface/Coments/IComentsService";

export class ComentService implements IComentsService {
  async Delete(id: string): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.delete(`/api/Coment?id=${id}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async Save(coment: ComentParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post("/api/Coment", coment)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async Update(coment: ComentParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put("/api/Coment", coment)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetAll(IdPost: string, section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Coment/GetAll?IdPost=${IdPost}&section=${section}`)
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

const comentService = new ComentService();
export default comentService;
