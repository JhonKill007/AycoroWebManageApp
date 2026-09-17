import Http from "../Http/HttpClient";

export class AlertService {
  async getAlerts(): Promise<any> {
    return Http.get(`/api/alerts`);
  }
}

const alertService = new AlertService();
export default alertService;
