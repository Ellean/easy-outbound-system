# 简易出库系统 - 服务端

基于 Node.js + Express + TypeScript + PostgreSQL 构建的 RESTful API 服务器。

## 功能特性

- 🎯 产品管理 API
- 📦 出库单管理 API
- 📊 统计分析 API
- 🔒 参数化查询防止 SQL 注入
- ✅ 请求验证
- 🛡️ 错误处理中间件
- 📝 请求日志
- 🐳 Docker 支持

## 快速开始

### 前置要求

- Node.js >= 18
- PostgreSQL >= 14

### 安装

```bash
npm install
```

### 配置

复制环境变量文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=outbound_system
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
NODE_ENV=development
```

### 初始化数据库

```bash
# 创建数据库
createdb outbound_system

# 运行迁移脚本
psql outbound_system < ../database/migrations/001_initial_schema.sql

# 导入测试数据（可选）
psql outbound_system < ../database/seeds/sample_data.sql
```

### 运行

```bash
# 开发模式（支持热重载）
npm run dev

# 生产模式
npm run build
npm start
```

## API 文档

服务器启动后，访问以下端点：

- API 根路径: http://localhost:3000/api/v1
- 健康检查: http://localhost:3000/health

详细 API 文档请查看 [OpenAPI 规范](../docs/openapi.yaml)

## 项目结构

```
src/
├── config/         # 配置文件（数据库等）
├── controllers/    # 控制器层
├── services/       # 业务逻辑层
├── models/         # 数据模型层
├── routes/         # 路由定义
├── middlewares/    # 中间件
├── utils/          # 工具函数
├── types/          # TypeScript 类型
└── index.ts        # 入口文件
```

## 开发命令

```bash
# 开发运行
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 修复代码风格
npm run lint:fix

# 构建
npm run build

# 生产运行
npm start
```

## Docker

### 构建镜像

```bash
docker build -t easy-outbound-server .
```

### 运行容器

```bash
docker run -d \
  -p 3000:3000 \
  -e DB_HOST=your_db_host \
  -e DB_PASSWORD=your_db_password \
  --name outbound-server \
  easy-outbound-server
```

## 技术栈

- **Node.js** - JavaScript 运行时
- **Express** - Web 框架
- **TypeScript** - 类型安全
- **PostgreSQL** - 数据库
- **pg** - PostgreSQL 客户端
- **express-validator** - 请求验证
- **helmet** - 安全头部
- **morgan** - 请求日志
- **cors** - 跨域支持

## 许可证

MIT
