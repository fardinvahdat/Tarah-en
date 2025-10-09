import { computed, readonly, ref, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'

// Optimized store composable that reduces reactivity overhead
export function useOptimizedStore<T>(store: any) {
  // Use shallow refs for complex objects to reduce reactivity overhead
  const createOptimizedRefs = (storeInstance: T) => {
    const refs = storeToRefs(storeInstance)
    const optimizedRefs: any = {}
    
    Object.keys(refs).forEach(key => {
      const ref = refs[key as keyof typeof refs]
      // Use shallow ref for complex objects, regular ref for primitives
      if (typeof ref.value === 'object' && ref.value !== null) {
        optimizedRefs[key] = shallowRef(ref.value)
      } else {
        optimizedRefs[key] = ref
      }
    })
    
    return optimizedRefs
  }
  
  return createOptimizedRefs(store)
}

// Debounced reactive updates for expensive operations
export function useDebouncedReactive<T>(
  getValue: () => T,
  delay: number = 100
) {
  const value = ref<T>(getValue())
  let timeoutId: NodeJS.Timeout | null = null
  
  const update = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      const newValue = getValue()
      value.value = newValue
    }, delay)
  }
  
  return {
    value: readonly(value),
    update
  }
}

// Memoized computed for expensive calculations
export function useMemoizedComputed<T>(
  fn: () => T,
  dependencies: any[] = []
) {
  const cache = new Map()
  
  return computed(() => {
    const key = JSON.stringify(dependencies)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn()
    cache.set(key, result)
    
    // Clean up old cache entries (keep last 10)
    if (cache.size > 10) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    return result
  })
}
