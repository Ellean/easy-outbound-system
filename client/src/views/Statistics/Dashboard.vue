<template>
  <div class="dashboard">
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-title">总订单数</div>
          <div class="stat-card-value">{{ overview.total_orders }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-title">总金额</div>
          <div class="stat-card-value">¥{{ overview.total_amount?.toFixed(2) || '0.00' }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-title">客户数</div>
          <div class="stat-card-value">{{ overview.total_customers }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-title">平均订单金额</div>
          <div class="stat-card-value">¥{{ overview.avg_order_amount?.toFixed(2) || '0.00' }}</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <div class="card">
          <h3 style="margin-bottom: 16px">产品出库排行</h3>
          <el-table
            v-loading="loading"
            :data="productStats"
            stripe
            style="width: 100%"
            max-height="400"
          >
            <el-table-column prop="model" label="产品型号" width="120" />
            <el-table-column prop="name" label="产品名称" min-width="150" />
            <el-table-column prop="total_quantity" label="出库数量" width="100" align="right" />
            <el-table-column prop="total_amount" label="金额" width="120" align="right">
              <template #default="{ row }">
                ¥{{ row.total_amount.toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="card">
          <h3 style="margin-bottom: 16px">客户排行</h3>
          <el-table
            v-loading="loading"
            :data="customerStats"
            stripe
            style="width: 100%"
            max-height="400"
          >
            <el-table-column prop="customer" label="客户名称" min-width="200" />
            <el-table-column prop="order_count" label="订单数" width="100" align="right" />
            <el-table-column prop="total_amount" label="总金额" width="120" align="right">
              <template #default="{ row }">
                ¥{{ row.total_amount.toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getDashboardOverview,
  getProductStatistics,
  getCustomerStatistics,
} from '@/api/statistics';
import type { DashboardOverview, ProductStatistics, CustomerStatistics } from '@/types';

// 数据
const loading = ref(false);
const overview = ref<DashboardOverview>({
  total_orders: 0,
  total_amount: 0,
  total_customers: 0,
  avg_order_amount: 0,
});
const productStats = ref<ProductStatistics[]>([]);
const customerStats = ref<CustomerStatistics[]>([]);

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // 加载概览数据
    const overviewRes = await getDashboardOverview();
    overview.value = overviewRes.data || overview.value;

    // 加载产品统计（前10）
    const productRes = await getProductStatistics({ limit: 10 });
    productStats.value = productRes.data || [];

    // 加载客户统计（前10）
    const customerRes = await getCustomerStatistics({ limit: 10 });
    customerStats.value = customerRes.data || [];
  } catch (error) {
    console.error('加载统计数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.dashboard {
  height: 100%;
}
</style>
