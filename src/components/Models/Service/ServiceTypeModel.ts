export class ServiceTypeModel {
  public key: string | undefined;
  public name: string | undefined;
  public categories: ServiceCategoriesTypeModel[] | undefined;
}

export class ServiceCategoriesTypeModel {
  public key: string | undefined;
  public name: string | undefined;
  public activities: ServiceActivitiesTypeModel[] | undefined;
}

export class ServiceActivitiesTypeModel {
  public key: string | undefined;
  public name: string | undefined;
}
