<template>
  <div v-if="user.workspaces?.length" class="workspaces-container">
    <div class="section-header">
      <h1 class="section-title">Tarahی های اخیر</h1>
      <div class="section-line"></div>
    </div>

    <ul class="workspaces-grid" v-if="user.workspaces?.length">
      <li
        v-for="(item, index) in user?.workspaces"
        :key="index"
        @click="handleCickWorkspace(item)"
        class="workspace-item"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="workspace-content">
          <img :src="item.image" :alt="item.title" class="workspace-image" />
          <div class="workspace-title">{{ item.title }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store";
import { useRouter } from "vue-router";

const { user } = storeToRefs(useAuthStore());
const router = useRouter();

const handleCickWorkspace = ({ width, height, id: workspaceID }) => {
  router.replace({
    path: `/studio`,
    query: {
      width,
      height,
      workspaceID,
    },
  });
};
</script>

<style lang="scss" scoped>
.workspaces-container {
  // overflow: hidden;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.section-line {
  height: 4px;
  width: 60px;
  background-color: $themeColor;
  border-radius: 2px;
  margin-top: 8px;
}

.workspaces-grid {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 8px 0 20px;
  gap: 16px;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 10px;

    &:hover {
      background: #aaa;
    }
  }
}

.workspace-item {
  min-width: 60%;
  flex-shrink: 0;
  animation: slideRight 0.6s ease forwards;
  opacity: 0;
  transform: translateX(-30px);

  @media (min-width: 768px) {
    min-width: 33%;
  }

  @media (min-width: 1024px) {
    min-width: 20%;
  }

  @keyframes slideRight {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

.workspace-content {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #eee;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-color: $themeColor;

    .workspace-image {
      transform: scale(1.05);
    }
  }
}

.workspace-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.workspace-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  padding: 0 4px;
}
</style>
