import { IUserService } from "../../Interface/User/IUserService";
import Http from "../Http/HttpClient";

export class UserService implements IUserService {
  async GetUser(page: number, search: string, status: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/users?page=${page}&search=${search}&status=${status}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          console.log(err);

          reject(err);
        });
    });
    return result;
  }

  async SuspendUser(id: string): Promise<any> {
    let search = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/users/${id}/suspended`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return search;
  }

  async BannedUser(id: string): Promise<any> {
    let search = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/users/${id}/banned`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return search;
  }

  async ReactiveUser(id: string): Promise<any> {
    let search = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/users/${id}/activate`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return search;
  }

  async UnBannedUser(id: string): Promise<any> {
    let search = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/users/${id}/unbanned`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return search;
  }

  async SearchUser(key: string, section: number): Promise<any> {
    let search = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/users/search?username=${key}&section=${section}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return search;
  }

  async GetUserByUsername(username: string): Promise<any> {
    let getUser = await new Promise<any>((resolve, reject) => {
      Http.get(`api/users/username?username=${username}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return getUser;
  }
}

const userService = new UserService();
export default userService;
