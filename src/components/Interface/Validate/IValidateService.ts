export interface IValidateService {
    validateEmail(email: string): Promise<any>
    validateUsername(username: string): Promise<any>
}