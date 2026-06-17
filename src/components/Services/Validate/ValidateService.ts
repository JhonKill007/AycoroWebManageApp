import { IValidateService } from "../../Interface/Validate/IValidateService";
import Http from "../Http/HttpClient";

export class ValidateService implements IValidateService {

    async validateEmail(email: string | undefined): Promise<any> {
        let validate = await new Promise<any>((resolve, rejects) => {
            Http.post(`/api/Validate/Email?Email=${email}`)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    rejects(err);
                })
        });
        return validate;
    }
    async validateUsername(username: string | undefined): Promise<any> {
        let validate = await new Promise<any>((resolve, rejects) => {
            Http.post(`/api/Validate?username=${username}`)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    rejects(err);
                })
        });
        return validate;
    }
}

const validateService = new ValidateService();
export default validateService;
