// 产品服务层
import { ProductModel } from '../models/product';
import { CreateProductDto, UpdateProductDto, ProductSearchParams } from '../types';
import { AppError } from '../middlewares/errorHandler';

export class ProductService {
  /**
   * 获取产品列表
   */
  static async getProducts(params: ProductSearchParams) {
    return await ProductModel.findAll(params);
  }

  /**
   * 获取产品详情
   */
  static async getProductById(id: number) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new AppError('产品不存在', 404);
    }
    return product;
  }

  /**
   * 搜索产品（用于下拉框）
   */
  static async searchProducts(keyword: string) {
    if (!keyword || keyword.trim() === '') {
      return [];
    }
    return await ProductModel.search(keyword.trim());
  }

  /**
   * 创建产品
   */
  static async createProduct(data: CreateProductDto) {
    // 检查型号是否已存在
    const existingProduct = await ProductModel.findByModel(data.model);
    if (existingProduct) {
      throw new AppError('产品型号已存在', 400);
    }

    // 验证价格
    if (data.price < 0) {
      throw new AppError('价格不能为负数', 400);
    }

    return await ProductModel.create(data);
  }

  /**
   * 更新产品
   */
  static async updateProduct(id: number, data: UpdateProductDto) {
    // 检查产品是否存在
    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      throw new AppError('产品不存在', 404);
    }

    // 验证价格
    if (data.price !== undefined && data.price < 0) {
      throw new AppError('价格不能为负数', 400);
    }

    return await ProductModel.update(id, data);
  }

  /**
   * 删除产品（软删除）
   */
  static async deleteProduct(id: number) {
    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      throw new AppError('产品不存在', 404);
    }

    await ProductModel.delete(id);
    return { message: '产品已删除' };
  }
}
