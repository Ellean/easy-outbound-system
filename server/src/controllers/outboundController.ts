// 出库控制器
import { Request, Response } from 'express';
import { OutboundService } from '../services/outboundService';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middlewares/errorHandler';

export class OutboundController {
  /**
   * 获取出库单列表
   * GET /api/v1/outbound-orders
   */
  static getOutboundOrders = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, customer, page, pageSize } = req.query;
    
    const params = {
      startDate: startDate as string,
      endDate: endDate as string,
      customer: customer as string,
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
    };

    const result = await OutboundService.getOutboundOrders(params);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '获取出库单列表成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });

  /**
   * 获取出库单详情
   * GET /api/v1/outbound-orders/:orderNo
   */
  static getOutboundOrderByNo = asyncHandler(async (req: Request, res: Response) => {
    const { orderNo } = req.params;
    const order = await OutboundService.getOutboundOrderByNo(orderNo);

    const response: ApiResponse = {
      success: true,
      data: order,
      message: '获取出库单详情成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });

  /**
   * 创建出库单
   * POST /api/v1/outbound-orders
   */
  static createOutboundOrder = asyncHandler(async (req: Request, res: Response) => {
    const order = await OutboundService.createOutboundOrder(req.body);

    const response: ApiResponse = {
      success: true,
      data: order,
      message: '创建出库单成功',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  });

  /**
   * 更新出库单
   * PUT /api/v1/outbound-orders/:orderNo
   */
  static updateOutboundOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderNo } = req.params;
    const order = await OutboundService.updateOutboundOrder(orderNo, req.body);

    const response: ApiResponse = {
      success: true,
      data: order,
      message: '更新出库单成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });

  /**
   * 删除出库单
   * DELETE /api/v1/outbound-orders/:orderNo
   */
  static deleteOutboundOrder = asyncHandler(async (req: Request, res: Response) => {
    const { orderNo } = req.params;
    const result = await OutboundService.deleteOutboundOrder(orderNo);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '删除出库单成功',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  });
}
