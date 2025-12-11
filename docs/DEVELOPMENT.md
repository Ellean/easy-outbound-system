# 开发指南

## 开发环境搭建

### 前置要求

- **Node.js** >= 18.0
- **npm** >= 9.0
- **PostgreSQL** >= 14
- **Rust** >= 1.70 (用于 Tauri)
- **Git**

### 克隆项目

```bash
git clone https://github.com/Ellean/easy-outbound-system.git
cd easy-outbound-system
```

## 后端开发

### 安装依赖

```bash
cd server
npm install
```

### 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=outbound_system
DB_USER=postgres
DB_PASSWORD=postgres
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

### 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动，支持热重载。

### 测试 API

```bash
# 健康检查
curl http://localhost:3000/health

# 获取产品列表
curl http://localhost:3000/api/v1/products

# 创建产品
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"model":"TEST-001","name":"测试产品","specification":"规格","price":100}'
```

## 前端开发

### 安装依赖

```bash
cd client
npm install
```

### 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 启动开发服务器

```bash
# Web 开发模式
npm run dev

# Tauri 桌面开发模式
npm run tauri:dev
```

- Web 模式：http://localhost:5173
- Tauri 模式：启动桌面应用

### 构建

```bash
# Web 构建
npm run build

# Tauri 构建（生成安装包）
npm run tauri:build
```

## 项目结构

### 后端结构

```
server/
├── src/
│   ├── config/          # 配置文件
│   │   └── database.ts  # 数据库配置
│   ├── controllers/     # 控制器层
│   │   ├── productController.ts
│   │   ├── outboundController.ts
│   │   └── statisticsController.ts
│   ├── services/        # 业务逻辑层
│   │   ├── productService.ts
│   │   ├── outboundService.ts
│   │   └── statisticsService.ts
│   ├── models/          # 数据模型层
│   │   ├── product.ts
│   │   ├── outboundOrder.ts
│   │   └── outboundItem.ts
│   ├── routes/          # 路由定义
│   │   ├── products.ts
│   │   ├── outbound.ts
│   │   └── statistics.ts
│   ├── middlewares/     # 中间件
│   │   ├── errorHandler.ts
│   │   └── validator.ts
│   ├── utils/           # 工具函数
│   │   └── orderNumber.ts
│   ├── types/           # TypeScript 类型
│   │   └── index.ts
│   └── index.ts         # 入口文件
├── package.json
└── tsconfig.json
```

### 前端结构

```
client/
├── src/
│   ├── views/           # 页面视图
│   │   ├── Products/    # 产品管理
│   │   ├── Outbound/    # 出库管理
│   │   └── Statistics/  # 统计分析
│   ├── components/      # 公共组件
│   │   └── ProductSelector.vue
│   ├── api/             # API 调用
│   │   ├── products.ts
│   │   ├── outbound.ts
│   │   └── statistics.ts
│   ├── types/           # TypeScript 类型
│   │   ├── product.ts
│   │   ├── outbound.ts
│   │   └── index.ts
│   ├── router/          # 路由配置
│   │   └── index.ts
│   ├── stores/          # 状态管理
│   │   └── app.ts
│   ├── utils/           # 工具函数
│   │   └── request.ts
│   ├── App.vue          # 根组件
│   ├── main.ts          # 入口文件
│   └── style.css        # 全局样式
├── src-tauri/           # Tauri 配置
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 代码规范

### TypeScript

- 使用严格模式
- 明确定义类型，避免使用 `any`
- 使用 interface 定义对象类型
- 导出类型定义供其他模块使用

### 命名规范

- **文件名**：kebab-case (`product-service.ts`)
- **类名**：PascalCase (`ProductService`)
- **函数/变量**：camelCase (`getProducts`)
- **常量**：UPPER_SNAKE_CASE (`API_PREFIX`)
- **接口/类型**：PascalCase (`Product`, `ApiResponse`)

### 注释规范

```typescript
/**
 * 获取产品列表
 * @param params 搜索参数
 * @returns 分页的产品列表
 */
static async getProducts(params: ProductSearchParams) {
  // 实现代码
}
```

## API 开发

### RESTful 设计原则

- 使用 HTTP 动词：GET（查询）、POST（创建）、PUT（更新）、DELETE（删除）
- 使用复数名词：`/api/v1/products`
- 使用资源嵌套：`/api/v1/outbound-orders/:id/items`
- 返回统一的响应格式

### 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}
```

成功响应：
```json
{
  "success": true,
  "data": {...},
  "message": "操作成功",
  "timestamp": "2025-12-11T10:00:00Z"
}
```

错误响应：
```json
{
  "success": false,
  "message": "错误信息",
  "timestamp": "2025-12-11T10:00:00Z"
}
```

## 调试技巧

### 后端调试

1. **使用 console.log**

```typescript
console.log('查询参数:', params);
console.error('错误:', error);
```

2. **使用 VS Code 调试器**

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/server",
      "console": "integratedTerminal"
    }
  ]
}
```

### 前端调试

1. **Vue DevTools**：浏览器扩展，查看组件、状态、路由
2. **浏览器开发者工具**：
   - Console：查看日志
   - Network：查看 API 请求
   - Sources：断点调试

### 数据库调试

```bash
# 连接数据库
psql -U postgres -d outbound_system

# 查看表结构
\d products

# 查看数据
SELECT * FROM products;

# 查看查询计划
EXPLAIN ANALYZE SELECT * FROM products WHERE status = 'active';
```

## 常见问题

### 1. 端口冲突

修改 `server/.env` 中的 `PORT`

### 2. 数据库连接失败

检查 PostgreSQL 是否运行，环境变量配置是否正确

### 3. Tauri 构建失败

确保安装了 Rust 和必要的系统依赖：

```bash
# macOS
brew install --cask osxfuse

# Ubuntu/Debian
sudo apt-get install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### 4. CORS 错误

确保服务器的 `CORS_ORIGIN` 配置正确

## 贡献指南

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

### Commit 消息规范

遵循 Conventional Commits：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型：
- `feat`: 新功能
- `fix`: 修复Bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

示例：
```
feat(product): add product search functionality

- Add search API endpoint
- Implement frontend search component
- Add debounce for search input
```

## 测试

### 后端测试

```bash
cd server
npm test
```

### 前端测试

```bash
cd client
npm test
```

## 部署

参见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 资源链接

- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Tauri 文档](https://tauri.app/)
- [Express 文档](https://expressjs.com/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
