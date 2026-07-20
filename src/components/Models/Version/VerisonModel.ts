export class VersionModel {
  public _id!: string | undefined;
  public Value: string | undefined;
  public Description: string | undefined;
  public Severity: string | undefined;
  public Link: string | undefined;
  public Type: string | undefined;
  public Status: number | undefined;
  public CompatibleVersions: string[] | undefined;
  public CreateBy: string | undefined;
  public CreateDate: Date | undefined;
}
