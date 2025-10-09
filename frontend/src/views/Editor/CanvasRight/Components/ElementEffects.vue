
<template>
  <div class="element-effects">
    <el-row :gutter="12" class="action-row">
      <el-col :span="18">
        <el-button class="full-btn">جلوه های ویژه</el-button>
      </el-col>
      <el-col :span="6">
        <el-button class="full-btn btn-right" @click="changeElementEffect">
          <Icon name="setting" class="action-icon" />
        </el-button>
      </el-col>
    </el-row>
    
    <div class="effects-grid">
      <div class="effect-item" v-for="(effect, index) in visualEffects" :key="index" @click="applyEffect(effect.id)">
        <div class="effect-preview" :class="{ 'active': selectedEffect === effect.id }">
          <Icon :name="effect.icon" />
        </div>
        <div class="effect-name">{{ effect.name }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/store';
import { RightStates } from "@/types/elements";

const { rightState } = storeToRefs(useMainStore());
const selectedEffect = ref('normal');

const visualEffects = [
  { id: 'normal', name: 'عادی', icon: 'image' },
  { id: 'shadow', name: 'سایه', icon: 'shadow' },
  { id: 'neon', name: 'نئون', icon: 'neon' },
  { id: 'glitch', name: 'گلیچ', icon: 'glitch' },
  { id: 'echo', name: 'اکو', icon: 'echo' },
  { id: 'outline', name: 'خط دور', icon: 'outline' }
];

const changeElementEffect = () => {
  rightState.value = RightStates.ELEMENT_EFFECT;
}

const applyEffect = (effectId) => {
  selectedEffect.value = effectId;
  // Apply effect logic would go here
  console.log('Applied effect:', effectId);
}
</script>

<style lang="scss" scoped>
.element-effects {
  padding: 4px 0;
}

.action-row {
  margin-bottom: 16px;
}

.full-btn {
  width: 100%;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.btn-right {
    display: flex;
    justify-content: center;
  }
}

.action-icon {
  font-size: 16px;
}

.effects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.effect-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.effect-preview {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  
  &:hover {
    background-color: #e5e5e5;
    transform: translateY(-2px);
  }
  
  &.active {
    border-color: var(--el-color-primary);
    background-color: rgba(155, 135, 245, 0.1);
  }
}

.effect-name {
  font-size: 12px;
  color: #555;
  text-align: center;
}
</style>
