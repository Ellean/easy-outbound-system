// Vue Router 配置
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/products',
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/Products/ProductList.vue'),
    meta: { title: '产品管理' },
  },
  {
    path: '/outbound',
    name: 'Outbound',
    component: () => import('@/views/Outbound/OutboundList.vue'),
    meta: { title: '出库管理' },
  },
  {
    path: '/outbound/create',
    name: 'OutboundCreate',
    component: () => import('@/views/Outbound/OutboundForm.vue'),
    meta: { title: '新建出库单' },
  },
  {
    path: '/outbound/:orderNo',
    name: 'OutboundDetail',
    component: () => import('@/views/Outbound/OutboundDetail.vue'),
    meta: { title: '出库单详情' },
  },
  {
    path: '/outbound/:orderNo/edit',
    name: 'OutboundEdit',
    component: () => import('@/views/Outbound/OutboundForm.vue'),
    meta: { title: '编辑出库单' },
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/Statistics/Dashboard.vue'),
    meta: { title: '统计分析' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 简易出库系统`;
  }
  next();
});

export default router;
