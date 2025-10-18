<template>
  <div
    class="sticky -top-2 h-18 p-2 flex items-center justify-between flex-row md:bg-primary-b1 md:gap-0 gap-2 z-20"
  >
    <div class="md:pr-2 pr-1 flex items-center md:gap-4 gap-2">
      <Button
        class="bg-primary-b3 px-4 py-1 h-fit md:!text-sm !text-xs text-primary-default"
        @click="isExportDialogVisible = true"
        >Receive</Button
      >
      <div class="flex items-center flex-row-reverse md:gap-1">
        <el-tooltip placement="top" :hide-after="0">
          <template #content>Redo</template>
          <button
            @click="redo"
            :disabled="!canRedo"
            class="md:text-white text-black disabled:text-gray-400 w-9 h-9 hover:bg-white/40 rounded-md cursor-pointer"
          >
            <Icon name="redo" class="md:w-8 md:h-8 w-6 h-6" />
          </button>
        </el-tooltip>
        <el-tooltip placement="top" :hide-after="0">
          <template #content>Undo</template>
          <button
            @click="undo"
            :disabled="!canUndo"
            class="md:text-white text-black disabled:text-gray-400 w-9 h-9 hover:bg-white/40 rounded-md cursor-pointer"
          >
            <Icon name="undo" class="md:w-8 md:h-8 w-6 h-6" />
          </button>
        </el-tooltip>
        <el-tooltip placement="top" :hide-after="0">
          <template #content>Line</template>
          <button
            @click="changeRuler"
            class="md:text-white text-black w-9 h-9 hover:bg-white/40 rounded-md cursor-pointer flex items-center justify-center"
            :class="
              rulerEnabled
                ? 'ruler-enabled bg-white/40 md:text-white text-black'
                : 'md:text-white/60 text-black/60'
            "
          >
            <Icon name="ruler" class="md:w-6 md:h-6 w-6 h-6" />
          </button>
        </el-tooltip>
      </div>
      <div class="md:hidden flex items-center gap-1">
        <button
          @click="scaleCanvas('+')"
          class="handler-item md:px-2 text-black"
        >
          <Icon name="zoom-in" class="w-6 h-6" />
        </button>
        <el-popover
          placement="bottom"
          trigger="click"
          width="100"
          popper-class="viewport-size"
        >
          <template #reference>
            <span class="text text-black md:text-sm text-xs" ref="scaleRef">{{
              canvasZoom
            }}</span>
          </template>
          <div class="viewport-size-preset">
            <div
              class="preset-item py-2 text-left"
              v-for="item in canvasZoomPresets"
              :key="item"
              @click="applyCanvasPresetScale(item)"
            >
              {{ item }}%
            </div>
            <div class="preset-item text-right" @click="resetCanvas()">
              Full screen
            </div>
          </div>
        </el-popover>
        <button
          class="handler-item md:px-2 text-black"
          @click="scaleCanvas('-')"
        >
          <Icon name="zoom-out" class="w-6 h-6" />
        </button>
      </div>
    </div>
    <div class="items-center md:gap-4 flex">
      <el-tooltip class="box-item" effect="dark" content="Home" placement="top">
        <router-link
          to="/home"
          class="hover:bg-primary-b3 hover:bg-opacity-30 w-10 h-10 rounded-xl md:flex hidden items-center justify-center"
        >
          <Icon name="home" class="md:w-8 !w-5 md:h-8 !h-5" color="#fff" />
        </router-link>
      </el-tooltip>
      <button
        class="p-1 px-2 my-1 h-8 ml-2 bg-primary-b3 rounded-md w-fit md:hidden flex items-center justify-center text-white"
        @click="isMenuOpen = !isMenuOpen"
      >
        <icon name="toolbar-menu-justify" class="h-full" />
      </button>
      <button
        class="p-1 rounded-xl md:flex hidden items-center justify-center gap-2"
        v-if="user?.role"
      >
        <img
          :src="`/images/avatars/${user?.role}.png`"
          class="md:h-14 md:w-14 h-10 w-10 p-1"
          style="border-radius: 12px"
        />
        <div class="flex flex-col items-start">
          <p class="md:text-sm text-xs font-semibold text-gray-100">
            {{
              user?.role == "admin"
                ? "Manager"
                : user?.role == "designer"
                ? "Designer"
                : user?.role == "user"
                ? "Personal"
                : ""
            }}
          </p>
          <p class="md:text-sm text-[9px] font-normal text-gray-300">
            {{ user?.mobile.slice(-4) }}...{{ user?.mobile.slice(0, 3) }}
          </p>
        </div>
      </button>
    </div>
    <el-drawer
      v-model="isMenuOpen"
      direction="ltr"
      size="70%"
      @close="isMenuOpen = false"
      class="menu-drawer"
    >
      <div class="flex items-center justify-between px-3 mb-6">
        <button
          class="hover:bg-primary-b3 hover:bg-opacity-50 p-1 rounded-xl flex items-center justify-center gap-2"
        >
          <img
            :src="`/images/avatars/${user?.role || 'user'}.png`"
            class="h-14 w-14 p-1"
            style="border-radius: 12px"
          />
          <div class="flex flex-col items-start">
            <p class="text-sm font-semibold text-gray-500 mb-2">
              {{
                user?.role == "admin"
                  ? "Manager"
                  : user?.role == "designer"
                  ? "Designer"
                  : "Personal"
              }}
            </p>
            <p class="text-sm font-normal">{{ user?.mobile }}</p>
          </div>
        </button>
        <router-link
          to="/home"
          class="hover:bg-primary-b3 hover:bg-opacity-30 w-10 h-10 rounded-xl flex items-center justify-center"
        >
          <Icon name="home" class="md:w-8 !w-5 md:h-8 !h-5" color="#000" />
        </router-link>
      </div>
      <ul>
        <li
          v-for="(item, index) in menuOptions"
          :key="index"
          class="w-full h-fit px-3"
          :class="
            item.route == route.path
              ? 'md:border-t-0 border-t-2 border-primary-b1'
              : ''
          "
        >
          <button
            class="flex md:flex-col items-center gap-1 justify-start md:bg-primary-b3 hover:text-primary-b1 hover:bg-opacity-50 w-full h-[55px] cursor-pointer"
            :class="
              (item.name == poolType
                ? 'text-primary-b1 md:bg-opacity-50'
                : 'text-primary-b2 md:bg-opacity-15 bg-opacity-0',
              index !== 0 && 'border-t')
            "
            @click="setPoolType(item.name)"
          >
            <Icon :name="item.icon" class="w-6" />
            <p
              class="text-xs"
              :class="item.name == poolType ? 'font-bold' : 'font-medium'"
            >
              {{ item.title }}
            </p>
          </button>
        </li>
      </ul>
    </el-drawer>
  </div>
  <div class="md:hidden">
    <Menu />
    <CanvasRight
      :type="props.type"
      :visible="props.visible"
      class="layout-content-right md:w-[300px] w-full bg-[#fff] border-r-2 md:flex flex-col rounded-[15px] ml-2 shadow-lg p-2 absolute transition-all delay-800 md:max-h-full max-h-[200px] overflow-y-auto z-10 hidden"
      :class="
        !props.visible
          ? 'md:right-[-400px] md:bottom-0 md:top-0 bottom-[5000px]'
          : 'md:right-[0] md:bottom-0 md:top-0 top-[-200px] bottom-0'
      "
      @open="props.visible = true"
    />
    <div class="md:hidden">
      <el-drawer
        class="md:hidden"
        v-model="props.visible"
        @close="emits('update', false)"
        direction="btt"
        size="40%"
      >
        <CanvasRight :type="props.type" :visible="props.visible" />
      </el-drawer>
    </div>
  </div>
</template>

<script setup>
import Icon from "@/components/Icon.vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import {
  useAuthStore,
  useMenuStore,
  useSnapshotStore,
  useFabricStore,
  useStudioStore,
  useMainStore,
} from "@/store";
import Button from "@/components/Base/Button";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import useCanvasScale from "@/hooks/useCanvasScale";
import Menu from "@/views/Editor/CanvasLeft/Menu/index.vue";
import CanvasRight from "@/views/Editor/CanvasRight/index.vue";
import useCanvas from "@/views/Canvas/useCanvas";

const props = defineProps({
  visible: {
    default: false,
  },
  type: {
    default: "",
  },
});

const { user, isLoginDialogVisible } = storeToRefs(useAuthStore());
const { isExportDialogVisible } = storeToRefs(useStudioStore());
const store = useMenuStore();
const fabricStore = useFabricStore();
const { menuOptions } = storeToRefs(store);
const route = useRoute();
const router = useRouter();
const { canUndo, canRedo } = storeToRefs(useSnapshotStore());
const { redo, undo } = useHistorySnapshot();
const { zoom } = storeToRefs(fabricStore);
const canvasZoom = computed(() => Math.round(zoom.value * 100) + "%");
const canvasZoomPresets = [200, 150, 100, 80, 50];
const { setCanvasScalePercentage, scaleCanvas, resetCanvas } = useCanvasScale();
const windowWidth = ref(window.innerWidth);

// Ruler show hide
const changeRuler = () => {
  const [canvas] = useCanvas();
  if (!canvas.ruler) return;
  canvas.ruler.enabled = !canvas.ruler.enabled;
  rulerEnabled.value = canvas.ruler.enabled;
};

const applyCanvasPresetScale = (value) => {
  setCanvasScalePercentage(value);
};

const rulerEnabled = ref(true);

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

// Add event listener when the component is mounted
onMounted(async () => {
  window.addEventListener("resize", updateWindowWidth);
});

// Remove event listener when the component is unmounted
onUnmounted(() => {
  window.removeEventListener("resize", updateWindowWidth);
});

const emits = defineEmits(["update", "close"]);
const mainStore = useMainStore();
const { poolType, poolShow } = storeToRefs(mainStore);
const isMenuOpen = ref(false);

const setPoolType = (tab) => {
  if (poolShow.value && tab === poolType.value) {
    poolShow.value = false;
  } else {
    poolShow.value = tab !== "help" ? true : false;
  }
  mainStore.setPoolType(tab);
  emits("close");
  isMenuOpen.value = false;
};
const handleOpenMenu = () => {
  isMenuOpen.value = true;
};
</script>

<style>
.upload-dialog .el-dialog__header {
  text-align: left;
}

.upload-dialog .el-upload__tip {
  text-align: left;
}

.upload-dialog .el-upload-list__item-name {
  padding: 0;
}

.upload-dialog .el-upload-list__item-info {
  width: 100%;
  margin-left: 0;
}

.menu-drawer .el-drawer__body {
  padding: 0 !important;
}

.ruler-enabled .ruler-linethrough {
  display: none;
}
</style>
