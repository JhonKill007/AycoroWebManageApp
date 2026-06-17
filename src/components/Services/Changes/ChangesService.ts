import Http from '../Http/HttpClient';
import { IChangesService } from './../../Interface/Changes/IChangesService';
export class ChangesService implements IChangesService{
    async Email(New: string): Promise<any> {
        let result = await new Promise<any>((resolve, reject) => {
            Http.put(`/api/Changes/Email?NewEmail=${New}`)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
        return result;
    }
    async Password(Actual:string, New: string): Promise<any> {
        let result = await new Promise<any>((resolve, reject) => {
            Http.put(`/api/Changes/Password?ActualPass=${Actual}&NewPass=${New}`)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
        return result;
    }

    async DesactiveAccount(): Promise<any> {
        let result = await new Promise<any>((resolve, reject) => {
            Http.put(`/api/Changes/DesactivarAccount` )
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
        return result;
    }

    async DeleteAccount(): Promise<any> {
        let result = await new Promise<any>((resolve, reject) => {
            Http.put(`/api/Changes/deleteAccount`)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
        return result;
    }
    async Name(New: string): Promise<any> {
        let result = await new Promise<any>((resolve, reject) => {
            Http.put(`/api/Changes/Name?NewName=${New}`)
                .then((res) => {
                    resolve(res);
                    
                })
                .catch((err) => {
                    reject(err);
                });
        });
        return result;
    }
    async Username(New: string): Promise<any> {
        let result = await new Promise<any>((resolve, reject) => {
            Http.put(`/api/Changes/Username?NewUsername=${New}`)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
        return result;
    }
    async Presentation(New: string): Promise<any> {
        let result = await new Promise<any>((resolve, reject) => {
            Http.put(`/api/Changes/Presentation?NewPresentation=${New}`)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
        return result;
    }
    async Phone(New: string): Promise<any> {
        let result = await new Promise<any>((resolve, reject) => {
            Http.put(`/api/Changes/Phone?NewPhone=${New}`)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    reject(err);
                });
        });
        return result;
    }

}

const changesService = new ChangesService();
export default changesService;