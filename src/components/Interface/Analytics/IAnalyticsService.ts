export interface IAnalyticsService {
  getGrowthData(year: number): Promise<any>;
  getMonthlyData(): Promise<any>;
  getActivityResume(): Promise<any>;
  getUsersByCountry(): Promise<any>;
  getDashboardStats(): Promise<any>;
  getDeviceData(): Promise<any>;
  getGenderData(): Promise<any>;
  getGrowthDataByMonth(year: number, month: number): Promise<any>;
}
