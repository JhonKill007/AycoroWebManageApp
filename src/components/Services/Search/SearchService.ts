import Http from "../Http/HttpClient";

export class SearchService {
  async search(query: string): Promise<any> {
    return Http.get(`/api/search?q=${encodeURIComponent(query)}`);
  }
}

const searchService = new SearchService();
export default searchService;
