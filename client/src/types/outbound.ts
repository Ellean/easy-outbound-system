// 出库单类型定义

export interface OutboundOrder {
  id: number;
  order_no: string;
  outbound_date: string;
  customer?: string;
  total_amount: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
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
  created_at: string;
}

export interface OutboundOrderDetail extends OutboundOrder {
  items: OutboundItem[];
}

export interface CreateOutboundItemDto {
  product_model: string;
  quantity: number;
}

export interface CreateOutboundOrderDto {
  outbound_date: string;
  customer?: string;
  remarks?: string;
  items: CreateOutboundItemDto[];
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
