<template>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
const fontColor = ref('#000')
const handlePathText = ref(true)

</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.switch-wrapper {
  text-align: right;
}
.slider {
  flex: 3;
}
</style>