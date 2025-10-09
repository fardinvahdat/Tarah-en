
<template>
  <div>
    <!-- Image Editing Tabs -->
    <div class="edit-tabs">
      <div v-for="(tab, index) in tabs" :key="index" class="edit-tab" 
        :class="{ 'active': activeTab === tab.id }"
        @click="$emit('update:activeTab', tab.id)">
        <!-- <Icon :name="tab.icon" class="edit-tab-icon" /> -->
        <span class="edit-tab-label">{{ tab.label }}</span>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content" :key="activeTab">
      <!-- Filters Tab -->
      <div v-if="activeTab === 'filter'" class="filter-section">
        <ElementFilter />
      </div>

      <!-- Mask Tab -->
      <div v-else-if="activeTab === 'mask'" class="mask-section">
        <ElementMask />
      </div>

      <!-- Adjustments Tab -->
      <div v-else-if="activeTab === 'adjust'" class="adjust-section flex flex-col gap-2">
        <ElementOutline />
        <ElementShadow :hasShadow="hasShadow" />
        <ElementOpacity />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'
import ElementFilter from '../../Components/ElementFilter.vue'
import ElementMask from '../../Components/ElementMask.vue'
import ElementOutline from '../../Components/ElementOutline.vue'
import ElementShadow from '../../Components/ElementShadow.vue'
import ElementOpacity from '../../Components/ElementOpacity.vue'

const props = defineProps<{
  activeTab: string
  hasShadow: boolean
}>()

const emits = defineEmits<{
  'update:activeTab': [value: string]
}>()

const tabs = [
  { id: 'filter', label: 'Filter', icon: 'filter' },
  { id: 'mask', label: 'Mask', icon: 'mask' },
  { id: 'adjust', label: 'Settings', icon: 'sliders-horizontal' }
]
</script>

<style lang="scss" scoped>
.edit-tabs {
  display: flex;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;

  .edit-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 12px 8px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    font-size: 12px;

    .edit-tab-icon {
      font-size: 18px;
    }

    &:hover:not(.active) {
      background-color: #f9f9f9;
    }

    &.active {
      background-color: #22319e;
      color: white;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 3px;
        background-color: white;
        border-radius: 3px 3px 0 0;
      }
    }
  }
}

.tab-content {
  padding: 12px 2px;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
