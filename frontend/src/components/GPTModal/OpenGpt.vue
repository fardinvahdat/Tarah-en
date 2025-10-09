
<template>
  <el-dialog v-model="dialogVisible" :width="500" :title="'Open ChatGPT-4'" class="upload-dialog"
    :before-close="handleClose" :close-on-click-modal="false">
    <div>
      <div class="mb-[20px] text-center">مبتدی تا متوسط، متوسط ​​تا پیشرفته، توسعه جلویی
        ساده تر و کارآمدتر!</div>
      <div class="mb-[20px] text-center">پیشنهاد زمان محدود، تعداد محدود، اولویت اول!</div>
      <div class="cursor-pointer text-center text-[18px] font-bold" @click="handleCopy">
        <div>
          <!-- <IconCopyOne /> برای کپی کلیک کنید -->

        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer"> <el-button @click="handleClose">بستن</el-button> <el-button type="primary"
          @click="handleClose"> باشه </el-button> </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { debounce } from 'lodash-es'
import { copyText } from '@/utils/clipboard'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['close'])
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})
const dialogVisible = ref(false)

const handleClose = debounce(function() {
  dialogVisible.value = false
  emits('close')
}, 250)

const handleCopy = debounce(async function() {
  const result = await copyText('15972699417')
  result && ElMessage.success('Copy Success')
}, 250)

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

</script>