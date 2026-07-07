export class PostModel {
  // Compatibility aliases used by the legacy social components.
  public id?: string;
  public idUser?: string;
  public idMediaData?: string;
  public idMediaDataProfile?: string;
  public description?: string;
  public status?: number;
  public createDate?: Date;
  public username?: string;
  public likes?: number;
  public comments?: number;
  public liked?: boolean;
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
  public MediaType?: string | undefined;
  public MediaMimeType?: string | undefined;
  public MediaDuration?: number | undefined;
  public MediaWidth?: number | undefined;
  public MediaHeight?: number | undefined;
}
