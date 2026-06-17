export interface IFollowService {
  FollowUnFollow(idUser: string | undefined, IsFollow: boolean): Promise<any>;
  GetFollowingList(id: string, section: number): Promise<any>;
  GetFollowerList(id: string, section: number): Promise<any>;
}
