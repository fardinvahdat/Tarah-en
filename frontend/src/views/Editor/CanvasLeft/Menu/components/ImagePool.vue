<template>
  <div class="layout-pool">
    
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { getImageDataURL } from "@/utils/image";

import useHandleCreate from "@/hooks/useHandleCreate";
import ImageCategory from "./ImageComponents/ImageCategory.vue";
import IllustrationCategory from "./ImageComponents/IllustrationCategory.vue";

const { createImageElement } = useHandleCreate();

const activeImage = ref("data");
const drawImage = (files: FileList) => {
  const imageFile = files[0];
  if (!imageFile) return;
  getImageDataURL(imageFile).then((dataURL) => createImageElement(dataURL));
};
</script>

<style lang="scss" scoped>
:deep(.el-tabs__item) {
  padding: 0;
}
.layout-search {
  margin: 0 auto;
  width: 80%;
  padding: 20px 10px 10px;
}
.layout-upload {
  justify-content: center;
}
.layout-tabs {
  width: 90%;
  margin: 0 auto;
}
.layout-templates {
  display: flex;
  flex-wrap: wrap;
  padding: 2px;
  .thumbnail {
    display: flex;
    width: 124px;
    margin: 2px;
  }
  .thumbnail img {
    outline: 1px solid $borderColor;
    margin: 0 5px;
    cursor: pointer;
    &:hover {
      outline-color: $themeColor;
    }
  }
}
.col-img {
  height: 100px;
  img {
    max-height: 100%;
  }
}
</style>
<style>
.el-tabs .el-tabs__nav {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-around;
  width: 100%;
}
</style>