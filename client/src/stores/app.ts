// Pinia Store
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  // 应用配置
  const apiBaseUrl = ref(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000');
  
  // 侧边栏折叠状态
  const sidebarCollapsed = ref(false);
  
  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };
  
  // 加载状态
  const loading = ref(false);
  
  // 设置加载状态
  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  return {
    apiBaseUrl,
    sidebarCollapsed,
    toggleSidebar,
    loading,
    setLoading,
  };
});
