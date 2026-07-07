import { IAnalyticsService } from "../../Interface/Analytics/IAnalyticsService";
import Http from "../Http/HttpClient";

export class AnalyticsService implements IAnalyticsService {
  async getUsersByCountry(): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/analytics/country`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async getDashboardStats(): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/analytics/dashboard`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async getMonthlyData(): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/analytics/monthly`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async getActivityResume(): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/analytics/activity`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async getDeviceData(): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/analytics/device`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async getGenderData(): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/analytics/gender`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async getSessionAccess(days = 30): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/analytics/sessions?days=${days}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async getGrowthData(year: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/analytics/${year}`)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
    return result;
  }

  async getGrowthDataByMonth(year: number, month: number): Promise<any> {
    let result = await new Promise<any>((resolve, reject) => {
      Http.get(`/api/analytics/growth/month/${year}/${month}`)
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

const analyticsService = new AnalyticsService();
export default analyticsService;
