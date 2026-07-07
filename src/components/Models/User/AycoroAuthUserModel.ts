import { AycoroAuthUserPerfilData } from "./AycoroAuthUserPerfilData";

export class AycoroAuthUserModel {
    public id!: string | undefined;
    public name: string | undefined;
    public username: string | undefined;
    public phone: string | undefined;
    public email: string | undefined;
    public password: string | undefined;
    public birthday: string | undefined;
    public gender: string | undefined;
    public status: number | undefined;
    public role: string | undefined;
    public roleName: string | undefined;
    public permissions: string[] | undefined;
    public verify: number | undefined;
    public validate: boolean | undefined;
    public perfilData: AycoroAuthUserPerfilData | undefined;
    public createDate: Date | undefined;
}


