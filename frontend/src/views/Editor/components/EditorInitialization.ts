import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElLoading } from "element-plus";
import {
  useMainStore,
  useSnapshotStore,
  useTemplatesStore,
  useAuthStore,
  useMenuStore,
  useFabricStore,
} from "@/store";
import { storeToRefs } from "pinia";
import { deleteDiscardedDB } from "@/utils/database";
import useCanvas from "@/views/Canvas/useCanvas";
import useCanvasScale from "@/hooks/useCanvasScale";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
import useHandleTemplate from "@/hooks/useHandleTemplate";
import { useWorkspaceStore, useTemplateStore, useStudioStore } from "@/store";
import { ElementNames } from "@/types/elements";
import { WorkSpaceDrawType } from "@/configs/canvas";
import { mm2px, px2mm } from "@/utils/image";

export function useEditorInitialization() {
  const route = useRoute();
  const isLoading = ref(true);
  const snapshotStore = useSnapshotStore();
  const { resetCanvas } = useCanvasScale();
  const { addTemplate } = useHandleTemplate();
  const { handleGetWorkspace } = useWorkspaceStore();
  const { handleGetTemplate } = useTemplateStore();
  const { initHistoryTracking, addHistorySnapshot } = useHistorySnapshot();
  const templatesStore = useTemplatesStore();
  const { templateId, currentTemplate } = storeToRefs(templatesStore);
  const studioStore = useStudioStore();
  const { isEditTextDialogVisible, stagedTextValue } = storeToRefs(studioStore);
  const mainStore = useMainStore();
  const { sizeMode, unitMode } = storeToRefs(mainStore);
  const fabricStore = useFabricStore();
  const { clip, safe, zoom, opacity } = storeToRefs(fabricStore);

  const templateWidth = computed(() => {
    // const [ canvas ] = useCanvas()
    // if (!canvas) return 0
    const workWidth = currentTemplate.value.width / currentTemplate.value.zoom;
    return unitMode.value === 0 ? px2mm(workWidth) : workWidth;
  });

  const templateHeight = computed(() => {
    // const [ canvas ] = useCanvas()
    // if (!canvas) return 0
    const workHeight =
      currentTemplate.value.height / currentTemplate.value.zoom;
    return unitMode.value === 0 ? px2mm(workHeight) : workHeight;
  });

  const canvasWidth = ref<number>(templateWidth.value);
  const canvasHeight = ref<number>(templateHeight.value);
  const isFixed = ref(false);

  const initializeEditor = async () => {
    const store = useMenuStore();
    store.updateMenu(true);

    const loading = ElLoading.service({
      lock: true,
      text: "Wait ...",
      background: "rgba(0, 0, 0, 0.7)",
    });
    canvasWidth.value = +route.query.width;
    canvasHeight.value = +route.query.height;
    await resetCanvas();
    await deleteDiscardedDB();

    try {
      if (route.query.workspaceID) {
        const response = await handleGetWorkspace(+route.query.workspaceID);
        await addTemplate(JSON.parse(response.json_dict));
        await resetCanvas();
        setupTextBoxEvents();
        loading.close();
        await deleteDiscardedDB();
        await snapshotStore.initSnapshotDatabase();
        initHistoryTracking(templateId.value);
      } else if (route.query.templateID) {
        const response = await handleGetTemplate(+route.query.templateID);
        await addTemplate(JSON.parse(response.json_dict));
        await resetCanvas();
        setupTextBoxEvents();
        loading.close();
        await deleteDiscardedDB();
        await snapshotStore.initSnapshotDatabase();
        initHistoryTracking(templateId.value);
      } else {
        await new Promise<void>(async (resolve) => {
          try {
            setTimeout(async () => {
              await changeTemplateWidth();
              await changeTemplateHeight();
              await resetCanvas();
              loading.close();
              await deleteDiscardedDB();
              await snapshotStore.initSnapshotDatabase();
              initHistoryTracking(templateId.value);
              resolve(); // ✅ Resolves the outer Promise
            }, 1000);
          } catch (error) {}
        });
      }
    } catch (error) {
      console.error("Editor initialization failed:", error);
      loading.close();
    }
  };

  const setupTextBoxEvents = () => {
    const [canvas] = useCanvas();
    const objects = canvas.getObjects();
    objects
      .filter(
        (obj) =>
          obj.name == ElementNames.TEXTBOX ||
          obj.name == ElementNames.ARCTEXT ||
          obj.name == ElementNames.VERTICALTEXT
      )
      .map((textBox) => {
        textBox.on("editing:entered", function () {
          isEditTextDialogVisible.value = true;
          // stagedTextValue.value = handleElement.value.text
        });
      });
  };

  // Modify canvas width
  const changeTemplateWidth = async () => {
    await new Promise<void>((resolve) => {
      const [canvas] = useCanvas();
      const workSpaceDraw = canvas
        .getObjects()
        .filter((item) => item.id === WorkSpaceDrawType)[0];
      if (!workSpaceDraw) return;
      const ratio = currentTemplate.value.height / currentTemplate.value.width;
      let { width, height } = getCanvasSize();
      height = isFixed.value ? width * ratio : height;
      workSpaceDraw.set({
        width: width / zoom.value,
        height: height / zoom.value,
      });
      templatesStore.setSize(width, height, zoom.value);
      sizeMode.value = 2;
      canvas.renderAll();
      // resetCanvas()
      addHistorySnapshot();
      resolve();
    });
  };

  // Modify the canvas height
  const changeTemplateHeight = async () => {
    await new Promise<void>((resolve) => {
      const [canvas] = useCanvas();
      const workSpaceDraw = canvas
        .getObjects()
        .filter((item) => item.id === WorkSpaceDrawType)[0];
      if (!workSpaceDraw) return;
      const ratio = currentTemplate.value.height / currentTemplate.value.width;
      let { width, height } = getCanvasSize();
      width = isFixed.value ? height / ratio : width;
      workSpaceDraw.set({
        width: width / zoom.value,
        height: height / zoom.value,
      });
      templatesStore.setSize(width, height, zoom.value);
      sizeMode.value = 2;
      canvas.renderAll();
      // resetCanvas()
      addHistorySnapshot();
      resolve();
    });
  };

  const getCanvasSize = () => {
    let width =
      unitMode.value === 0 ? mm2px(canvasWidth.value) : canvasWidth.value;
    let height =
      unitMode.value === 0 ? mm2px(canvasHeight.value) : canvasHeight.value;
    width = width * zoom.value;
    height = height * zoom.value;
    return { width, height };
  };

  return {
    isLoading,
    initializeEditor,
  };
}
