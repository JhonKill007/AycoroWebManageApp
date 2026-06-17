export class ReportModel {
  public _id: string | undefined;
  public IdItem: string | undefined;
  public IdUser: string | undefined;
  public ReporterUser: any | undefined;
  public ProfilePhotoUser: string | undefined;
  public IdUserReported: string | undefined;
  public ReportedUser: any | undefined;
  public ProfilePhotoUserReported: string | undefined;
  public ReportedItem: any | undefined;
  public ConfirmedReports: number | undefined;
  public Description: string | undefined;
  public Type: string | undefined;
  public Category: string | undefined;
  public Status: number | undefined;
  public Priority: string | undefined;
  public Content: string | undefined;
  public CreateDate: Date | undefined;
}
