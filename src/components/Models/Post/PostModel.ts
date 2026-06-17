export class PostModel {
  public _id: string | undefined;
  public IdUser: string | undefined;
  public IdMediaData: string | undefined;
  public MediaData: string | undefined;
  public Description: string | undefined;
  public Status: number | undefined;
  public CreateDate: Date | undefined;
  public Username: string | undefined;
  public Verify: number | undefined;
  public IdMediaDataProfile: string | undefined;
  public ProfilePhoto: string | undefined;
  public Likes: number | undefined;
  public Comments: number | undefined;
  public Liked: boolean | undefined;
}