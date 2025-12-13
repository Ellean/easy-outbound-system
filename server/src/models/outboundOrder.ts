// 出库单数据模型
import { pool } from '../config/database';
import { 
  OutboundOrder, 
  OutboundOrderDetail, 
  OutboundOrderSearchParams 
} from '../types';

export class OutboundOrderModel {
  /**
   * 获取出库单列表（分页、搜索）
   */
  static async findAll(params: OutboundOrderSearchParams) {
    const { startDate, endDate, customer, page = 1, pageSize = 10 } = params;
    const offset = (page - 1) * pageSize;
    
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
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

    if (customer) {
      whereConditions.push(`customer ILIKE $${paramIndex}`);
      queryParams.push(`%${customer}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 查询总数
    const countQuery = `SELECT COUNT(*) as total FROM outbound_orders ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // 查询数据
    const dataQuery = `
      SELECT * FROM outbound_orders 
      ${whereClause}
      ORDER BY outbound_date DESC, order_no DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataResult = await pool.query(dataQuery, [...queryParams, pageSize, offset]);

    return {
      items: dataResult.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据单号获取出库单详情（含明细）
   */
  static async findByOrderNo(orderNo: string): Promise<OutboundOrderDetail | null> {
    // 查询主表
    const orderQuery = 'SELECT * FROM outbound_orders WHERE order_no = $1';
    const orderResult = await pool.query(orderQuery, [orderNo]);
    
    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    // 查询明细
    const itemsQuery = `
      SELECT * FROM outbound_items 
      WHERE order_no = $1 
      ORDER BY id ASC
    `;
    const itemsResult = await pool.query(itemsQuery, [orderNo]);

    return {
      ...order,
      items: itemsResult.rows,
    };
  }

  /**
   * 创建出库单（使用数据库函数生成单号）
   */
  static async create(
    orderData: Omit<OutboundOrder, 'id' | 'order_no' | 'created_at' | 'updated_at'>,
    items: Array<Omit<any, 'id' | 'order_no' | 'created_at'>>
  ): Promise<OutboundOrderDetail> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 生成出库单号
      const orderNoResult = await client.query('SELECT generate_order_no() as order_no');
      const orderNo = orderNoResult.rows[0].order_no;

      // 插入主表
      const orderQuery = `
        INSERT INTO outbound_orders (order_no, outbound_date, customer, total_amount, remarks)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const orderResult = await client.query(orderQuery, [
        orderNo,
        orderData.outbound_date,
        orderData.customer,
        orderData.total_amount,
        orderData.remarks,
      ]);

      const order = orderResult.rows[0];

      // 插入明细
      const insertedItems = [];
      for (const item of items) {
        const itemQuery = `
          INSERT INTO outbound_items 
          (order_no, product_model, product_name, specification, unit_price, quantity, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;
        const itemResult = await client.query(itemQuery, [
          orderNo,
          item.product_model,
          item.product_name,
          item.specification,
          item.unit_price,
          item.quantity,
          item.subtotal,
        ]);
        insertedItems.push(itemResult.rows[0]);
      }

      await client.query('COMMIT');

      return {
        ...order,
        items: insertedItems,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 更新出库单
   */
  static async update(
    orderNo: string,
    orderData: Partial<Omit<OutboundOrder, 'id' | 'order_no' | 'created_at' | 'updated_at'>>,
    items?: Array<Omit<any, 'id' | 'order_no' | 'created_at'>>
  ): Promise<OutboundOrderDetail | null> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 更新主表
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (orderData.outbound_date !== undefined) {
        fields.push(`outbound_date = $${paramIndex++}`);
        values.push(orderData.outbound_date);
      }
      if (orderData.customer !== undefined) {
        fields.push(`customer = $${paramIndex++}`);
        values.push(orderData.customer);
      }
      if (orderData.total_amount !== undefined) {
        fields.push(`total_amount = $${paramIndex++}`);
        values.push(orderData.total_amount);
      }
      if (orderData.remarks !== undefined) {
        fields.push(`remarks = $${paramIndex++}`);
        values.push(orderData.remarks);
      }

      if (fields.length > 0) {
        values.push(orderNo);
        const orderQuery = `
          UPDATE outbound_orders
          SET ${fields.join(', ')}
          WHERE order_no = $${paramIndex}
          RETURNING *
        `;
        await client.query(orderQuery, values);
      }

      // 如果提供了明细，则更新明细
      if (items) {
        // 删除原有明细
        await client.query('DELETE FROM outbound_items WHERE order_no = $1', [orderNo]);

        // 插入新明细
        for (const item of items) {
          const itemQuery = `
            INSERT INTO outbound_items 
            (order_no, product_model, product_name, specification, unit_price, quantity, subtotal)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `;
          await client.query(itemQuery, [
            orderNo,
            item.product_model,
            item.product_name,
            item.specification,
            item.unit_price,
            item.quantity,
            item.subtotal,
          ]);
        }
      }

      await client.query('COMMIT');

      // 返回更新后的完整数据
      return await this.findByOrderNo(orderNo);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 删除出库单（级联删除明细）
   */
  static async delete(orderNo: string): Promise<boolean> {
    const query = 'DELETE FROM outbound_orders WHERE order_no = $1';
    const result = await pool.query(query, [orderNo]);
    return result.rowCount! > 0;
  }
}
