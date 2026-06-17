export interface IChangesService {
  Name(New: string): Promise<any>;
  Username(New: string): Promise<any>;
  Presentation(New: string): Promise<any>;
  Email(New: string): Promise<any>;
  Phone(New: string): Promise<any>;
  Password(Actual:string, New: string): Promise<any>;
  DesactiveAccount(): Promise<any>;
  DeleteAccount(): Promise<any>;
}
