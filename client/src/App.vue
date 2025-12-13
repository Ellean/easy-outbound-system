<template>
  <div id="app">
    <el-container style="height: 100vh">
      <!-- 侧边栏 -->
      <el-aside :width="sidebarCollapsed ? '64px' : '200px'" class="sidebar">
        <div class="logo">
          <h2 v-if="!sidebarCollapsed">出库系统</h2>
          <span v-else>出</span>
        </div>
        
        <el-menu
          :default-active="currentRoute"
          :collapse="sidebarCollapsed"
          router
          class="sidebar-menu"
        >
          <el-menu-item index="/products">
            <el-icon><Box /></el-icon>
            <template #title>产品管理</template>
          </el-menu-item>
          
          <el-menu-item index="/outbound">
            <el-icon><Tickets /></el-icon>
            <template #title>出库管理</template>
          </el-menu-item>
          
          <el-menu-item index="/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>统计分析</template>
          </el-menu-item>
        </el-menu>
        
        <div class="sidebar-footer">
          <el-button
            :icon="sidebarCollapsed ? Expand : Fold"
            circle
            @click="toggleSidebar"
          />
        </div>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="header">
          <div class="header-content">
            <span class="page-title">{{ pageTitle }}</span>
          </div>
        </el-header>

        <!-- 主要内容 -->
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { Box, Tickets, DataAnalysis, Expand, Fold } from '@element-plus/icons-vue';

const route = useRoute();
const appStore = useAppStore();

const currentRoute = computed(() => route.path);
const pageTitle = computed(() => (route.meta.title as string) || '简易出库系统');
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed);

const toggleSidebar = () => {
  appStore.toggleSidebar();
};
</script>

<style scoped>
.sidebar {
  background-color: #001529;
  color: #fff;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background-color: #001529;
}

.sidebar-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.65);
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-menu-item.is-active) {
  color: #fff;
  background-color: #1890ff;
}

.sidebar-footer {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #262626;
}

.main-content {
  background-color: #f0f2f5;
  padding: 24px;
  overflow: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
