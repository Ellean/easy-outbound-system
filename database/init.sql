-- 初始化数据库脚本
-- 简易出库系统 (Easy Outbound System)

-- 创建数据库（如果不存在）
-- 注意：在 Docker 环境中，数据库会在容器启动时自动创建

-- 设置时区
SET timezone = 'Asia/Shanghai';

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 导入迁移脚本
\i /docker-entrypoint-initdb.d/migrations/001_initial_schema.sql

-- 导入测试数据（可选）
-- \i /docker-entrypoint-initdb.d/seeds/sample_data.sql
