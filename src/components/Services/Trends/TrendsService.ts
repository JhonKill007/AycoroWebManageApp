import Http from "../Http/HttpClient";

export class TrendsService {
  async GetTrendingPosts(): Promise<any> {
    return Http.get(`/api/trends/posts`);
  }

  async GetTopFollowers(): Promise<any> {
    return Http.get(`/api/trends/followers`);
  }

  async GetTopStreaks(): Promise<any> {
    return Http.get(`/api/trends/streaks`);
  }
}

const trendsService = new TrendsService();
export default trendsService;
