# 简易出库系统 (Easy Outbound System)

一个基于 CS 架构的现代化出库管理系统，提供产品管理和出库记录管理功能。

## ✨ 主要特性

- 🎯 **产品管理** - 完整的产品信息管理，支持型号、名称、规格、价格维护
- 📦 **出库记录** - 出库单管理，支持多产品明细、自动计算金额
- 🔍 **智能搜索** - 产品搜索型下拉框，支持模糊搜索
- 📊 **统计分析** - 产品出库统计、时间趋势分析
- 🖨️ **打印功能** - 出库单打印和PDF导出
- 🐳 **容器化部署** - 使用 Docker Compose 一键部署

## 🛠️ 技术栈

### 前端
- **Tauri** - 跨平台桌面应用框架
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Element Plus** - Vue 3 UI 组件库
- **Pinia** - Vue 状态管理
- **Vue Router** - 官方路由管理器
- **ECharts** - 数据可视化图表库

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **TypeScript** - 类型安全开发
- **PostgreSQL** - 关系型数据库
- **pg** - PostgreSQL 客户端

### 部署
- **Docker** - 容器化技术
- **Docker Compose** - 多容器编排
- **GitHub Actions** - CI/CD 自动化

## 📁 项目结构

```
easy-outbound-system/
├── client/                 # Tauri + Vue3 客户端
│   ├── src/               # 源代码
│   │   ├── views/        # 页面视图
│   │   ├── components/   # 组件
│   │   ├── api/          # API 调用
│   │   ├── types/        # 类型定义
│   │   ├── router/       # 路由配置
│   │   ├── stores/       # 状态管理
│   │   └── utils/        # 工具函数
│   └── src-tauri/        # Tauri 配置
│
├── server/                # Node.js 服务端
│   ├── src/
│   │   ├── routes/       # 路由定义
│   │   ├── controllers/  # 控制器
│   │   ├── services/     # 业务逻辑
│   │   ├── models/       # 数据模型
│   │   ├── middlewares/  # 中间件
│   │   ├── config/       # 配置
│   │   └── utils/        # 工具函数
│   └── Dockerfile        # Docker 镜像
│
├── database/              # 数据库相关
│   ├── migrations/       # 数据库迁移
│   ├── seeds/           # 测试数据
│   └── init.sql         # 初始化脚本
│
├── docs/                 # 项目文档
│   ├── openapi.yaml     # API 规范
│   ├── DATABASE.md      # 数据库文档
│   ├── DEPLOYMENT.md    # 部署指南
│   └── DEVELOPMENT.md   # 开发指南
│
├── .github/
│   └── workflows/       # GitHub Actions
│
└── docker-compose.yml   # Docker 编排配置
```

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0
- Rust >= 1.70 (用于 Tauri)
- Docker & Docker Compose
- PostgreSQL >= 14 (或使用 Docker)

### 使用 Docker 部署（推荐）

1. **克隆项目**
```bash
git clone https://github.com/Ellean/easy-outbound-system.git
cd easy-outbound-system
```

2. **启动服务**
```bash
docker compose up -d
```

3. **访问应用**
- 后端 API: http://localhost:3000
- API 文档: http://localhost:3000/api-docs

### 本地开发

#### 后端服务

```bash
cd server
npm install
npm run dev
```

#### 前端客户端

```bash
cd client
npm install
npm run tauri dev
```

详细开发指南请查看 [DEVELOPMENT.md](./docs/DEVELOPMENT.md)

## 📚 API 文档

完整的 API 文档请查看：
- [OpenAPI 3.0 规范](./docs/openapi.yaml)
- 在线文档：http://localhost:3000/api-docs (服务运行时)

### 主要接口

#### 产品管理
- `GET /api/v1/products` - 获取产品列表
- `POST /api/v1/products` - 创建产品
- `GET /api/v1/products/:id` - 获取产品详情
- `PUT /api/v1/products/:id` - 更新产品
- `DELETE /api/v1/products/:id` - 删除产品

#### 出库记录
- `GET /api/v1/outbound-orders` - 获取出库单列表
- `POST /api/v1/outbound-orders` - 创建出库单
- `GET /api/v1/outbound-orders/:orderNo` - 获取出库单详情
- `PUT /api/v1/outbound-orders/:orderNo` - 更新出库单
- `DELETE /api/v1/outbound-orders/:orderNo` - 删除出库单

#### 统计分析
- `GET /api/v1/statistics/products` - 产品出库统计
- `GET /api/v1/statistics/timeline` - 时间线统计
- `GET /api/v1/statistics/customers` - 客户统计

## 🗄️ 数据库设计

系统使用 PostgreSQL 数据库，包含以下核心表：

- **products** - 产品信息表
- **outbound_orders** - 出库单主表
- **outbound_items** - 出库单明细表

详细设计请查看 [DATABASE.md](./docs/DATABASE.md)

## 📦 部署说明

### Docker 部署

详细部署指南请查看 [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

### 环境变量配置

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=outbound_system
DB_USER=postgres
DB_PASSWORD=your_password

# 服务器配置
PORT=3000
NODE_ENV=production

# 日志配置
LOG_LEVEL=info
```

## 🔧 开发说明

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 代码规范
- 使用 Prettier 格式化代码
- Git 提交信息遵循 Conventional Commits

### 测试

```bash
# 后端测试
cd server
npm test

# 前端测试
cd client
npm test
```

### 构建

```bash
# 后端构建
cd server
npm run build

# 前端构建
cd client
npm run tauri build
```

## 📸 截图

<!-- 预留截图位置 -->
_截图即将添加_

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📮 联系方式

项目链接: [https://github.com/Ellean/easy-outbound-system](https://github.com/Ellean/easy-outbound-system)

---

⭐ 如果这个项目对你有帮助，请给个星标支持一下！