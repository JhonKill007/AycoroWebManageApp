import { IScoreService } from "../../Interface/Score/IScoreService";
import Http from "../Http/HttpClient";

export class ScoreService implements IScoreService {
  async SetScore(idService: string, Score: number): Promise<any> {
    const score = {
      idUser: null,
      idItem: idService,
      value: Score,
    };

    let result = await new Promise<any>((resolve, reject) => {
      Http.post("/api/Score", score)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async UpdateScore(idService: string, Score: number): Promise<any> {
    const score = {
      idUser: null,
      idItem: idService,
      value: Score,
    };

    let result = await new Promise<any>((resolve, reject) => {
      Http.put("/api/Score", score)
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

const scoreService = new ScoreService();
export default scoreService;
