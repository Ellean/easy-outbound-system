// TypeScript 类型定义
// 统一的类型定义文件

// ============================================
// API 响应类型
// ============================================

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

// ============================================
// 产品相关类型
// ============================================

export interface Product {
  id: number;
  model: string;
  name: string;
  specification: string;
  price: number;
  status: 'active' | 'inactive';
  remarks?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductDto {
  model: string;
  name: string;
  specification: string;
  price: number;
  status?: 'active' | 'inactive';
  remarks?: string;
}

export interface UpdateProductDto {
  name?: string;
  specification?: string;
  price?: number;
  status?: 'active' | 'inactive';
  remarks?: string;
}

export interface ProductSearchParams {
  keyword?: string;
  status?: 'active' | 'inactive';
  page?: number;
  pageSize?: number;
}

// ============================================
// 出库单相关类型
// ============================================

export interface OutboundOrder {
  id: number;
  order_no: string;
  outbound_date: string;
  customer?: string;
  total_amount: number;
  remarks?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OutboundItem {
  id: number;
  order_no: string;
  product_model: string;
  product_name: string;
  specification: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: Date;
}

export interface OutboundOrderDetail extends OutboundOrder {
  items: OutboundItem[];
}

export interface CreateOutboundOrderDto {
  outbound_date: string;
  customer?: string;
  remarks?: string;
  items: CreateOutboundItemDto[];
}

export interface CreateOutboundItemDto {
  product_model: string;
  quantity: number;
}

export interface UpdateOutboundOrderDto {
  outbound_date?: string;
  customer?: string;
  remarks?: string;
  items?: CreateOutboundItemDto[];
}

export interface OutboundOrderSearchParams {
  startDate?: string;
  endDate?: string;
  customer?: string;
  page?: number;
  pageSize?: number;
}

// ============================================
// 统计分析类型
// ============================================

export interface ProductStatistics {
  model: string;
  name: string;
  specification: string;
  current_price: number;
  total_quantity: number;
  total_amount: number;
  order_count: number;
  last_outbound_date?: Date;
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
  last_order_date: Date;
}

// ============================================
// 数据库查询参数
// ============================================

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}
