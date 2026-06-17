import { LocationModel } from "../Location/LocationModel";

export class ServiceModel {
  public id: string | undefined;
  public idUser: string | undefined;
  public title: string | undefined;
  public description: string | undefined;
  public idMediaData: string | undefined;
  public keywords: string | undefined;
  public type: string | undefined;
  public category: string | undefined;
  public activity: string | undefined;
  public idManager: string | undefined;
  public origin: string | undefined;
  public location: LocationModel | undefined;
  public createDate: string | undefined;
  public verification: boolean | undefined;
  public status: string | undefined;
  public likes: number | undefined;
  public liked: boolean | undefined;
  public comments: number | undefined;
  public score: number | undefined;
  public cantScorer: number | undefined;
  public isQualified: boolean | undefined;
  public scoreQualified: number | undefined;
}
