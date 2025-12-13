<template>
  <div class="product-list">
    <div class="card">
      <!-- 工具栏 -->
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <el-input
            v-model="searchParams.keyword"
            placeholder="搜索产品型号或名称"
            style="width: 300px"
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select
            v-model="searchParams.status"
            placeholder="状态"
            style="width: 120px"
            clearable
            @change="handleSearch"
          >
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
          
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
        </div>
        
        <div class="table-toolbar-right">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新增产品
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
        <el-table-column prop="model" label="产品型号" width="150" />
        <el-table-column prop="name" label="产品名称" min-width="200" />
        <el-table-column prop="specification" label="规格" width="150" />
        <el-table-column prop="price" label="价格" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm
              title="确定要删除这个产品吗?"
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

    <!-- 产品表单对话框 -->
    <ProductForm
      v-model="formVisible"
      :product="currentProduct"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import { getProducts, deleteProduct } from '@/api/products';
import type { Product } from '@/types/product';
import ProductForm from './ProductForm.vue';

// 数据
const loading = ref(false);
const tableData = ref<Product[]>([]);
const total = ref(0);
const formVisible = ref(false);
const currentProduct = ref<Product | null>(null);

const searchParams = reactive({
  keyword: '',
  status: undefined as 'active' | 'inactive' | undefined,
  page: 1,
  pageSize: 10,
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const res = await getProducts(searchParams);
    tableData.value = res.data?.items || [];
    total.value = res.data?.total || 0;
  } catch (error) {
    console.error('加载产品列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  searchParams.page = 1;
  loadData();
};

// 新增
const handleAdd = () => {
  currentProduct.value = null;
  formVisible.value = true;
};

// 编辑
const handleEdit = (row: Product) => {
  currentProduct.value = row;
  formVisible.value = true;
};

// 删除
const handleDelete = async (row: Product) => {
  try {
    await deleteProduct(row.id);
    ElMessage.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除产品失败:', error);
  }
};

// 表单提交成功
const handleFormSuccess = () => {
  formVisible.value = false;
  loadData();
};

// 初始化
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.product-list {
  height: 100%;
}
</style>
