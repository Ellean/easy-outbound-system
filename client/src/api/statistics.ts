// 统计分析 API
import { get } from '@/utils/request';
import type {
  ProductStatistics,
  TimelineStatistics,
  CustomerStatistics,
  DashboardOverview,
} from '@/types';

const API_PREFIX = '/api/v1/statistics';

// 获取产品出库统计
export const getProductStatistics = (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}) => {
  return get<ProductStatistics[]>(`${API_PREFIX}/products`, params);
};

// 获取时间线统计
export const getTimelineStatistics = (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) => {
  return get<TimelineStatistics[]>(`${API_PREFIX}/timeline`, params);
};

// 获取客户统计
export const getCustomerStatistics = (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}) => {
  return get<CustomerStatistics[]>(`${API_PREFIX}/customers`, params);
};

// 获取仪表板概览
export const getDashboardOverview = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return get<DashboardOverview>(`${API_PREFIX}/dashboard`, params);
};
