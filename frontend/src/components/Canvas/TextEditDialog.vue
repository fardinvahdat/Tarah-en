
<template>
  <el-dialog 
    v-model="localVisible"
    class="md:max-w-[500px] max-w-[80%] w-full !p-0 !rounded-lg edit-text !bg-transparent" 
    center 
    :show-close="false"
    @close="$emit('close')" 
    @opened="focusTextarea"
  >
    <textarea
      ref="textareaRef"
      class="w-full h-full rounded-md p-3 bg-transparent text-white outline-none xl:text-3xl lg:text-2xl md:text-xl text-lg text-center"
      v-model="localStagedText"
      @keydown.enter.prevent="handleEnterKeydown" 
      @keydown.esc="$emit('close')"
      placeholder="Enter your text..."
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'

interface Props {
  modelValue: boolean
  stagedText: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', text: string): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const textareaRef = ref<HTMLTextAreaElement>()
const localStagedText = ref(props.stagedText)

const localVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Watch for staged text changes
watch(
  () => props.stagedText,
  (newText) => {
    localStagedText.value = newText
  }
)

const focusTextarea = () => {
  if (textareaRef.value) {
    nextTick(() => {
      setTimeout(() => {
        textareaRef.value?.focus()
      }, 100)
    })
  }
}

const handleEnterKeydown = (e: KeyboardEvent) => {
  if (e.shiftKey) {
    // Insert newline for Shift+Enter
    const textarea = textareaRef.value
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value

    localStagedText.value = text.substring(0, start) + '\n' + text.substring(end)

    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 1
    })
    return
  }

  // Save and close for Enter
  emit('save', localStagedText.value)
  emit('close')
}
</script>
