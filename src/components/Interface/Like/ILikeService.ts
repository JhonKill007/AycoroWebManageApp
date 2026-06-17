export interface ILikeService {
  Setlike(idPost: string): Promise<any>;
  RemoveLike(idPost: string): Promise<any>;
  GetLikeUsers(idPost: string): Promise<any>;
  setLikeComent(idcoment: string): Promise<any>;
  RemoveLikeComent(idcoment: string): Promise<any>;
  GetLikeComentUsers(idcoment: string): Promise<any>;
  setHistoryLike(idhistory: string): Promise<any>;
  RemoveHistoryLike(idhistory: string): Promise<any>;
  setServiceLike(idService: string): Promise<any>;
  RemoveServiceLike(idService: string): Promise<any>;
}
