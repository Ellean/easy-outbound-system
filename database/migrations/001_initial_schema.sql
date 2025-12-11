-- 数据库初始化迁移脚本
-- 版本: 001
-- 描述: 创建产品表、出库单主表、出库单明细表

-- ============================================
-- 1. 创建产品表 (products)
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    model VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    specification VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建产品表索引
CREATE INDEX idx_products_model ON products(model);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at);

-- 产品表注释
COMMENT ON TABLE products IS '产品信息表';
COMMENT ON COLUMN products.id IS '产品ID（主键）';
COMMENT ON COLUMN products.model IS '产品型号（唯一）';
COMMENT ON COLUMN products.name IS '产品名称';
COMMENT ON COLUMN products.specification IS '规格/单位';
COMMENT ON COLUMN products.price IS '价格';
COMMENT ON COLUMN products.status IS '状态：active-启用, inactive-停用';
COMMENT ON COLUMN products.remarks IS '备注';
COMMENT ON COLUMN products.created_at IS '创建时间';
COMMENT ON COLUMN products.updated_at IS '更新时间';

-- ============================================
-- 2. 创建出库单主表 (outbound_orders)
-- ============================================

CREATE TABLE IF NOT EXISTS outbound_orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    outbound_date DATE NOT NULL,
    customer VARCHAR(100),
    total_amount DECIMAL(10,2) DEFAULT 0 CHECK (total_amount >= 0),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建出库单主表索引
CREATE UNIQUE INDEX idx_outbound_orders_order_no ON outbound_orders(order_no);
CREATE INDEX idx_outbound_orders_date ON outbound_orders(outbound_date DESC);
CREATE INDEX idx_outbound_orders_customer ON outbound_orders(customer);
CREATE INDEX idx_outbound_orders_created_at ON outbound_orders(created_at DESC);

-- 出库单主表注释
COMMENT ON TABLE outbound_orders IS '出库单主表';
COMMENT ON COLUMN outbound_orders.id IS '出库单ID（主键）';
COMMENT ON COLUMN outbound_orders.order_no IS '出库单号（唯一），格式：OUT20251211001';
COMMENT ON COLUMN outbound_orders.outbound_date IS '出库日期';
COMMENT ON COLUMN outbound_orders.customer IS '客户名称';
COMMENT ON COLUMN outbound_orders.total_amount IS '总计金额';
COMMENT ON COLUMN outbound_orders.remarks IS '备注';
COMMENT ON COLUMN outbound_orders.created_at IS '创建时间';
COMMENT ON COLUMN outbound_orders.updated_at IS '更新时间';

-- ============================================
-- 3. 创建出库单明细表 (outbound_items)
-- ============================================

CREATE TABLE IF NOT EXISTS outbound_items (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL,
    product_model VARCHAR(50) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    specification VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_no) REFERENCES outbound_orders(order_no) ON DELETE CASCADE
);

-- 创建出库单明细表索引
CREATE INDEX idx_outbound_items_order_no ON outbound_items(order_no);
CREATE INDEX idx_outbound_items_product_model ON outbound_items(product_model);
CREATE INDEX idx_outbound_items_created_at ON outbound_items(created_at);

-- 出库单明细表注释
COMMENT ON TABLE outbound_items IS '出库单明细表';
COMMENT ON COLUMN outbound_items.id IS '明细ID（主键）';
COMMENT ON COLUMN outbound_items.order_no IS '出库单号（外键）';
COMMENT ON COLUMN outbound_items.product_model IS '产品型号';
COMMENT ON COLUMN outbound_items.product_name IS '产品名称（冗余存储）';
COMMENT ON COLUMN outbound_items.specification IS '规格（冗余存储）';
COMMENT ON COLUMN outbound_items.unit_price IS '单价（历史价格快照）';
COMMENT ON COLUMN outbound_items.quantity IS '数量';
COMMENT ON COLUMN outbound_items.subtotal IS '小计';
COMMENT ON COLUMN outbound_items.created_at IS '创建时间';

-- ============================================
-- 4. 创建触发器函数：自动更新 updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为产品表创建触发器
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为出库单主表创建触发器
CREATE TRIGGER update_outbound_orders_updated_at
    BEFORE UPDATE ON outbound_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. 创建出库单号序列生成函数
-- ============================================

CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS VARCHAR AS $$
DECLARE
    today_date VARCHAR(8);
    seq_num INTEGER;
    new_order_no VARCHAR(50);
BEGIN
    -- 获取今天的日期（YYYYMMDD格式）
    today_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    -- 查询今天已有的最大序号
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_no FROM 12 FOR 3) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM outbound_orders
    WHERE order_no LIKE 'OUT' || today_date || '%';
    
    -- 生成新的出库单号
    new_order_no := 'OUT' || today_date || LPAD(seq_num::TEXT, 3, '0');
    
    RETURN new_order_no;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. 创建视图：出库记录汇总
-- ============================================

CREATE OR REPLACE VIEW v_outbound_summary AS
SELECT 
    oo.order_no,
    oo.outbound_date,
    oo.customer,
    oo.total_amount,
    oo.remarks,
    COUNT(oi.id) AS item_count,
    SUM(oi.quantity) AS total_quantity,
    oo.created_at,
    oo.updated_at
FROM outbound_orders oo
LEFT JOIN outbound_items oi ON oo.order_no = oi.order_no
GROUP BY oo.order_no, oo.outbound_date, oo.customer, oo.total_amount, 
         oo.remarks, oo.created_at, oo.updated_at;

COMMENT ON VIEW v_outbound_summary IS '出库记录汇总视图';

-- ============================================
-- 7. 创建视图：产品出库统计
-- ============================================

CREATE OR REPLACE VIEW v_product_outbound_stats AS
SELECT 
    p.model,
    p.name,
    p.specification,
    p.price AS current_price,
    COALESCE(SUM(oi.quantity), 0) AS total_quantity,
    COALESCE(SUM(oi.subtotal), 0) AS total_amount,
    COALESCE(COUNT(DISTINCT oi.order_no), 0) AS order_count,
    MAX(oi.created_at) AS last_outbound_date
FROM products p
LEFT JOIN outbound_items oi ON p.model = oi.product_model
WHERE p.status = 'active'
GROUP BY p.model, p.name, p.specification, p.price;

COMMENT ON VIEW v_product_outbound_stats IS '产品出库统计视图';

-- ============================================
-- 完成
-- ============================================

-- 输出确认信息
DO $$
BEGIN
    RAISE NOTICE '数据库初始化完成！';
    RAISE NOTICE '已创建表：products, outbound_orders, outbound_items';
    RAISE NOTICE '已创建视图：v_outbound_summary, v_product_outbound_stats';
    RAISE NOTICE '已创建函数：generate_order_no(), update_updated_at_column()';
END $$;
