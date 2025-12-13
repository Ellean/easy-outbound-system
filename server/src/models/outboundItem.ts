// 出库单明细数据模型
import { pool } from '../config/database';
import { OutboundItem } from '../types';

export class OutboundItemModel {
  /**
   * 根据出库单号获取明细列表
   */
  static async findByOrderNo(orderNo: string): Promise<OutboundItem[]> {
    const query = `
      SELECT * FROM outbound_items 
      WHERE order_no = $1 
      ORDER BY id ASC
    `;
    const result = await pool.query(query, [orderNo]);
    return result.rows;
  }

  /**
   * 根据产品型号获取出库历史
   */
  static async findByProductModel(productModel: string, limit: number = 50): Promise<OutboundItem[]> {
    const query = `
      SELECT oi.*, oo.outbound_date, oo.customer
      FROM outbound_items oi
      JOIN outbound_orders oo ON oi.order_no = oo.order_no
      WHERE oi.product_model = $1
      ORDER BY oi.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [productModel, limit]);
    return result.rows;
  }

  /**
   * 创建出库明细
   */
  static async create(data: Omit<OutboundItem, 'id' | 'created_at'>): Promise<OutboundItem> {
    const { order_no, product_model, product_name, specification, unit_price, quantity, subtotal } = data;
    
    const query = `
      INSERT INTO outbound_items 
      (order_no, product_model, product_name, specification, unit_price, quantity, subtotal)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      order_no, product_model, product_name, specification, unit_price, quantity, subtotal
    ]);
    
    return result.rows[0];
  }

  /**
   * 批量创建出库明细
   */
  static async createBatch(items: Array<Omit<OutboundItem, 'id' | 'created_at'>>): Promise<OutboundItem[]> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const insertedItems: OutboundItem[] = [];
      
      for (const item of items) {
        const query = `
          INSERT INTO outbound_items 
          (order_no, product_model, product_name, specification, unit_price, quantity, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;
        
        const result = await client.query(query, [
          item.order_no,
          item.product_model,
          item.product_name,
          item.specification,
          item.unit_price,
          item.quantity,
          item.subtotal,
        ]);
        
        insertedItems.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return insertedItems;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 删除出库单的所有明细
   */
  static async deleteByOrderNo(orderNo: string): Promise<boolean> {
    const query = 'DELETE FROM outbound_items WHERE order_no = $1';
    const result = await pool.query(query, [orderNo]);
    return result.rowCount! > 0;
  }
}
