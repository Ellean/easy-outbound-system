// 统计分析路由
import { Router } from 'express';
import { StatisticsController } from '../controllers/statisticsController';

const router = Router();

// 路由定义
router.get('/products', StatisticsController.getProductStatistics);
router.get('/timeline', StatisticsController.getTimelineStatistics);
router.get('/customers', StatisticsController.getCustomerStatistics);
router.get('/dashboard', StatisticsController.getDashboardOverview);

export default router;
