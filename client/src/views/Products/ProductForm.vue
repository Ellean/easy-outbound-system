<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑产品' : '新增产品'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="产品型号" prop="model">
        <el-input
          v-model="formData.model"
          placeholder="请输入产品型号"
          :disabled="isEdit"
        />
      </el-form-item>

      <el-form-item label="产品名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入产品名称" />
      </el-form-item>

      <el-form-item label="规格" prop="specification">
        <el-input v-model="formData.specification" placeholder="请输入规格" />
      </el-form-item>

      <el-form-item label="价格" prop="price">
        <el-input-number
          v-model="formData.price"
          :min="0"
          :precision="2"
          :step="0.01"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="active">启用</el-radio>
          <el-radio label="inactive">停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { createProduct, updateProduct } from '@/api/products';
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/product';

// Props
interface Props {
  modelValue: boolean;
  product?: Product | null;
}

const props = withDefaults(defineProps<Props>(), {
  product: null,
});

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'success'): void;
}>();

// 数据
const formRef = ref<FormInstance>();
const submitting = ref(false);
const isEdit = computed(() => !!props.product);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formData = reactive<CreateProductDto & { id?: number }>({
  model: '',
  name: '',
  specification: '',
  price: 0,
  status: 'active',
  remarks: '',
});

// 验证规则
const rules: FormRules = {
  model: [{ required: true, message: '请输入产品型号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  specification: [{ required: true, message: '请输入规格', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
};

// 监听产品变化，初始化表单
watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      Object.assign(formData, newProduct);
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    model: '',
    name: '',
    specification: '',
    price: 0,
    status: 'active',
    remarks: '',
  });
  formRef.value?.clearValidate();
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  resetForm();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    if (isEdit.value && formData.id) {
      // 更新产品
      const updateData: UpdateProductDto = {
        name: formData.name,
        specification: formData.specification,
        price: formData.price,
        status: formData.status,
        remarks: formData.remarks,
      };
      await updateProduct(formData.id, updateData);
      ElMessage.success('更新成功');
    } else {
      // 创建产品
      const createData: CreateProductDto = {
        model: formData.model,
        name: formData.name,
        specification: formData.specification,
        price: formData.price,
        status: formData.status,
        remarks: formData.remarks,
      };
      await createProduct(createData);
      ElMessage.success('创建成功');
    }

    emit('success');
    handleClose();
  } catch (error: any) {
    if (error.errors) {
      // 表单验证错误
      return;
    }
    console.error('提交失败:', error);
  } finally {
    submitting.value = false;
  }
};
</script>
