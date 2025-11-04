<template>
  <div>
    <!-- Login Dialog/Drawer -->
    <el-dialog v-if="windowWidth > 768" v-model="loginVisible" center @close="loginVisible = false"
      class="max-w-[480px] w-full">
      <OTP class="w-full rounded-md border-gray-border py-12 px-8 flex flex-col gap-12 items-center bg-white"
        v-if="loginStep == 1" />
      <Login v-else />
    </el-dialog>

    <el-drawer v-else v-model="loginVisible" direction="btt" size="90%" @close="loginVisible = false">
      <OTP v-if="loginStep == 1" />
      <Login v-else />
    </el-drawer>

    <!-- Export Dialog/Drawer -->
    <el-dialog v-if="windowWidth > 768" v-model="exportDialogVisible" title="Download" 
      class="md:max-w-[480px] max-w-[350px] upload-dialog w-full" @close="exportDialogVisible = false">
      <FileExport @close="exportDialogVisible = false" />
    </el-dialog>

    <el-drawer v-else v-model="exportDialogVisible" direction="btt" class="" size="50%"
      @close="exportDialogVisible = false">
      <FileExport @close="exportDialogVisible = false" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore, useStudioStore } from '@/store'
import Login from '@/components/Base/Login.vue'
import OTP from '@/components/Base/OTP.vue'
import FileExport from '@/components/FileExport/index.vue'


const studioStore = useStudioStore()
const authStore = useAuthStore()

const { isExportDialogVisible: exportDialogVisible } = storeToRefs(studioStore)
const { isLoginDialogVisible: loginVisible, currentLoginStep: loginStep } = storeToRefs(authStore)


const windowWidth = ref(window.innerWidth)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})
</script>
