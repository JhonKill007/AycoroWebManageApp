import { UserModel } from "./UserModel";
import { PostModel } from "../Post/PostModel";

export class UserPerfilModel {
    public User: UserModel | undefined;
    public Followings: number | undefined;
    public Followers: number | undefined;
    public Posts?: number;
    public Reports?: number;
    public ProfilePhoto: string | undefined;
    public Post?: PostModel[];
}


