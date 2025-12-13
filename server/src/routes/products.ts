// 产品路由
import { Router } from 'express';
import { body } from 'express-validator';
import { ProductController } from '../controllers/productController';
import { validate } from '../middlewares/validator';

const router = Router();

// 验证规则
const createProductValidation = [
  body('model').trim().notEmpty().withMessage('产品型号不能为空'),
  body('name').trim().notEmpty().withMessage('产品名称不能为空'),
  body('specification').trim().notEmpty().withMessage('规格不能为空'),
  body('price').isFloat({ min: 0 }).withMessage('价格必须为非负数'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('状态必须为 active 或 inactive'),
  validate,
];

const updateProductValidation = [
  body('name').optional().trim().notEmpty().withMessage('产品名称不能为空'),
  body('specification').optional().trim().notEmpty().withMessage('规格不能为空'),
  body('price').optional().isFloat({ min: 0 }).withMessage('价格必须为非负数'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('状态必须为 active 或 inactive'),
  validate,
];

// 路由定义
router.get('/search', ProductController.searchProducts);
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', createProductValidation, ProductController.createProduct);
router.put('/:id', updateProductValidation, ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

export default router;
