<template>
  <div class="layout-pool">
    <div>
      <PathPool @select="(path) => drawPath(path)" />
      <LinePool @select="(line) => drawLine(line)" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { nanoid } from "nanoid";

import { PathPoolItem, LinePoolItem, ElementNames } from "@/types/elements";
import { Object as FabricObject, loadSVGFromString } from "fabric";
import { getImageDataURL, getImageText } from "@/utils/image";
import { useTemplatesStore } from "@/store";
import useCanvas from "@/views/Canvas/useCanvas";
import PathPool from "./MaterialComponents/PathPool.vue";
import LinePool from "./MaterialComponents/LinePool.vue";
import useHandleCreate from "@/hooks/useHandleCreate";
import Icon from '@/components/Icon.vue'

const { createLineElement, createPathElement } = useHandleCreate();
const activeMaterial = ref("data");

const drawLine = (line: LinePoolItem) => {
  const strokeDashArray: [number, number] | undefined =
    line.style === "dashed" ? [6, 6] : undefined;
  createLineElement(line.data, line.points[0], line.points[1], strokeDashArray);
};

const drawPath = (shape: PathPoolItem) => {
  createPathElement(shape.path);
};

const svgCallback: any = (element: Element, fabricObject: FabricObject) => {
  const [canvas] = useCanvas();
  canvas.add(fabricObject);
};

const drawMaterial = async (files: File[]) => {
  const materialFile = files[0];
  const [canvas] = useCanvas();
  if (!materialFile) return;
  const dataText = await getImageText(materialFile);
  await loadSVGFromString(dataText, svgCallback);
  canvas.renderAll();
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
</style>
<style>
.el-tabs .el-tabs__nav {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-around;
  width: 100%;
}

.material-tab .el-tabs__content {
  height: 100vh;
  overflow-y: scroll;
}
</style>