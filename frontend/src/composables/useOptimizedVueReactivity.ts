
import { ref, shallowRef, triggerRef, watchEffect, onScopeDispose } from 'vue'

// Memory-efficient reactive state management for mobile
export function useShallowReactiveState<T extends Record<string, any>>(initialState: T) {
  const state = shallowRef(initialState)
  
  const updateState = (updates: Partial<T>) => {
    state.value = { ...state.value, ...updates }
    triggerRef(state)
  }
  
  const resetState = () => {
    state.value = { ...initialState }
    triggerRef(state)
  }
  
  return {
    state,
    updateState,
    resetState
  }
}

// Debounced state updates for performance
export function useDebouncedState<T>(initialValue: T, delay: number = 16) {
  const state = ref(initialValue)
  const pendingUpdate = ref<T | null>(null)
  let timeoutId: NodeJS.Timeout | null = null
  
  const setValue = (value: T) => {
    pendingUpdate.value = value
    
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      state.value = pendingUpdate.value as T
      pendingUpdate.value = null
      timeoutId = null
    }, delay)
  }
  
  onScopeDispose(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })
  
  return {
    state,
    setValue,
    pending: pendingUpdate
  }
}

// Memory pool for object reuse
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn: (obj: T) => void
  
  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn
    this.resetFn = resetFn
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn())
    }
  }
  
  acquire(): T {
    const obj = this.pool.pop()
    if (obj) {
      this.resetFn(obj)
      return obj
    }
    return this.createFn()
  }
  
  release(obj: T) {
    if (this.pool.length < 50) { // Limit pool size
      this.pool.push(obj)
    }
  }
  
  clear() {
    this.pool.length = 0
  }
}
