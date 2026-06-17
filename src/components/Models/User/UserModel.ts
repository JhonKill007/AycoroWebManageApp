import { UserPerfilData } from "./UserPerfilData";

export class UserModel {
  public _id!: string | undefined;
  public Name: string | undefined;
  public Username: string | undefined;
  public Phone: string | undefined;
  public Email: string | undefined;
  public Password: string | undefined;
  public Birthday: string | undefined;
  public Gender: string | undefined;
  public Status: number | undefined;
  public Verify: number | undefined;
  public IP: string | undefined;
  public City: string | undefined;
  public Country: string | undefined;
  public Validate: boolean | undefined;
  public PerfilData: UserPerfilData | undefined;
  public ProfilePhoto: string | undefined;
  public CreateDate: Date | undefined;
}
