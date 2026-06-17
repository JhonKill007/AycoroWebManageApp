
export interface ICodeService {
  ValidateCodeFromRestorePassword(code: string, email:string): Promise<any>;
  ValidateCodeFromValidateEmail(code: string): Promise<any>;
}
