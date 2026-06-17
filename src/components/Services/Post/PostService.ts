import { IPostService } from "../../Interface/Post/IPostService";
import { PostParams } from "../../Models/Post/PostParams";
import Http from "../Http/HttpClient";

export class PostService implements IPostService {
  async GetById(id: string): Promise<any> {
    const result = await new Promise<any>((resolve, reject) => {
      Http.get(`api/Post/${id}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetAll(page: number, search: string, status: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(
        `/api/post/all?page=${page}&search=${search}&status=${status}`,
      )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async UpdateStatus(id: string, status: number): Promise<any> {
    const result = await new Promise<any>((resolve, reject) => {
      Http.put("/api/post/status", { id, status })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetMosaicoPost(section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Post/GetMosaicoPost?section=${section}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async GetTendenciasPost(): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Post/GetTendenciaPost`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async GetArchivedPost(section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Post/GetArchivedPost?section=${section}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }
  async Create(post: PostParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.post("/api/Post", post)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async Update(post: PostParams): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.put("/api/Post", post)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetForUser(Username: string, section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/post/username?username=${Username}&section=${section}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetIndexPost(section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Post?section=${section}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetExplorerPost(section: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Post/GetExplorerPost?section=${section}`)
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

const postService = new PostService();
export default postService;
