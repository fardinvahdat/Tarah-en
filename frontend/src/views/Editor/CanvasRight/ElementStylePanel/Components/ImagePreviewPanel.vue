
<template>
  <div class="image-preview" :style="{
    backgroundImage: `url(${handleElement.originSrc
      ? handleElement.originSrc
      : handleElement.getSrc()
      })`,
  }">
    <div class="image-actions justify-between">
      <FileInput class="file-input !w-auto" @change="(files) => $emit('replaceImage', files)">
        <button class="image-action-btn">
          <span>Placement</span>
        </button>
      </FileInput>
      <button class="image-action-btn" @click="$emit('resetImage')">
        <Icon name="rotate-ccw" class="icon" />
        <span>Reset</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue'
import { Image } from 'fabric'

const props = defineProps<{
  handleElement: Image
}>()

const emits = defineEmits<{
  replaceImage: [files: File[]]
  resetImage: []
}>()
</script>

<style lang="scss" scoped>
.image-preview {
  height: 160px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: #f1f0fb;
  border-radius: 12px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.05);

  .image-actions {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0));
    padding: 16px 10px 10px;
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;

    .image-action-btn {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 5px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      color: white;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      backdrop-filter: blur(4px);

      .icon {
        font-size: 16px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }
    }
  }

  &:hover .image-actions {
    opacity: 1;
  }
}
</style>
