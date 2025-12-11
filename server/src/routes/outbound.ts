// 出库单路由
import { Router } from 'express';
import { body } from 'express-validator';
import { OutboundController } from '../controllers/outboundController';
import { validate } from '../middlewares/validator';

const router = Router();

// 验证规则
const createOutboundOrderValidation = [
  body('outbound_date').isDate().withMessage('出库日期格式不正确'),
  body('customer').optional().trim(),
  body('remarks').optional().trim(),
  body('items').isArray({ min: 1 }).withMessage('出库单必须包含至少一个产品'),
  body('items.*.product_model').trim().notEmpty().withMessage('产品型号不能为空'),
  body('items.*.quantity').isFloat({ gt: 0 }).withMessage('数量必须大于0'),
  validate,
];

const updateOutboundOrderValidation = [
  body('outbound_date').optional().isDate().withMessage('出库日期格式不正确'),
  body('customer').optional().trim(),
  body('remarks').optional().trim(),
  body('items').optional().isArray({ min: 1 }).withMessage('出库单必须包含至少一个产品'),
  body('items.*.product_model').optional().trim().notEmpty().withMessage('产品型号不能为空'),
  body('items.*.quantity').optional().isFloat({ gt: 0 }).withMessage('数量必须大于0'),
  validate,
];

// 路由定义
router.get('/', OutboundController.getOutboundOrders);
router.get('/:orderNo', OutboundController.getOutboundOrderByNo);
router.post('/', createOutboundOrderValidation, OutboundController.createOutboundOrder);
router.put('/:orderNo', updateOutboundOrderValidation, OutboundController.updateOutboundOrder);
router.delete('/:orderNo', OutboundController.deleteOutboundOrder);

export default router;
