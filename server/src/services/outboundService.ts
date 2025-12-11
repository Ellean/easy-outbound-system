// 出库服务层
import { OutboundOrderModel } from '../models/outboundOrder';
import { ProductModel } from '../models/product';
import { 
  CreateOutboundOrderDto, 
  UpdateOutboundOrderDto, 
  OutboundOrderSearchParams 
} from '../types';
import { AppError } from '../middlewares/errorHandler';

export class OutboundService {
  /**
   * 获取出库单列表
   */
  static async getOutboundOrders(params: OutboundOrderSearchParams) {
    return await OutboundOrderModel.findAll(params);
  }

  /**
   * 获取出库单详情
   */
  static async getOutboundOrderByNo(orderNo: string) {
    const order = await OutboundOrderModel.findByOrderNo(orderNo);
    if (!order) {
      throw new AppError('出库单不存在', 404);
    }
    return order;
  }

  /**
   * 创建出库单
   */
  static async createOutboundOrder(data: CreateOutboundOrderDto) {
    // 验证数据
    if (!data.items || data.items.length === 0) {
      throw new AppError('出库单必须包含至少一个产品', 400);
    }

    // 准备明细数据并计算总金额
    let totalAmount = 0;
    const itemsWithDetails = [];

    for (const item of data.items) {
      // 获取产品信息
      const product = await ProductModel.findByModel(item.product_model);
      if (!product) {
        throw new AppError(`产品型号 ${item.product_model} 不存在`, 404);
      }

      if (product.status !== 'active') {
        throw new AppError(`产品 ${item.product_model} 已停用`, 400);
      }

      // 验证数量
      if (item.quantity <= 0) {
        throw new AppError('数量必须大于0', 400);
      }

      // 计算小计
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      itemsWithDetails.push({
        product_model: product.model,
        product_name: product.name,
        specification: product.specification,
        unit_price: product.price,
        quantity: item.quantity,
        subtotal: Number(subtotal.toFixed(2)),
      });
    }

    // 创建出库单
    const orderData = {
      outbound_date: data.outbound_date,
      customer: data.customer,
      total_amount: Number(totalAmount.toFixed(2)),
      remarks: data.remarks,
    };

    return await OutboundOrderModel.create(orderData, itemsWithDetails);
  }

  /**
   * 更新出库单
   */
  static async updateOutboundOrder(orderNo: string, data: UpdateOutboundOrderDto) {
    // 检查出库单是否存在
    const existingOrder = await OutboundOrderModel.findByOrderNo(orderNo);
    if (!existingOrder) {
      throw new AppError('出库单不存在', 404);
    }

    let itemsWithDetails;
    let totalAmount;

    // 如果更新了明细，重新计算
    if (data.items && data.items.length > 0) {
      totalAmount = 0;
      itemsWithDetails = [];

      for (const item of data.items) {
        const product = await ProductModel.findByModel(item.product_model);
        if (!product) {
          throw new AppError(`产品型号 ${item.product_model} 不存在`, 404);
        }

        if (item.quantity <= 0) {
          throw new AppError('数量必须大于0', 400);
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        itemsWithDetails.push({
          product_model: product.model,
          product_name: product.name,
          specification: product.specification,
          unit_price: product.price,
          quantity: item.quantity,
          subtotal: Number(subtotal.toFixed(2)),
        });
      }
    }

    const orderData: any = {
      outbound_date: data.outbound_date,
      customer: data.customer,
      remarks: data.remarks,
    };

    if (totalAmount !== undefined) {
      orderData.total_amount = Number(totalAmount.toFixed(2));
    }

    return await OutboundOrderModel.update(orderNo, orderData, itemsWithDetails);
  }

  /**
   * 删除出库单
   */
  static async deleteOutboundOrder(orderNo: string) {
    const existingOrder = await OutboundOrderModel.findByOrderNo(orderNo);
    if (!existingOrder) {
      throw new AppError('出库单不存在', 404);
    }

    await OutboundOrderModel.delete(orderNo);
    return { message: '出库单已删除' };
  }
}
