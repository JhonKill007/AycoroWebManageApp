export class HistoryModel {
  public id: string | undefined;
  public idUser: string | undefined;
  public status: number | undefined;
  public idMediaData: string | undefined;
  public mediaData: string | undefined;
  public seen: boolean | undefined;
  public liked: boolean | undefined;
  public amountOfViews: number | undefined;
  public amountOfLikes: number | undefined;
  public createDate: Date | undefined;
}
