-- 测试数据脚本
-- 用于开发和测试环境

-- ============================================
-- 1. 插入产品测试数据
-- ============================================

INSERT INTO products (model, name, specification, price, status, remarks) VALUES
('MD-001', '超声波传感器', '5米/DC24V', 299.00, 'active', '工业级超声波距离传感器'),
('MD-002', '温湿度传感器', 'SHT30/I2C', 89.00, 'active', '高精度温湿度传感器'),
('MD-003', '压力传感器', '0-10MPa/4-20mA', 450.00, 'active', '压力变送器'),
('MD-004', 'PLC控制器', 'S7-1200/DC24V', 1899.00, 'active', '西门子PLC'),
('MD-005', '触摸屏', '7寸/HMI', 680.00, 'active', '人机界面触摸屏'),
('MD-006', '继电器模块', '8路/DC24V', 120.00, 'active', '8路继电器输出模块'),
('MD-007', '电源模块', 'DC24V/5A', 180.00, 'active', '工业开关电源'),
('MD-008', '接近开关', 'NPN/NO/5mm', 35.00, 'active', '电感式接近开关'),
('MD-009', '光电开关', 'NPN/漫反射/50cm', 68.00, 'active', '光电传感器'),
('MD-010', '编码器', '增量型/1024P/R', 280.00, 'active', '旋转编码器'),
('MD-011', '伺服电机', '400W/3000rpm', 1250.00, 'active', 'AC伺服电机'),
('MD-012', '变频器', '2.2KW/380V', 980.00, 'active', '通用变频器'),
('MD-013', '气缸', '标准型/Φ63×100', 220.00, 'active', '气动执行器'),
('MD-014', '电磁阀', '二位五通/DC24V', 95.00, 'active', '电磁换向阀'),
('MD-015', '流量计', '涡轮/0-100L/min', 580.00, 'active', '液体流量计');

-- ============================================
-- 2. 插入出库单测试数据
-- ============================================

-- 出库单1：2024年12月10日
INSERT INTO outbound_orders (order_no, outbound_date, customer, total_amount, remarks)
VALUES ('OUT20241210001', '2024-12-10', '上海XX自动化有限公司', 5823.00, '项目A设备采购');

INSERT INTO outbound_items (order_no, product_model, product_name, specification, unit_price, quantity, subtotal)
VALUES 
('OUT20241210001', 'MD-001', '超声波传感器', '5米/DC24V', 299.00, 5, 1495.00),
('OUT20241210001', 'MD-002', '温湿度传感器', 'SHT30/I2C', 89.00, 10, 890.00),
('OUT20241210001', 'MD-004', 'PLC控制器', 'S7-1200/DC24V', 1899.00, 1, 1899.00),
('OUT20241210001', 'MD-006', '继电器模块', '8路/DC24V', 120.00, 3, 360.00),
('OUT20241210001', 'MD-007', '电源模块', 'DC24V/5A', 180.00, 2, 360.00),
('OUT20241210001', 'MD-008', '接近开关', 'NPN/NO/5mm', 35.00, 10, 350.00),
('OUT20241210001', 'MD-009', '光电开关', 'NPN/漫反射/50cm', 68.00, 7, 476.00);

-- 出库单2：2024年12月10日
INSERT INTO outbound_orders (order_no, outbound_date, customer, total_amount, remarks)
VALUES ('OUT20241210002', '2024-12-10', '北京YY机械设备公司', 3890.00, '生产线改造配件');

INSERT INTO outbound_items (order_no, product_model, product_name, specification, unit_price, quantity, subtotal)
VALUES 
('OUT20241210002', 'MD-003', '压力传感器', '0-10MPa/4-20mA', 450.00, 2, 900.00),
('OUT20241210002', 'MD-012', '变频器', '2.2KW/380V', 980.00, 2, 1960.00),
('OUT20241210002', 'MD-013', '气缸', '标准型/Φ63×100', 220.00, 4, 880.00),
('OUT20241210002', 'MD-014', '电磁阀', '二位五通/DC24V', 95.00, 5, 475.00);

-- 出库单3：2024年12月11日
INSERT INTO outbound_orders (order_no, outbound_date, customer, total_amount, remarks)
VALUES ('OUT20241211001', '2024-12-11', '深圳ZZ电子科技', 4568.00, '研发样机配件');

INSERT INTO outbound_items (order_no, product_model, product_name, specification, unit_price, quantity, subtotal)
VALUES 
('OUT20241211001', 'MD-005', '触摸屏', '7寸/HMI', 680.00, 2, 1360.00),
('OUT20241211001', 'MD-010', '编码器', '增量型/1024P/R', 280.00, 3, 840.00),
('OUT20241211001', 'MD-011', '伺服电机', '400W/3000rpm', 1250.00, 1, 1250.00),
('OUT20241211001', 'MD-015', '流量计', '涡轮/0-100L/min', 580.00, 2, 1160.00);

-- 出库单4：2024年12月11日
INSERT INTO outbound_orders (order_no, outbound_date, customer, total_amount, remarks)
VALUES ('OUT20241211002', '2024-12-11', '广州AA工控设备', 2156.00, '常规备货');

INSERT INTO outbound_items (order_no, product_model, product_name, specification, unit_price, quantity, subtotal)
VALUES 
('OUT20241211002', 'MD-002', '温湿度传感器', 'SHT30/I2C', 89.00, 8, 712.00),
('OUT20241211002', 'MD-006', '继电器模块', '8路/DC24V', 120.00, 5, 600.00),
('OUT20241211002', 'MD-007', '电源模块', 'DC24V/5A', 180.00, 3, 540.00),
('OUT20241211002', 'MD-008', '接近开关', 'NPN/NO/5mm', 35.00, 8, 280.00);

-- 出库单5：2024年12月11日
INSERT INTO outbound_orders (order_no, outbound_date, customer, total_amount, remarks)
VALUES ('OUT20241211003', '2024-12-11', '杭州BB智能制造', 7890.00, '智能产线项目');

INSERT INTO outbound_items (order_no, product_model, product_name, specification, unit_price, quantity, subtotal)
VALUES 
('OUT20241211003', 'MD-001', '超声波传感器', '5米/DC24V', 299.00, 10, 2990.00),
('OUT20241211003', 'MD-004', 'PLC控制器', 'S7-1200/DC24V', 1899.00, 2, 3798.00),
('OUT20241211003', 'MD-009', '光电开关', 'NPN/漫反射/50cm', 68.00, 15, 1020.00);

-- ============================================
-- 3. 验证数据
-- ============================================

DO $$
DECLARE
    product_count INTEGER;
    order_count INTEGER;
    item_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO order_count FROM outbound_orders;
    SELECT COUNT(*) INTO item_count FROM outbound_items;
    
    RAISE NOTICE '测试数据插入完成！';
    RAISE NOTICE '产品数量: %', product_count;
    RAISE NOTICE '出库单数量: %', order_count;
    RAISE NOTICE '出库明细数量: %', item_count;
END $$;
