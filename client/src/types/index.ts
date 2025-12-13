// 通用类型定义

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductStatistics {
  model: string;
  name: string;
  specification: string;
  current_price: number;
  total_quantity: number;
  total_amount: number;
  order_count: number;
  last_outbound_date?: string;
}

export interface TimelineStatistics {
  date: string;
  order_count: number;
  total_amount: number;
  total_quantity: number;
}

export interface CustomerStatistics {
  customer: string;
  order_count: number;
  total_amount: number;
  last_order_date: string;
}

export interface DashboardOverview {
  total_orders: number;
  total_amount: number;
  total_customers: number;
  avg_order_amount: number;
}
