<template>
  <div class="outbound-detail">
    <div class="card">
      <el-page-header :icon="ArrowLeft" @back="router.back()">
        <template #content>
          <span>出库单详情</span>
        </template>
        <template #extra>
          <el-button :icon="Edit" @click="handleEdit">编辑</el-button>
          <el-button :icon="Printer" @click="handlePrint">打印</el-button>
        </template>
      </el-page-header>

      <el-descriptions
        v-if="order"
        :column="2"
        border
        style="margin-top: 24px"
      >
        <el-descriptions-item label="出库单号">{{ order.order_no }}</el-descriptions-item>
        <el-descriptions-item label="出库日期">{{ order.outbound_date }}</el-descriptions-item>
        <el-descriptions-item label="客户">{{ order.customer || '-' }}</el-descriptions-item>
        <el-descriptions-item label="总金额">
          <span style="font-size: 18px; font-weight: bold; color: #f56c6c">
            ¥{{ order.total_amount.toFixed(2) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ order.remarks || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(order.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(order.updated_at) }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h3 style="margin-bottom: 16px">产品明细</h3>
      
      <el-table
        v-if="order"
        :data="order.items"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="product_model" label="产品型号" width="150" />
        <el-table-column prop="product_name" label="产品名称" min-width="200" />
        <el-table-column prop="specification" label="规格" width="150" />
        <el-table-column prop="unit_price" label="单价" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.unit_price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" align="right" />
        <el-table-column prop="subtotal" label="小计" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.subtotal.toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Edit, Printer } from '@element-plus/icons-vue';
import { getOutboundOrderByNo } from '@/api/outbound';
import type { OutboundOrderDetail } from '@/types/outbound';

const router = useRouter();
const route = useRoute();

// 数据
const order = ref<OutboundOrderDetail | null>(null);

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

// 加载出库单详情
const loadData = async () => {
  const orderNo = route.params.orderNo as string;
  if (!orderNo) {
    ElMessage.error('缺少出库单号');
    router.back();
    return;
  }

  try {
    const res = await getOutboundOrderByNo(orderNo);
    order.value = res.data as OutboundOrderDetail;
  } catch (error) {
    console.error('加载出库单详情失败:', error);
    ElMessage.error('加载出库单详情失败');
    router.back();
  }
};

// 编辑
const handleEdit = () => {
  if (order.value) {
    router.push(`/outbound/${order.value.order_no}/edit`);
  }
};

// 打印
const handlePrint = () => {
  window.print();
};

// 初始化
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.outbound-detail {
  height: 100%;
}

@media print {
  .el-page-header {
    display: none;
  }
}
</style>
