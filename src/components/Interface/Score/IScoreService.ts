export interface IScoreService {
    SetScore(idService: string, Score:number): Promise<any>;
    UpdateScore(idService: string, Score:number): Promise<any>;
}
