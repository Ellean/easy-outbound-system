// 出库单 API
import { get, post, put, del } from '@/utils/request';
import type {
  OutboundOrder,
  OutboundOrderDetail,
  CreateOutboundOrderDto,
  UpdateOutboundOrderDto,
  OutboundOrderSearchParams,
} from '@/types/outbound';
import type { PaginatedResponse } from '@/types';

const API_PREFIX = '/api/v1/outbound-orders';

// 获取出库单列表
export const getOutboundOrders = (params?: OutboundOrderSearchParams) => {
  return get<PaginatedResponse<OutboundOrder>>(API_PREFIX, params);
};

// 获取出库单详情
export const getOutboundOrderByNo = (orderNo: string) => {
  return get<OutboundOrderDetail>(`${API_PREFIX}/${orderNo}`);
};

// 创建出库单
export const createOutboundOrder = (data: CreateOutboundOrderDto) => {
  return post<OutboundOrderDetail>(API_PREFIX, data);
};

// 更新出库单
export const updateOutboundOrder = (orderNo: string, data: UpdateOutboundOrderDto) => {
  return put<OutboundOrderDetail>(`${API_PREFIX}/${orderNo}`, data);
};

// 删除出库单
export const deleteOutboundOrder = (orderNo: string) => {
  return del<{ message: string }>(`${API_PREFIX}/${orderNo}`);
};
