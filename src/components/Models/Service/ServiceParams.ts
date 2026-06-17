export class ServiceParams {
  public idUser: string | undefined;
  public title: string | undefined;
  public description: string | undefined;
  public photo: string | undefined;
  public keywords: string[] | undefined;
  public type: string | undefined;
  public category: string | undefined;
  public activity: string | undefined;
  public provider: string | undefined;
  public legalIdentity: string | undefined;
  public location: string | undefined;
  public isServiceOwner: boolean = false;

  //Manager data
  public name: string | undefined;
  public lastName: string | undefined;
  public managerLegalIdentity: string | undefined;
  public email: string | undefined;
  public phone: string | undefined;
}

// export class LocationParams {
//   public latitude: number | null = null;
//   public longitude: number | null = null;
// }
