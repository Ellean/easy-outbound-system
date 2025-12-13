// 产品数据模型
import { pool } from '../config/database';
import { Product, CreateProductDto, UpdateProductDto, ProductSearchParams } from '../types';

export class ProductModel {
  /**
   * 获取产品列表（分页、搜索）
   */
  static async findAll(params: ProductSearchParams) {
    const { keyword, status, page = 1, pageSize = 10 } = params;
    const offset = (page - 1) * pageSize;
    
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (keyword) {
      whereConditions.push(`(model ILIKE $${paramIndex} OR name ILIKE $${paramIndex})`);
      queryParams.push(`%${keyword}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 查询总数
    const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // 查询数据
    const dataQuery = `
      SELECT * FROM products 
      ${whereClause}
      ORDER BY created_at DESC
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
   * 根据ID获取产品
   */
  static async findById(id: number): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * 根据型号获取产品
   */
  static async findByModel(model: string): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE model = $1';
    const result = await pool.query(query, [model]);
    return result.rows[0] || null;
  }

  /**
   * 搜索产品（用于下拉框）
   */
  static async search(keyword: string, limit: number = 20) {
    const query = `
      SELECT id, model, name, specification, price, status
      FROM products
      WHERE status = 'active' 
        AND (model ILIKE $1 OR name ILIKE $1)
      ORDER BY model ASC
      LIMIT $2
    `;
    const result = await pool.query(query, [`%${keyword}%`, limit]);
    return result.rows;
  }

  /**
   * 创建产品
   */
  static async create(data: CreateProductDto): Promise<Product> {
    const { model, name, specification, price, status = 'active', remarks } = data;
    
    const query = `
      INSERT INTO products (model, name, specification, price, status, remarks)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      model, name, specification, price, status, remarks
    ]);
    
    return result.rows[0];
  }

  /**
   * 更新产品
   */
  static async update(id: number, data: UpdateProductDto): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.specification !== undefined) {
      fields.push(`specification = $${paramIndex++}`);
      values.push(data.specification);
    }
    if (data.price !== undefined) {
      fields.push(`price = $${paramIndex++}`);
      values.push(data.price);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.remarks !== undefined) {
      fields.push(`remarks = $${paramIndex++}`);
      values.push(data.remarks);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * 删除产品（软删除，设置为 inactive）
   */
  static async delete(id: number): Promise<boolean> {
    const query = `
      UPDATE products
      SET status = 'inactive'
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  /**
   * 物理删除产品
   */
  static async hardDelete(id: number): Promise<boolean> {
    const query = 'DELETE FROM products WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }
}
