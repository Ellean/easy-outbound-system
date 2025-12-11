// 产品 API
import { get, post, put, del } from '@/utils/request';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductSearchParams,
} from '@/types/product';
import type { PaginatedResponse } from '@/types';

const API_PREFIX = '/api/v1/products';

// 获取产品列表
export const getProducts = (params?: ProductSearchParams) => {
  return get<PaginatedResponse<Product>>(API_PREFIX, params);
};

// 获取产品详情
export const getProductById = (id: number) => {
  return get<Product>(`${API_PREFIX}/${id}`);
};

// 搜索产品（用于下拉框）
export const searchProducts = (keyword: string) => {
  return get<Product[]>(`${API_PREFIX}/search`, { q: keyword });
};

// 创建产品
export const createProduct = (data: CreateProductDto) => {
  return post<Product>(API_PREFIX, data);
};

// 更新产品
export const updateProduct = (id: number, data: UpdateProductDto) => {
  return put<Product>(`${API_PREFIX}/${id}`, data);
};

// 删除产品
export const deleteProduct = (id: number) => {
  return del<{ message: string }>(`${API_PREFIX}/${id}`);
};
