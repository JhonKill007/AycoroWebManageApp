import { UserModel } from "./UserModel";

export class UserPerfilModel {
    public User: UserModel | undefined;
    public Followings: number | undefined;
    public Followers: number | undefined;
    public Posts: number | undefined;
    public Reports: number | undefined;
    public ProfilePhoto: string | undefined;
}


