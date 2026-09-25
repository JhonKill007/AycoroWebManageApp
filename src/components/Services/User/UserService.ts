import { IUserService } from "../../Interface/User/IUserService";
import Http from "../Http/HttpClient";

export class UserService implements IUserService {
  async GetUser(
    page: number,
    search: string,
    status?: number,
    segment?: string,
  ): Promise<any> {
    const params = new URLSearchParams({
      page: String(page),
      search,
    });
    if (segment) params.set("segment", segment);
    if (status !== undefined) params.set("status", String(status));
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/users?${params.toString()}`)
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

  async AssignVerification(id: string, verifyType: string): Promise<any> {
    const result = await new Promise<any>((resolve, reject) => {
      Http.put(`/api/users/${id}/verification`, { verifyType })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async GetFollowers(id: string, page: number = 1): Promise<any> {
    return Http.get(`/api/users/${id}/followers?page=${page}`);
  }

  async GetFollowing(id: string, page: number = 1): Promise<any> {
    return Http.get(`/api/users/${id}/following?page=${page}`);
  }

  async GetProfiles(usernames: string[]): Promise<any> {
    const names = usernames.filter(Boolean).slice(0, 200).join(",");
    return Http.get(`/api/users/profiles?usernames=${encodeURIComponent(names)}`);
  }

  async GetProfileEdits(id: string, page: number = 1): Promise<any> {
    return Http.get(`/api/users/${id}/profile-edits?page=${page}`);
  }
}

const userService = new UserService();
export default userService;
