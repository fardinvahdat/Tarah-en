<template>
  <div v-if="showWidget" class="performance-widget" :class="performanceClass">
    <!-- Performance Indicator -->
    <div class="performance-header" @click="toggleExpanded">
      <div class="performance-score">
        <span class="score-value">{{ performanceScore }}</span>
        <span class="score-label">%</span>
      </div>
      <div class="performance-status">
        <div class="status-indicator" :class="statusClass"></div>
        <span class="status-text">{{ statusText }}</span>
      </div>
      <svg class="expand-icon" :class="{ expanded: isExpanded }" viewBox="0 0 24 24" width="16" height="16">
        <path d="M7 10l5 5 5-5z" fill="currentColor"/>
      </svg>
    </div>

    <!-- Detailed Metrics (Expandable) -->
    <div v-if="isExpanded" class="performance-details">
      <div class="metrics-grid">
        <div class="metric">
          <span class="metric-label">FPS</span>
          <span class="metric-value" :class="{ warning: metrics.fps < 30 }">{{ metrics.fps }}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Memory</span>
          <span class="metric-value" :class="{ warning: metrics.memoryPressure === 'high' }">
            {{ metrics.memoryUsage }}MB
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Objects</span>
          <span class="metric-value" :class="{ warning: metrics.canvasObjects > 200 }">
            {{ metrics.canvasObjects }}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Render</span>
          <span class="metric-value" :class="{ warning: metrics.renderTime > 16 }">
            {{ Math.round(metrics.renderTime) }}ms
          </span>
        </div>
      </div>

      <!-- Warnings -->
      <div v-if="warnings.length > 0" class="warnings">
        <h4 class="warnings-title">⚠️ Performance Issues:</h4>
        <ul class="warnings-list">
          <li v-for="warning in warnings" :key="warning" class="warning-item">
            {{ warning }}
          </li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="performance-actions">
        <button 
          class="action-button optimize"
          @click="triggerOptimization"
          :disabled="isOptimizing"
        >
          {{ isOptimizing ? 'Optimizing...' : '🚀 Optimize' }}
        </button>
        <button class="action-button hide" @click="hideWidget">
          Hide Widget
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePerformanceMonitor } from '@/composables/usePerformanceMonitor'

const { metrics, warnings, triggerEmergencyOptimization, getPerformanceSummary } = usePerformanceMonitor()

const isExpanded = ref(false)
const showWidget = ref(true)
const isOptimizing = ref(false)

const performanceScore = computed(() => {
  return getPerformanceSummary().overall
})

const performanceClass = computed(() => {
  const score = performanceScore.value
  if (score >= 80) return 'performance-good'
  if (score >= 60) return 'performance-medium'
  return 'performance-poor'
})

const statusClass = computed(() => {
  const score = performanceScore.value
  if (score >= 80) return 'status-good'
  if (score >= 60) return 'status-medium'
  return 'status-poor'
})

const statusText = computed(() => {
  const score = performanceScore.value
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Poor'
  return 'Critical'
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const hideWidget = () => {
  showWidget.value = false
  localStorage.setItem('performance-widget-hidden', 'true')
}

const triggerOptimization = async () => {
  isOptimizing.value = true
  try {
    await triggerEmergencyOptimization()
    setTimeout(() => {
      isOptimizing.value = false
    }, 2000)
  } catch (error) {
    console.error('Optimization failed:', error)
    isOptimizing.value = false
  }
}

// Auto-show widget if performance is poor
watch(performanceScore, (score) => {
  if (score < 40 && !showWidget.value) {
    showWidget.value = true
  }
})

// Check if widget should be hidden on mount
onMounted(() => {
  const hidden = localStorage.getItem('performance-widget-hidden')
  if (hidden === 'true' && performanceScore.value > 60) {
    showWidget.value = false
  }
})
</script>

<style scoped>
.performance-widget {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px;
  color: white;
  font-size: 12px;
  min-width: 200px;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.performance-widget.performance-good {
  border-left: 4px solid #10b981;
}

.performance-widget.performance-medium {
  border-left: 4px solid #f59e0b;
}

.performance-widget.performance-poor {
  border-left: 4px solid #ef4444;
}

.performance-header {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.performance-score {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.score-value {
  font-size: 18px;
  font-weight: bold;
}

.score-label {
  font-size: 12px;
  opacity: 0.7;
}

.performance-status {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
}

.status-indicator.status-good {
  background: #10b981;
}

.status-indicator.status-medium {
  background: #f59e0b;
}

.status-indicator.status-poor {
  background: #ef4444;
}

.status-text {
  font-size: 11px;
  font-weight: 500;
}

.expand-icon {
  transition: transform 0.3s ease;
  opacity: 0.6;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.performance-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.metric-label {
  font-size: 10px;
  opacity: 0.7;
}

.metric-value {
  font-weight: 600;
  font-size: 11px;
}

.metric-value.warning {
  color: #ef4444;
}

.warnings {
  margin-bottom: 12px;
}

.warnings-title {
  font-size: 11px;
  margin: 0 0 6px 0;
  color: #f59e0b;
}

.warnings-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.warning-item {
  font-size: 10px;
  padding: 2px 0;
  opacity: 0.8;
}

.performance-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.optimize {
  background: #10b981;
  color: white;
}

.action-button.optimize:hover:not(:disabled) {
  background: #059669;
}

.action-button.optimize:disabled {
  background: #6b7280;
  cursor: not-allowed;
}

.action-button.hide {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.action-button.hide:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .performance-widget {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .performance-actions {
    flex-direction: column;
  }
}
</style>