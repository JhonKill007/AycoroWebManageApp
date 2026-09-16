export class VersionParams {
  public _id!: string | undefined;
  public Value: string | undefined;
  public Description: string | undefined;
  public Severity: string | undefined;
  public Link: string | undefined;
  public Type: string | undefined;
  public Status: number | undefined;
  public CompatibleVersions: string[] | undefined;
  public ReleaseMedia?: Array<{
    Url?: string;
    Key?: string;
    Type?: string;
    MimeType?: string;
    Size?: number;
    Duration?: number;
    Width?: number;
    Height?: number;
    ThumbnailUrl?: string;
    ThumbnailKey?: string;
    ThumbnailMimeType?: string;
    ThumbnailSize?: number;
    ThumbnailWidth?: number;
    ThumbnailHeight?: number;
  }>;
  public ReleaseHistoryIds?: string[];
  public CreateBy: string | undefined;
}
