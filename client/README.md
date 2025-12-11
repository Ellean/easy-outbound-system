# 简易出库系统 - 客户端

基于 Tauri + Vue3 + TypeScript + Element Plus 构建的跨平台桌面客户端。

## 功能特性

- 📦 产品管理 - 创建、编辑、查询产品信息
- 📋 出库管理 - 创建出库单、管理出库记录
- 📊 统计分析 - 查看产品和客户统计数据
- 🔍 智能搜索 - 产品搜索下拉框，支持模糊搜索
- 🖨️ 打印功能 - 打印出库单

## 开发

### 前置要求

- Node.js >= 18
- Rust >= 1.70
- 操作系统特定依赖（见下文）

### 系统依赖

**macOS**
```bash
# 无需额外依赖
```

**Ubuntu/Debian**
```bash
sudo apt-get update
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev \
  libayatana-appindicator3-dev librsvg2-dev
```

**Windows**
```bash
# 需要安装 Microsoft C++ Build Tools
# 下载：https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
# Web 开发模式（推荐用于快速开发）
npm run dev

# Tauri 开发模式（桌面应用）
npm run tauri:dev
```

### 构建

```bash
# 构建桌面应用安装包
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/`

## 配置

### 环境变量

创建 `.env` 文件：

```env
# API 服务器地址
VITE_API_BASE_URL=http://localhost:3000
```

## 项目结构

```
src/
├── views/              # 页面视图
│   ├── Products/       # 产品管理
│   ├── Outbound/       # 出库管理
│   └── Statistics/     # 统计分析
├── components/         # 公共组件
├── api/                # API 调用
├── types/              # TypeScript 类型
├── router/             # 路由配置
├── stores/             # 状态管理
└── utils/              # 工具函数
```

## 技术栈

- **Tauri** - 轻量级桌面应用框架
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Element Plus** - Vue 3 UI 组件库
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP 客户端
- **Vite** - 构建工具

## 许可证

MIT
