import { IFollowService } from "../../Interface/Follow/IFollowService";
import Http from "../Http/HttpClient";

export class FollowService implements IFollowService {
  async FollowUnFollow(
    idUser: string | undefined,
    IsFollow: boolean
  ): Promise<any> {
    let follow = await new Promise<any>((resolve, reject) => {
      Http.post(`/api/Follow?idUser=${idUser}&status=${IsFollow}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return follow;
  }

  async GetFollowerList(id: string, section: number): Promise<any> {
    let list = await new Promise<any>((resolve, reject) => {
      Http.get(`api/Follow/GetFollower?Id=${id}&section=${section}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return list;
  }

  async GetFollowingList(id: string, section: number): Promise<any> {
    let list = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/Follow/GetFollowing?Id=${id}&section=${section}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return list;
  }
}
const followService = new FollowService();
export default followService;
