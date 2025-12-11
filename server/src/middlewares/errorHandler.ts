// 错误处理中间件
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// 自定义错误类
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 错误处理
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`未找到路由: ${req.originalUrl}`, 404);
  next(error);
};

// 全局错误处理中间件
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 默认错误状态码和消息
  let statusCode = 500;
  let message = '服务器内部错误';
  let isOperational = false;

  // 如果是自定义 AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    // 验证错误
    statusCode = 400;
    message = err.message;
  } else if (err.message) {
    // 其他错误，使用错误消息
    message = err.message;
  }

  // 记录错误日志
  if (!isOperational || statusCode >= 500) {
    console.error('错误详情:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
    });
  }

  // 构造响应
  const response: ApiResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  // 开发环境返回错误堆栈（仅包含安全信息）
  if (process.env.NODE_ENV === 'development') {
    response.data = {
      message: err.message,
      stack: err.stack,
      name: err.name,
    };
  }

  res.status(statusCode).json(response);
};

// 异步错误包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
