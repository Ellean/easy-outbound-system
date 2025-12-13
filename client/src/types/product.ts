// 产品类型定义

export interface Product {
  id: number;
  model: string;
  name: string;
  specification: string;
  price: number;
  status: 'active' | 'inactive';
  remarks?: string;
  created_at: string;
  updated_at: string;
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
