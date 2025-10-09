<template>
  <div class="effect-selector">
    <div class="effect-selector-label">{{ label }}</div>
    <div class="effect-options">
      <div v-for="option in options" :key="option.value" class="effect-option"
        :class="{ 'active': modelValue === option.value }" @click="updateValue(option.value)">
        <div class="effect-option-icon">
          <Icon :name="option.icon || 'filter'" />
        </div>
        <div class="effect-option-label">{{ option.label }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  label: {
    type: String,
    default: 'Select'
  }
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (value: string) => {
  emit('update:modelValue', value);
};
</script>

<style lang="scss" scoped>
.effect-selector {
  margin-bottom: 16px;

  .effect-selector-label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }

  .effect-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;

    .effect-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 8px;
      border-radius: 12px;
      background-color: #f9f9f9;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid #eee;

      &:hover {
        background-color: #f0f0f0;
        transform: translateY(-2px);
      }

      &.active {
        background-color: #22319e;
        color: white;
        border-color: #22319e;
      }

      .effect-option-icon {
        font-size: 18px;
        margin-bottom: 4px;
      }

      .effect-option-label {
        font-size: 10px;
        text-align: center;
      }
    }
  }
}
</style>
