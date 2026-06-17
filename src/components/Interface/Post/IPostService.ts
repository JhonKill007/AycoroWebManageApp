import { PostParams } from "../../Models/Post/PostParams";

export interface IPostService {
  Create(user: PostParams): Promise<any>;
  GetIndexPost(section: number): Promise<any>;
  GetExplorerPost(section: number): Promise<any>;
  GetTendenciasPost(): Promise<any>;
  GetMosaicoPost(section: number): Promise<any>;
  GetArchivedPost(section: number): Promise<any>;
  GetForUser(Username: string, section: number): Promise<any>;
  Update(post: PostParams): Promise<any>;
  GetById(id: string): Promise<any>;
  GetAll(page: number, search: string, status: number): Promise<any>;
  UpdateStatus(id: string, status: number): Promise<any>;
}
