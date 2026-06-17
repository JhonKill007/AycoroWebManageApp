export class RoleModel {
  public _id: string | undefined;
  public Name: string | undefined;
  public Description: string | undefined;
  public Status: string | undefined;
  public CreateBy: string | undefined;
  public CreateDate: Date | undefined;
  public Permissions: string[] | undefined;
  public MemberCount: number | undefined;
}
