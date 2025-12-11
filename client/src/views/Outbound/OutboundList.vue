<template>
  <div class="outbound-list">
    <div class="card">
      <!-- 工具栏 -->
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleSearch"
          />
          
          <el-input
            v-model="searchParams.customer"
            placeholder="搜索客户名称"
            style="width: 200px"
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
        </div>
        
        <div class="table-toolbar-right">
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建出库单
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="order_no" label="出库单号" width="150" />
        <el-table-column prop="outbound_date" label="出库日期" width="120" />
        <el-table-column prop="customer" label="客户" min-width="200" />
        <el-table-column prop="total_amount" label="总金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.total_amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm
              title="确定要删除这个出库单吗?"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="searchParams.page"
        v-model:page-size="searchParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; justify-content: flex-end"
        @current-change="loadData"
        @size-change="loadData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import { getOutboundOrders, deleteOutboundOrder } from '@/api/outbound';
import type { OutboundOrder } from '@/types/outbound';

const router = useRouter();

// 数据
const loading = ref(false);
const tableData = ref<OutboundOrder[]>([]);
const total = ref(0);
const dateRange = ref<string[]>([]);

const searchParams = reactive({
  startDate: '',
  endDate: '',
  customer: '',
  page: 1,
  pageSize: 10,
});

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // 更新日期范围参数
    if (dateRange.value && dateRange.value.length === 2) {
      searchParams.startDate = dateRange.value[0];
      searchParams.endDate = dateRange.value[1];
    } else {
      searchParams.startDate = '';
      searchParams.endDate = '';
    }

    const res = await getOutboundOrders(searchParams);
    tableData.value = res.data?.items || [];
    total.value = res.data?.total || 0;
  } catch (error) {
    console.error('加载出库单列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  searchParams.page = 1;
  loadData();
};

// 新建
const handleCreate = () => {
  router.push('/outbound/create');
};

// 查看
const handleView = (row: OutboundOrder) => {
  router.push(`/outbound/${row.order_no}`);
};

// 编辑
const handleEdit = (row: OutboundOrder) => {
  router.push(`/outbound/${row.order_no}/edit`);
};

// 删除
const handleDelete = async (row: OutboundOrder) => {
  try {
    await deleteOutboundOrder(row.order_no);
    ElMessage.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除出库单失败:', error);
  }
};

// 初始化
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.outbound-list {
  height: 100%;
}
</style>
