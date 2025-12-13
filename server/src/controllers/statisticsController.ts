// 统计分析控制器
import { Request, Response } from 'express';
import { StatisticsService } from '../services/statisticsService';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';

export class StatisticsController {
  /**
   * 获取产品出库统计
   * GET /api/v1/statistics/products
   */
  static getProductStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, limit } = req.query;
    
    const params = {
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? parseInt(limit as string) : undefined,
    };

    const result = await StatisticsService.getProductStatistics(params);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '获取产品统计成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });

  /**
   * 获取时间线统计
   * GET /api/v1/statistics/timeline
   */
  static getTimelineStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, groupBy } = req.query;
    
    const params = {
      startDate: startDate as string,
      endDate: endDate as string,
      groupBy: (groupBy as 'day' | 'week' | 'month') || 'day',
    };

    const result = await StatisticsService.getTimelineStatistics(params);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '获取时间线统计成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });

  /**
   * 获取客户统计
   * GET /api/v1/statistics/customers
   */
  static getCustomerStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, limit } = req.query;
    
    const params = {
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? parseInt(limit as string) : undefined,
    };

    const result = await StatisticsService.getCustomerStatistics(params);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '获取客户统计成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });

  /**
   * 获取仪表板概览
   * GET /api/v1/statistics/dashboard
   */
  static getDashboardOverview = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    
    const params = {
      startDate: startDate as string,
      endDate: endDate as string,
    };

    const result = await StatisticsService.getDashboardOverview(params);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '获取仪表板概览成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });
}
