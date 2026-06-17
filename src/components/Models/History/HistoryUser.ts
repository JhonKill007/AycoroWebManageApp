import { UserPerfilData } from "../User/UserPerfilData";

export class HistoryUser {
  public id!: string | undefined;
  public name: string | undefined;
  public username: string | undefined;
  public phone: string | undefined;
  public email: string | undefined;
  public password: string | undefined;
  public birthday: string | undefined;
  public gender: string | undefined;
  public status: number | undefined;
  public verify: number | undefined;
  public perfilData: UserPerfilData | undefined;
  public createDate: Date | undefined;
  public isFollow: boolean | undefined;
  public seguidos: number | undefined;
  public seguidores: number | undefined;
  public profilePhoto: string | undefined;
}
