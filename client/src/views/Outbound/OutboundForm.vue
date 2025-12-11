<template>
  <div class="outbound-form">
    <div class="card">
      <el-page-header :icon="ArrowLeft" @back="router.back()">
        <template #content>
          <span>{{ isEdit ? '编辑出库单' : '新建出库单' }}</span>
        </template>
      </el-page-header>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        style="margin-top: 24px; max-width: 1200px"
      >
        <el-form-item label="出库日期" prop="outbound_date">
          <el-date-picker
            v-model="formData.outbound_date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="客户" prop="customer">
          <el-input
            v-model="formData.customer"
            placeholder="请输入客户名称"
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="formData.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            style="width: 600px"
          />
        </el-form-item>

        <el-divider />

        <el-form-item label="产品明细" required>
          <div style="width: 100%">
            <el-button type="primary" :icon="Plus" @click="handleAddItem" style="margin-bottom: 16px">
              添加产品
            </el-button>

            <el-table :data="formData.items" border style="width: 100%">
              <el-table-column label="产品型号" width="200">
                <template #default="{ row, $index }">
                  <ProductSelector v-model="row.product_model" @change="handleProductChange($index, $event)" />
                </template>
              </el-table-column>
              <el-table-column prop="product_name" label="产品名称" width="200" />
              <el-table-column prop="specification" label="规格" width="150" />
              <el-table-column prop="unit_price" label="单价" width="120" align="right">
                <template #default="{ row }">
                  ¥{{ row.unit_price?.toFixed(2) || '0.00' }}
                </template>
              </el-table-column>
              <el-table-column label="数量" width="150">
                <template #default="{ row }">
                  <el-input-number v-model="row.quantity" :min="0.01" :precision="2" :step="1" @change="calculateSubtotal(row)" />
                </template>
              </el-table-column>
              <el-table-column prop="subtotal" label="小计" width="120" align="right">
                <template #default="{ row }">
                  ¥{{ row.subtotal?.toFixed(2) || '0.00' }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="{ $index }">
                  <el-button link type="danger" @click="handleRemoveItem($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div style="margin-top: 16px; text-align: right; font-size: 18px; font-weight: bold">
              总计：¥{{ totalAmount.toFixed(2) }}
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button @click="router.back()">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            提交
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { ArrowLeft, Plus } from '@element-plus/icons-vue';
import { createOutboundOrder, updateOutboundOrder, getOutboundOrderByNo } from '@/api/outbound';
import type { CreateOutboundOrderDto, OutboundOrderDetail } from '@/types/outbound';
import type { Product } from '@/types/product';
import ProductSelector from '@/components/ProductSelector.vue';

const router = useRouter();
const route = useRoute();

// 数据
const formRef = ref<FormInstance>();
const submitting = ref(false);
const isEdit = computed(() => !!route.params.orderNo && route.name === 'OutboundEdit');

interface ItemForm {
  product_model: string;
  product_name: string;
  specification: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

const formData = reactive<CreateOutboundOrderDto & { items: ItemForm[] }>({
  outbound_date: new Date().toISOString().split('T')[0],
  customer: '',
  remarks: '',
  items: [],
});

// 验证规则
const rules: FormRules = {
  outbound_date: [{ required: true, message: '请选择出库日期', trigger: 'change' }],
};

// 计算总金额
const totalAmount = computed(() => {
  return formData.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
});

// 添加产品行
const handleAddItem = () => {
  formData.items.push({
    product_model: '',
    product_name: '',
    specification: '',
    unit_price: 0,
    quantity: 1,
    subtotal: 0,
  });
};

// 删除产品行
const handleRemoveItem = (index: number) => {
  formData.items.splice(index, 1);
};

// 产品选择变化
const handleProductChange = (index: number, product: Product | null) => {
  if (product) {
    const item = formData.items[index];
    item.product_name = product.name;
    item.specification = product.specification;
    item.unit_price = product.price;
    calculateSubtotal(item);
  }
};

// 计算小计
const calculateSubtotal = (item: ItemForm) => {
  item.subtotal = (item.unit_price || 0) * (item.quantity || 0);
};

// 加载出库单数据（编辑模式）
const loadOutboundOrder = async () => {
  const orderNo = route.params.orderNo as string;
  if (!orderNo) return;

  try {
    const res = await getOutboundOrderByNo(orderNo);
    const order = res.data as OutboundOrderDetail;
    
    formData.outbound_date = order.outbound_date;
    formData.customer = order.customer || '';
    formData.remarks = order.remarks || '';
    formData.items = order.items.map(item => ({
      product_model: item.product_model,
      product_name: item.product_name,
      specification: item.specification,
      unit_price: item.unit_price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));
  } catch (error) {
    console.error('加载出库单失败:', error);
    ElMessage.error('加载出库单失败');
    router.back();
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    if (formData.items.length === 0) {
      ElMessage.warning('请至少添加一个产品');
      return;
    }

    submitting.value = true;

    const submitData: CreateOutboundOrderDto = {
      outbound_date: formData.outbound_date,
      customer: formData.customer,
      remarks: formData.remarks,
      items: formData.items.map(item => ({
        product_model: item.product_model,
        quantity: item.quantity,
      })),
    };

    if (isEdit.value) {
      await updateOutboundOrder(route.params.orderNo as string, submitData);
      ElMessage.success('更新成功');
    } else {
      await createOutboundOrder(submitData);
      ElMessage.success('创建成功');
    }

    router.back();
  } catch (error: any) {
    if (error.errors) {
      return;
    }
    console.error('提交失败:', error);
  } finally {
    submitting.value = false;
  }
};

// 初始化
onMounted(() => {
  if (isEdit.value) {
    loadOutboundOrder();
  } else {
    // 新建模式，添加一个空行
    handleAddItem();
  }
});
</script>

<style scoped>
.outbound-form {
  height: 100%;
}
</style>
