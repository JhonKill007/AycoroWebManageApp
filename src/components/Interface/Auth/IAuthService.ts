export interface IAuthService {
  Authenticate(authcode: string): Promise<any>;
}
