import Http from "../Http/HttpClient";
import { ILikeService } from "./../../Interface/Like/ILikeService";

export class LikeService implements ILikeService {
  async setServiceLike(idService: string): Promise<any> {
    const likeparams = {
      idItem: idService,
      iduser: null,
    };
    let result = await new Promise<any>((resolve, reject) => {
      Http.post("/api/Like/SetServiceLike", likeparams)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async RemoveServiceLike(idService: string): Promise<any> {
    const likeparams = {
      idItem: idService,
      iduser: null,
    };
    let result = await new Promise<any>((resolve, reject) => {
      Http.delete("/api/Like/DeleteServiceLike", { data: likeparams })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async setHistoryLike(idhistory: string): Promise<any> {
    const likeparams = {
      idItem: idhistory,
      iduser: null,
    };
    let result = await new Promise<any>((resolve, reject) => {
      Http.post("/api/Like/SetHistoryLike", likeparams)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async RemoveHistoryLike(idhistory: string): Promise<any> {
    const likeparams = {
      idItem: idhistory,
      iduser: null,
    };
    
    let result = await new Promise<any>((resolve, reject) => {
      Http.delete("/api/Like/DeleteHistoryLike", { data: likeparams })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async setLikeComent(idComent: string): Promise<any> {
    const likeparams = {
      idItem: idComent,
      iduser: null,
    };
    let result = await new Promise<any>((resolve, reject) => {
      Http.post("/api/Like/setComentLike", likeparams)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async RemoveLikeComent(idComent: string): Promise<any> {
    const likeparams = {
      idItem: idComent,
      iduser: null,
    };
    let result = await new Promise<any>((resolve, reject) => {
      Http.delete("/api/Like/DeleteComentLike", { data: likeparams })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  GetLikeComentUsers(idcoment: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async Setlike(idPost: string): Promise<any> {
    const likeparams = {
      idItem: idPost,
      iduser: null,
    };
    let result = await new Promise<any>((resolve, reject) => {
      Http.post("/api/Like", likeparams)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async RemoveLike(idPost: string): Promise<any> {
    const likeparams = {
      idItem: idPost,
      iduser: null,
    };
    let result = await new Promise<any>((resolve, reject) => {
      Http.delete("/api/Like", { data: likeparams })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  GetLikeUsers(idPost: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
}

const likeService = new LikeService();
export default likeService;
