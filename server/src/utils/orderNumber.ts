// 出库单号生成工具
// 格式：OUT + YYYYMMDD + 流水号（3位）

/**
 * 生成出库单号
 * @param date 日期（可选，默认为当前日期）
 * @returns 格式化的出库单号，如：OUT20251211001
 */
export const generateOrderNumber = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `OUT${year}${month}${day}`;
};

/**
 * 解析出库单号，提取日期部分
 * @param orderNo 出库单号
 * @returns 日期字符串（YYYYMMDD）或 null
 */
export const parseDateFromOrderNumber = (orderNo: string): string | null => {
  const match = orderNo.match(/^OUT(\d{8})/);
  return match ? match[1] : null;
};

/**
 * 验证出库单号格式
 * @param orderNo 出库单号
 * @returns 是否有效
 */
export const isValidOrderNumber = (orderNo: string): boolean => {
  return /^OUT\d{8}\d{3}$/.test(orderNo);
};

/**
 * 从出库单号获取序号
 * @param orderNo 出库单号
 * @returns 序号（3位数字）或 null
 */
export const getSequenceFromOrderNumber = (orderNo: string): number | null => {
  const match = orderNo.match(/^OUT\d{8}(\d{3})$/);
  return match ? parseInt(match[1], 10) : null;
};
