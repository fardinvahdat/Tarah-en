
<template>
  <div class="line-pool shape-explorer">
    <div class="category shape-category" v-for="(item, i) in PathLineLibs" :key="item.type">
      <div class="category-header">
        <h3 class="category-title">{{ item.type }}</h3>
        <div class="category-indicator"></div>
      </div>
      <div class="line-list">
        <div class="line-item" v-for="(line, j) in item.children" :key="j">
          <div class="line-content" @click="selectLine(line)">
            <svg overflow="visible" width="20" height="20">
              <defs>
                <LinePointMarker class="line-marker" v-if="line.points[0]" :id="`preset-line-${i}-${j}`"
                  position="start" :type="line.points[0]" color="currentColor" :baseSize="2" />
                <LinePointMarker class="line-marker" v-if="line.points[1]" :id="`preset-line-${i}-${j}`" position="end"
                  :type="line.points[1]" color="currentColor" :baseSize="2" />
              </defs>
              <path class="line-path" :d="line.path" stroke="currentColor" fill="none" stroke-width="2"
                :stroke-dasharray="line.style === 'solid' ? '0, 0' : '4, 1'"
                :marker-start="line.points[0] ? `url(#${`preset-line-${i}-${j}`}-${line.points[0]}-start)` : ''"
                :marker-end="line.points[1] ? `url(#${`preset-line-${i}-${j}`}-${line.points[1]}-end)` : ''"></path>
            </svg>
            <!-- <div class="line-name">{{ line.title || 'خط' }}</div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PathLineLibs, LinePoolItem } from '@/configs/lines'

const emit = defineEmits<{
  (event: 'select', payload: LinePoolItem): void
}>()

const selectLine = (line: LinePoolItem) => {
  emit('select', line)
}
</script>

<style lang="scss" scoped>
.line-pool {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
}

.category {
  margin-bottom: 16px;
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 5px;
  border-bottom: 1px solid #f0f0f0;
}

.category-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.category-indicator {
  height: 3px;
  width: 20px;
  background-color: #22319e;
  margin-right: 10px;
  border-radius: 2px;
}

.line-list {
  @include flex-grid-layout();
  gap: 8px;
}

.line-item {
  @include flex-grid-layout-children(5, 19%);
  height: 0;
  padding-bottom: 19%;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.line-content {
  @include absolute-0();
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #666;
  background-color: #f6f6f6;
  border-radius: 6px;
  padding: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: #22319e;
    background-color: #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  svg:not(:root) {
    overflow: visible;
    margin-bottom: 4px;
  }
}

.line-name {
  font-size: 11px;
  text-align: center;
  margin-top: 4px;
}

// Responsive adjustments
@media (max-width: 768px) {
  .line-pool {
    padding: 5px;
  }
  
  .line-item {
    @include flex-grid-layout-children(3, 32%);
    padding-bottom: 32%;
  }
}
</style>
