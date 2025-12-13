// 统计分析服务层
import { pool } from '../config/database';
import { ProductStatistics, TimelineStatistics, CustomerStatistics } from '../types';

export class StatisticsService {
  /**
   * 获取产品出库统计
   */
  static async getProductStatistics(params: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ProductStatistics[]> {
    const { startDate, endDate, limit = 50 } = params;
    
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // 构建日期过滤条件
    if (startDate) {
      whereConditions.push(`oi.created_at >= $${paramIndex}::date`);
      queryParams.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      whereConditions.push(`oi.created_at < $${paramIndex}::date + INTERVAL '1 day'`);
      queryParams.push(endDate);
      paramIndex++;
    }

    // 构建完整的 WHERE 子句
    const dateFilter = whereConditions.length > 0 
      ? `AND ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT 
        p.model,
        p.name,
        p.specification,
        p.price as current_price,
        COALESCE(SUM(oi.quantity), 0) as total_quantity,
        COALESCE(SUM(oi.subtotal), 0) as total_amount,
        COALESCE(COUNT(DISTINCT oi.order_no), 0) as order_count,
        MAX(oi.created_at) as last_outbound_date
      FROM products p
      LEFT JOIN outbound_items oi ON p.model = oi.product_model ${dateFilter}
      WHERE p.status = 'active'
      GROUP BY p.model, p.name, p.specification, p.price
      HAVING COUNT(DISTINCT oi.order_no) > 0
      ORDER BY total_amount DESC
      LIMIT $${paramIndex}
    `;

    queryParams.push(limit);
    const result = await pool.query(query, queryParams);
    return result.rows;
  }

  /**
   * 获取时间线统计
   */
  static async getTimelineStatistics(params: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<TimelineStatistics[]> {
    const { startDate, endDate, groupBy = 'day' } = params;
    
    let dateFormat: string;
    switch (groupBy) {
      case 'week':
        dateFormat = 'YYYY-"W"IW'; // ISO week
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    let whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (startDate) {
      whereConditions.push(`outbound_date >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`outbound_date <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT 
        TO_CHAR(oo.outbound_date, '${dateFormat}') as date,
        COUNT(DISTINCT oo.order_no) as order_count,
        COALESCE(SUM(oo.total_amount), 0) as total_amount,
        COALESCE(SUM(oi.quantity), 0) as total_quantity
      FROM outbound_orders oo
      LEFT JOIN outbound_items oi ON oo.order_no = oi.order_no
      ${whereClause}
      GROUP BY TO_CHAR(oo.outbound_date, '${dateFormat}')
      ORDER BY date DESC
    `;

    const result = await pool.query(query, queryParams);
    return result.rows;
  }

  /**
   * 获取客户统计
   */
  static async getCustomerStatistics(params: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<CustomerStatistics[]> {
    const { startDate, endDate, limit = 20 } = params;
    
    let whereConditions: string[] = ['customer IS NOT NULL'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (startDate) {
      whereConditions.push(`outbound_date >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`outbound_date <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const query = `
      SELECT 
        customer,
        COUNT(*) as order_count,
        SUM(total_amount) as total_amount,
        MAX(outbound_date) as last_order_date
      FROM outbound_orders
      ${whereClause}
      GROUP BY customer
      ORDER BY total_amount DESC
      LIMIT $${paramIndex}
    `;

    queryParams.push(limit);
    const result = await pool.query(query, queryParams);
    return result.rows;
  }

  /**
   * 获取仪表板概览数据
   */
  static async getDashboardOverview(params: {
    startDate?: string;
    endDate?: string;
  }) {
    const { startDate, endDate } = params;
    
    let dateFilter = '';
    const queryParams: any[] = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE outbound_date >= $1 AND outbound_date <= $2';
      queryParams.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'WHERE outbound_date >= $1';
      queryParams.push(startDate);
    } else if (endDate) {
      dateFilter = 'WHERE outbound_date <= $1';
      queryParams.push(endDate);
    }

    const query = `
      SELECT 
        COUNT(DISTINCT order_no) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COUNT(DISTINCT customer) as total_customers,
        COALESCE(AVG(total_amount), 0) as avg_order_amount
      FROM outbound_orders
      ${dateFilter}
    `;

    const result = await pool.query(query, queryParams);
    return result.rows[0];
  }
}
