// HTTP 请求工具
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';
import { ElMessage } from 'element-plus';

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // TODO: 实现身份验证
    // 当实现身份验证时，在这里添加 token
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    
    // 如果响应成功
    if (res.success) {
      return response;
    }
    
    // 如果响应失败，显示错误消息
    ElMessage.error(res.message || '请求失败');
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  (error) => {
    console.error('响应错误:', error);
    
    let message = '网络错误，请稍后重试';
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          message = data.message || '请求参数错误';
          break;
        case 401:
          message = '未授权，请重新登录';
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = data.message || '请求的资源不存在';
          break;
        case 500:
          message = '服务器错误';
          break;
        default:
          message = data.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      message = '无法连接到服务器，请检查网络';
    }
    
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

// 封装请求方法
export default request;

// 通用 GET 请求
export const get = <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return request.get(url, { params, ...config }).then((res) => res.data);
};

// 通用 POST 请求
export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return request.post(url, data, config).then((res) => res.data);
};

// 通用 PUT 请求
export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return request.put(url, data, config).then((res) => res.data);
};

// 通用 DELETE 请求
export const del = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return request.delete(url, config).then((res) => res.data);
};
