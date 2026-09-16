export interface IAnalyticsService {
  getGrowthData(year: number): Promise<any>;
  getMonthlyData(): Promise<any>;
  getActivityResume(): Promise<any>;
  getUsersByCountry(): Promise<any>;
  getDashboardStats(): Promise<any>;
  getDeviceData(days?: number): Promise<any>;
  getGenderData(): Promise<any>;
  getSessionAccess(days?: number): Promise<any>;
  getMessageAnalytics(days?: number | "all"): Promise<any>;
  getGrowthDataByMonth(year: number, month: number): Promise<any>;
}
