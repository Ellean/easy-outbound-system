// 服务器入口文件
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// 导入路由
import productRoutes from './routes/products';
import outboundRoutes from './routes/outbound';
import statisticsRoutes from './routes/statistics';

// 加载环境变量
dotenv.config();

// 创建 Express 应用
const app: Application = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 中间件配置
// ============================================

// 安全头部
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// 请求日志
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// 健康检查
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// API 路由
// ============================================

app.get('/api/v1', (req, res) => {
  res.json({
    message: '简易出库系统 API v1',
    version: '1.0.0',
    endpoints: {
      products: '/api/v1/products',
      outbound: '/api/v1/outbound-orders',
      statistics: '/api/v1/statistics',
    },
  });
});

// 注册路由
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/outbound-orders', outboundRoutes);
app.use('/api/v1/statistics', statisticsRoutes);

// ============================================
// 错误处理
// ============================================

// 404 处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// ============================================
// 启动服务器
// ============================================

const startServer = async () => {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('无法连接到数据库，服务器启动失败');
      process.exit(1);
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log('=================================');
      console.log('🚀 简易出库系统服务器已启动');
      console.log(`📡 监听端口: ${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📝 API文档: http://localhost:${PORT}/api/v1`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  process.exit(0);
});

// 启动服务器
startServer();

export default app;
