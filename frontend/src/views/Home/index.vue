<template>
  <div class="flex gap-2 md:flex-row flex-col-reverse relative">
    <!-- <SideBar class="md:w-[400px] w-full md:!relative !fixed bottom-0 left-0 z-10" /> -->
    <section class="h-screen p-2 w-full">
      <Wrapper />
    </section>
  </div>
</template>

<script lang="ts" setup>
import SideBar from '@/components/Base/SideBar.vue'
import Wrapper from './components/Wrapper.vue'
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
if (route.name == 'Root') {
  router.push('/home')
}
</script>