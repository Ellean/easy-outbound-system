<template>
  <el-select
    v-model="selectedModel"
    filterable
    remote
    reserve-keyword
    placeholder="搜索产品型号或名称"
    :remote-method="handleSearch"
    :loading="loading"
    @change="handleChange"
    style="width: 100%"
  >
    <el-option
      v-for="product in products"
      :key="product.id"
      :label="`${product.model} - ${product.name} - ${product.specification}`"
      :value="product.model"
    >
      <div style="display: flex; justify-content: space-between">
        <span>{{ product.model }} - {{ product.name }}</span>
        <span style="color: #8c8c8c">¥{{ product.price.toFixed(2) }}</span>
      </div>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { searchProducts } from '@/api/products';
import type { Product } from '@/types/product';

// Props
interface Props {
  modelValue: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', product: Product | null): void;
}>();

// 数据
const loading = ref(false);
const products = ref<Product[]>([]);
const selectedModel = ref(props.modelValue);
let searchTimer: number | null = null;

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  selectedModel.value = newVal;
});

// 搜索产品（防抖）
const handleSearch = (query: string) => {
  if (!query) {
    products.value = [];
    return;
  }

  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  searchTimer = window.setTimeout(async () => {
    loading.value = true;
    try {
      const res = await searchProducts(query);
      products.value = res.data || [];
    } catch (error) {
      console.error('搜索产品失败:', error);
      products.value = [];
    } finally {
      loading.value = false;
    }
  }, 300);
};

// 选择变化
const handleChange = (value: string) => {
  emit('update:modelValue', value);
  
  const selectedProduct = products.value.find(p => p.model === value);
  emit('change', selectedProduct || null);
};
</script>
