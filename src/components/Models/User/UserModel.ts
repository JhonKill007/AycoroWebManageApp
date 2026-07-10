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
  public IP?: string;
  public City?: string;
  public Country?: string;
  public Validate: boolean | undefined;
  public Strike?: number;
  public PerfilData: UserPerfilData | undefined;
  public ProfilePhoto?: string;
  public CreateDate: Date | undefined;
}
