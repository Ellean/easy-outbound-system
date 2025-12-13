// 产品控制器
import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';

export class ProductController {
  /**
   * 获取产品列表
   * GET /api/v1/products
   */
  static getProducts = asyncHandler(async (req: Request, res: Response) => {
    const { keyword, status, page, pageSize } = req.query;
    
    const params = {
      keyword: keyword as string,
      status: status as 'active' | 'inactive',
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
    };

    const result = await ProductService.getProducts(params);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '获取产品列表成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });

  /**
   * 获取产品详情
   * GET /api/v1/products/:id
   */
  static getProductById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const product = await ProductService.getProductById(id);

    const response: ApiResponse = {
      success: true,
      data: product,
      message: '获取产品详情成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });

  /**
   * 搜索产品（用于下拉框）
   * GET /api/v1/products/search
   */
  static searchProducts = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    const keyword = q as string || '';

    const products = await ProductService.searchProducts(keyword);

    const response: ApiResponse = {
      success: true,
      data: products,
      message: '搜索产品成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });

  /**
   * 创建产品
   * POST /api/v1/products
   */
  static createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await ProductService.createProduct(req.body);

    const response: ApiResponse = {
      success: true,
      data: product,
      message: '创建产品成功',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  });

  /**
   * 更新产品
   * PUT /api/v1/products/:id
   */
  static updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const product = await ProductService.updateProduct(id, req.body);

    const response: ApiResponse = {
      success: true,
      data: product,
      message: '更新产品成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });

  /**
   * 删除产品
   * DELETE /api/v1/products/:id
   */
  static deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const result = await ProductService.deleteProduct(id);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '删除产品成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });
}
