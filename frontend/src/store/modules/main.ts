import { Object as FabricObject } from "fabric";
import { customAlphabet } from "nanoid";
import { defineStore } from "pinia";
import { WEB_FONTS } from "@/configs/fonts";
import { ImageCategoryInfo } from "@/configs/images";
import { getSupportFonts } from "@/utils/fonts";
import { CanvasElement } from "@/types/canvas";
import { RightStates, PointElement, ImageCategoryData } from "@/types/elements";
import { ExportTypes, PoolType, SystemFont } from "@/types/common";
import useCanvas from "@/views/Canvas/useCanvas";

export interface MainState {
  canvasObject: FabricObject | undefined;
  hoveredObject: FabricObject | undefined;
  leavedObject: FabricObject | undefined;
  clonedObject: FabricObject | undefined;
  currentPoint: PointElement | null;
  rightState: RightStates;
  imageCategoryType: string[];
  imageCategoryData: ImageCategoryData[];
  illustrationCategoryType: string[];
  illustrationCategoryData: ImageCategoryData[];
  handleElementId: string;
  sizeMode: number;
  unitMode: number;
  gridColorSelf: [string[]];
  databaseId: string;
  selectedTemplatesIndex: number[];
  thumbnailsFocus: boolean;
  drawAreaFocus: boolean;
  systemFonts: SystemFont[];
  onlineFonts: SystemFont[];
  disableHotkeys: boolean;
  exportType: ExportTypes;
  lastHelp: PoolType;
  lastEdit: PoolType;
  poolType: PoolType;
  poolShow: boolean;
}

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
);
export const databaseId = nanoid(10);

export const useMainStore = defineStore("main", {
  state: (): MainState => ({
    canvasObject: undefined,
    clonedObject: undefined,
    hoveredObject: undefined,
    leavedObject: undefined,
    currentPoint: null,
    rightState: RightStates.ELEMENT_CANVAS,
    imageCategoryType: [],
    imageCategoryData: ImageCategoryInfo,
    illustrationCategoryType: [],
    illustrationCategoryData: ImageCategoryInfo,
    handleElementId: "", // The ID of the element being operated on
    sizeMode: 0, // Template Style
    unitMode: 1, // unit
    gridColorSelf: [[]], // Custom Colors
    databaseId, // Identifies the indexedDB database ID of the current application
    selectedTemplatesIndex: [],
    thumbnailsFocus: false, // Left navigation thumbnail area focus
    drawAreaFocus: false, // Editorial Area Focus
    systemFonts: WEB_FONTS, // System fonts
    onlineFonts: [], // Online Fonts
    disableHotkeys: false, // Disable shortcut keys
    exportType: "image", // Export Panel
    lastEdit: "editor", // Left column
    lastHelp: "editor", // Left column
    poolType: "editor", // Left column
    poolShow: false, // Show left column
  }),

  getters: {
    activeElementList() {
      //   const slidesStore = useSlidesStore()
      //   const currentSlide = slidesStore.currentSlide
      //   if (!currentSlide || !currentSlide.elements) return []
    },

    handleElement() {
      //   const slidesStore = useSlidesStore()
      //   const currentSlide = slidesStore.currentSlide
      //   if (!currentSlide || !currentSlide.elements) return null
      //   return currentSlide.elements.find(element => state.handleElementId === element.id) || null
    },
  },

  actions: {
    setCanvasObject(canvasObject: FabricObject | undefined) {
      this.canvasObject = canvasObject;
      // this.getFonts()
    },

    setHoveredObject(hoveredObject: FabricObject | undefined) {
      this.hoveredObject = hoveredObject;
    },

    setLeaveddObject(leavedObject: FabricObject | undefined) {
      this.leavedObject = leavedObject;
    },

    setActiveObject() {
      const [canvas] = useCanvas();
      if (!canvas) return;
      const activeObject = canvas._activeObject as CanvasElement | null;
    },
    // setHandleElementId(handleElementId: string) {
    //   this.handleElementId = handleElementId
    // },

    // setActiveGroupElementId(activeGroupElementId: string) {
    //   this.activeGroupElementId = activeGroupElementId
    // },

    // setHiddenElementIdList(hiddenElementIdList: string[]) {
    //   this.hiddenElementIdList = hiddenElementIdList
    // },

    // setCanvasDragged(isDragged: boolean) {
    //   this.canvasDragged = isDragged
    // },
    setPoolType(poolType: PoolType) {
      if (poolType === "help") this.lastHelp = this.poolType;
      // if (poolType === 'editor') this.lastEdit = this.poolType
      this.poolType = poolType;
    },

    setRightState(rightState: RightStates) {
      this.rightState = rightState;
    },

    setThumbnailsFocus(isFocus: boolean) {
      this.thumbnailsFocus = isFocus;
    },

    getFonts() {
      this.getSystemFonts();
      this.getOnlineFonts();
    },

    getSystemFonts() {
      this.systemFonts = getSupportFonts(WEB_FONTS);
    },

    async getOnlineFonts() {},

    setExportType(type: ExportTypes) {
      this.exportType = type;
    },

    setDrawAreaFocus(status: boolean) {
      this.drawAreaFocus = status;
    },

    // setDisableHotkeysState(disable: boolean) {
    //   this.disableHotkeys = disable
    // },

    // setGridLineSize(size: number) {
    //   this.gridLineSize = size
    // },

    // setRulerState(show: boolean) {
    //   this.showRuler = show
    // },

    // setClipingImageElementId(elId: string) {
    //   this.clipingImageElementId = elId
    // },

    // setSelectedTableCells(cells: string[]) {
    //   this.selectedTableCells = cells
    // },

    // setScalingState(isScaling: boolean) {
    //   this.isScaling = isScaling
    // },

    updateSelectedTemplatesIndex(selectedTemplatesIndex: number[]) {
      this.selectedTemplatesIndex = selectedTemplatesIndex;
    },

    // setDialogForColor(show: boolean) {
    //   this.dialogForColor = show
    // },

    // saveDialogForColor(colors: string[]) {
    //   this.dialogForColor = false
    //   this.colorSelfStore.push(colors)
    // },

    // setDialogForTemplate(show: boolean) {
    //   this.dialogForTemplate = show
    // },

    // setSelectPanelState(show: boolean) {
    //   this.showSelectPanel = show
    // },
  },
});
