import { AycoroAuthUserModel } from "./AycoroAuthUserModel";

export class AycoroAuthUserPerfilModel {
  public user: AycoroAuthUserModel | undefined;
  public isFollow: boolean | undefined;
  public followings: number | undefined;
  public followers: number | undefined;
  public post: number | undefined;
  public profilePhoto: string | undefined;
}
