import { storeToRefs } from "pinia";
import { unref } from "vue";
import { useFabricStore, useTemplatesStore, useStudioStore } from "@/store";
import { useMainStore } from "@/store/modules/main";
import { RightStates, ElementNames } from "@/types/elements";
import { nanoid } from "nanoid";
import { QRCodeElement, QRCodeOption } from "@/types/canvas";
import { getImageSize } from "@/utils/image";
import {
  Object as FabricObject,
  Path,
  classRegistry,
  XY,
  util,
  Image as FabricImage,
  Group,
  ActiveSelection,
} from "fabric";
import * as fabric from "fabric";
import { Textbox } from "@/extension/object/Textbox";
import { LinePoint } from "@/types/elements";
import { Image } from "@/extension/object/Image";
import { QRCode } from "@/extension/object/QRCode";
import { BarCode } from "@/extension/object/BarCode";
import { ArcText } from "@/extension/object/ArcText";
import { Polyline } from "@/extension/object/Polyline";
import {
  Circle,
  makeCurveCircle,
  makeCurvePoint,
} from "@/extension/object/Circle";
import { VerticalText } from "@/extension/object/VerticalText";
import JsBarcode from "jsbarcode";
import { i18nObj } from "@/plugins/i18n/index";
import useCenter from "@/views/Canvas/useCenter";
import useCanvas from "@/views/Canvas/useCanvas";
import useCanvasZindex from "./useCanvasZindex";
import useHandleElement from "@/hooks/useHandleElement";
import { useRoute } from "vue-router";

export default () => {
  const mainStore = useMainStore();
  const templatesStore = useTemplatesStore();
  const studioStore = useStudioStore();
  const { setZindex } = useCanvasZindex();
  const { t } = i18nObj().global;
  const { rightState, systemFonts, canvasObject } = storeToRefs(mainStore);
  const { isEditTextDialogVisible, stagedTextValue } = storeToRefs(studioStore);
  const [canvas] = useCanvas();
  const handleElement = computed(() => canvasObject.value);

  const renderCanvas = (element: FabricObject, isCenter: boolean) => {
    const [canvas] = useCanvas();
    !isCenter && canvas.viewportCenterObject(element);
    canvas.add(element);
    canvas.setActiveObject(element);
    rightState.value = RightStates.ELEMENT_STYLE;
    setZindex(canvas);
    canvas.renderAll();
    templatesStore.addElement(element);
  };

  const createTextElement = async (
    fontSize: number,
    textStyle = "transverse",
    textHollow = false,
    textValue = "Double click to change the text.",
    effects: any
  ) => {
    const { centerPoint } = useCenter();
    const textBoxElement = new Textbox(textValue, {
      id: nanoid(10),
      left: centerPoint.x,
      top: centerPoint.y,
      fontSize,
      fontFamily: "IRANSans",
      fillType: 0,
      hasControls: true,
      hasBorders: true,
      fontWeight: "normal",
      charSpacing: 0,
      opacity: 1,
      originX: "left",
      originY: "top",
      textAlign: "left",
      name: ElementNames.TEXTBOX,
      splitByGrapheme: false,
      width: 10 * textValue.length + 50,
      padding: 15,
      effects,
      fill: (effects?.length && effects[0]?.color) || "#000",
      cornerStyle: "circle",
      noScaleCache: true, // Better quality when scaled
      statefullCache: false, // Prevent auto-cache updates
      dirty: true, // Force initial cache,
    });

    textBoxElement.set({
      left: textBoxElement.left - textBoxElement.width / 2,
      top: textBoxElement.top - textBoxElement.height / 2,
      height: 200,
    });
    if (textHollow) {
      textBoxElement.fill = "";
      textBoxElement.stroke = "black";
      textBoxElement.strokeWidth = 1;
    }

    textBoxElement.on("editing:entered", function () {
      isEditTextDialogVisible.value = true;
      stagedTextValue.value = handleElement.value.text;
    });

    renderCanvas(textBoxElement);
  };

  const createArcTextElement = (
    fontSize: number,
    textStyle = "transverse",
    textHollow = false,
    textValue = "Double Click For Editing..."
  ) => {
    const { centerPoint } = useCenter();

    const textBoxElement = new ArcText(textValue, {
      id: nanoid(10),
      left: centerPoint.x,
      top: centerPoint.y,
      fontSize,
      fontFamily: systemFonts.value[0].value,
      fillType: 0,
      hasControls: true,
      hasBorders: true,
      fontWeight: "normal",
      charSpacing: 0,
      opacity: 1,
      lineHeight: 1.3,
      originX: "left",
      originY: "top",
      textAlign: "justify-center",
      name: ElementNames.ARCTEXT,
      padding: 5,
      splitByGrapheme: textStyle === "direction" ? true : false,
      noScaleCache: true, // Better quality when scaled
      statefullCache: false, // Prevent auto-cache updates
      dirty: true, // Force initial cache,
    });
    textBoxElement.set({
      left: textBoxElement.left - textBoxElement.width / 2,
      top: textBoxElement.top - textBoxElement.height / 2,
    });
    if (textHollow) {
      textBoxElement.fill = "";
      textBoxElement.stroke = "black";
      textBoxElement.strokeWidth = 1;
    }
    renderCanvas(textBoxElement);

    textBoxElement.on("editing:entered", function () {
      isEditTextDialogVisible.value = true;
      stagedTextValue.value = handleElement.value.text;
    });
  };

  const createVerticalTextElement = (
    fontSize: number,
    textHollow = false,
    textValue = "Double Click For Editing..."
  ) => {
    const { centerPoint } = useCenter();

    const textBoxElement = new VerticalText(textValue, {
      id: nanoid(10),
      left: centerPoint.x,
      top: centerPoint.y,
      fontSize,
      fontFamily: systemFonts.value[0].value,
      fillType: 0,
      hasControls: true,
      hasBorders: true,
      fontWeight: "normal",
      charSpacing: 0,
      opacity: 1,
      lineHeight: 1.3,
      originX: "left",
      originY: "top",
      name: ElementNames.VERTICALTEXT,
      noScaleCache: true, // Better quality when scaled
      statefullCache: false, // Prevent auto-cache updates
      dirty: true, // Force initial cache,
    });
    textBoxElement.set({
      left: textBoxElement.left - textBoxElement.width / 2,
      top: textBoxElement.top - textBoxElement.height / 2,
    });
    if (textHollow) {
      textBoxElement.fill = "";
      textBoxElement.stroke = "black";
      textBoxElement.strokeWidth = 1;
    }
    renderCanvas(textBoxElement);

    textBoxElement.on("editing:entered", function () {
      isEditTextDialogVisible.value = true;
      stagedTextValue.value = handleElement.value.text;
    });
  };

  const createPathElement = (path: string, left?: number, top?: number) => {
    const { centerPoint } = useCenter();
    const pathElement = new Path(path, {
      id: nanoid(10),
      left: left ? left : centerPoint.x,
      top: top ? top : centerPoint.y,
      hasControls: true,
      hasBorders: true,
      opacity: 1,
      originX: "left",
      originY: "top",
      fill: "#22319e",
      name: ElementNames.PATH,
      noScaleCache: true, // Better quality when scaled
      statefullCache: false, // Prevent auto-cache updates
      dirty: true, // Force initial cache,
    });
    pathElement.left -= pathElement.width / 2;
    pathElement.top -= pathElement.height / 2;

    const { currentTemplateWidth, currentTemplateHeight } = storeToRefs(
      useTemplatesStore()
    );
    const { zoom } = storeToRefs(useFabricStore());
    const maxWidth = (currentTemplateWidth.value * zoom.value) / 2;
    const maxHeight = (currentTemplateHeight.value * zoom.value) / 2;

    pathElement.scaleX = maxWidth / pathElement.width;
    pathElement.scaleY = maxHeight / pathElement.height;

    renderCanvas(pathElement);
  };

  const createLineElement = (
    path: XY[],
    startStyle: LinePoint,
    endStyle: LinePoint,
    strokeDashArray?: [number, number]
  ) => {
    // const { centerPoint } = useCenter()
    // const lineElement = new Line([0, 0, 300, 0], {
    //   id: nanoid(10),
    //   left: centerPoint.x,
    //   top: centerPoint.y,
    //   strokeWidth: 4,
    //   stroke: 'green',
    //   scaleX: 1,
    //   scaleY: 1,
    //   originX: 'left',
    //   originY: 'top',
    //   transparentCorners: false,
    // })
    // renderCanvas(lineElement)
    // canvas.add(lineElement)
    // canvas.setActiveObject(lineElement)
    // rightState.value = RightStates.ELEMENT_STYLE
    // setZindex(canvas)
    createPolylineElement(path, startStyle, endStyle, strokeDashArray);
    // createArrowElement(path)
    // createCurverElement()
  };

  const createCurverElement = () => {
    const [canvas] = useCanvas();
    var line = new Path("M 65 0 Q 100, 100, 200, 0", {
      fill: "",
      stroke: "black",
      objectCaching: false,
    });

    line.path[0][1] = 100;
    line.path[0][2] = 100;

    line.path[1][1] = 200;
    line.path[1][2] = 200;

    line.path[1][3] = 300;
    line.path[1][4] = 100;
    console.log("path:", line.path);
    line.selectable = false;
    canvas.add(line);

    var p1 = makeCurvePoint(200, 200, null, line, null);
    p1.name = "p1";
    canvas.add(p1);

    var p0 = makeCurveCircle(100, 100, line, p1, null);
    p0.name = "p0";
    canvas.add(p0);

    var p2 = makeCurveCircle(300, 100, null, p1, line);
    p2.name = "p2";
    canvas.add(p2);
  };

  const createPolylineElement = (
    path: XY[],
    startStyle: LinePoint,
    endStyle: LinePoint,
    strokeDashArray?: [number, number]
  ) => {
    const { centerPoint } = useCenter();
    // const points = [ { x: 0, y: 0 }, { x: 200, y: 0 } ]

    const element = new Polyline(path, {
      id: nanoid(10),
      left: centerPoint.x,
      top: centerPoint.y,
      strokeWidth: 4,
      stroke: "#22319e",
      fill: "",
      scaleX: 1,
      scaleY: 1,
      originX: "left",
      originY: "top",
      startStyle,
      endStyle,
      hasBorders: false,
      objectCaching: false,
      transparentCorners: false,
      strokeDashArray,
      name: ElementNames.LINE,
      noScaleCache: true, // Better quality when scaled
      statefullCache: false, // Prevent auto-cache updates
      dirty: true, // Force initial cache,
    });
    renderCanvas(element);
  };

  const createImageElement = (url: string) => {
    const { zoom } = storeToRefs(useFabricStore());
    const { currentTemplateWidth, currentTemplateHeight } = storeToRefs(
      useTemplatesStore()
    );
    const { centerPoint } = useCenter();
    const route = useRoute();
    getImageSize(url).then(async ({ width, height }) => {
      const maxWidth = (currentTemplateWidth.value * zoom.value) / 2;
      const maxHeight = (currentTemplateHeight.value * zoom.value) / 2;

      const scaleX = maxWidth / width;
      const scaleY = maxHeight / height;

      const imageElement = await Image.fromURL(
        url,
        {},
        {
          id: nanoid(10),
          angle: 0,
          left: centerPoint.x - (width * scaleX) / 2,
          top: centerPoint.y - (height * scaleY) / 2,
          scaleX: scaleX,
          scaleY: scaleY,
          hasControls: true,
          hasBorders: true,
          opacity: 1,
          originX: "left",
          originY: "top",
          name: ElementNames.IMAGE,
          crossOrigin: "anonymous",
          noScaleCache: true, // Better quality when scaled
          statefullCache: false, // Prevent auto-cache updates
          dirty: true, // Force initial cache,
        }
      );
      renderCanvas(imageElement);
    });
  };
  const createImageElementForReplace = async (
    url: string,
    left: number,
    top: number,
    opacity: number,
    angle: number,
    effects: any,
    clipPath: any,
    id: any
  ) => {
    try {
      const { width, height } = await getImageSize(url);
      console.log(width, height);
      const imageElement = await Image.fromURL(
        url,
        {},
        {
          id,
          angle,
          left,
          top,
          scaleX: 1,
          scaleY: 1,
          hasControls: true,
          hasBorders: true,
          opacity,
          originX: "left",
          originY: "top",
          name: ElementNames.IMAGE,
          crossOrigin: "anonymous",
          effects,
          clipPath,
          noScaleCache: true, // Better quality when scaled
          statefullCache: false, // Prevent auto-cache updates
          dirty: true, // Force initial cache,
        }
      );
      renderCanvas(imageElement, true);
    } catch (error) {}
  };

  const createMaskElement = (url: string, original_image: any) => {
    const { zoom } = storeToRefs(useFabricStore());
    const [canvas] = useCanvas();
    const originalImageWidth = original_image.width * original_image.scaleX;
    const originalImageHeight = original_image.height * original_image.scaleY;
    getImageSize(url).then(async ({ width, height }) => {
      const widthPercent = width / originalImageWidth;
      const heightPercent = height / originalImageHeight;
      const scale = (height / width) * zoom.value;
      const id = nanoid(10);
      const original_id = `original_${id}`;
      const masked_id = `masked_${id}`;
      original_image.set("absolutePositioned", true);
      const masked_image = await Image.fromURL(
        url,
        {},
        {
          id: masked_id,
          angle: 0,
          left: original_image.left,
          top: original_image.top,
          scaleX: scale / widthPercent,
          scaleY: scale / heightPercent,
          hasControls: true,
          hasBorders: true,
          opacity: 1,
          originX: "left",
          originY: "top",
          name: ElementNames.IMAGE,
          crossOrigin: "anonymous",
          clipPath: original_image,
          noScaleCache: true, // Better quality when scaled
          statefullCache: false, // Prevent auto-cache updates
          dirty: true, // Force initial cache,
          objectCaching: true,
        }
      );
      original_image.set("id", original_id);

      canvas.on("mouse:down:before", (e: any) => {
        const activeObject = canvas.getActiveObject();
        if (
          e.target?.id?.includes("original_") ||
          e.target?.id?.includes("masked_")
        ) {
          const id = e.target.id
            .replace("original_", "")
            .replace("masked_", "");
          const activeObjectId = activeObject?.id
            .replace("original_", "")
            .replace("masked_", "");
          if (id == activeObjectId) return;
          const masked = canvas
            .getObjects()
            .filter((item) => item.id == `masked_${id}`)[0];
          const original = canvas
            .getObjects()
            .filter((item) => item.id == `original_${id}`)[0];

          makeSelection(original, masked);
        }
      });
      renderCanvas(masked_image, true);
    });
  };
  async function makeSelection(original_image: any, masked_image: any) {
    const { deleteElement } = useHandleElement();
    await canvas.discardActiveObject();

    const selection = new ActiveSelection([original_image, masked_image], {
      canvas: canvas,
      id: "mask",
    });
    selection._objects[1].clipPath = original_image;
    canvas.setActiveObject(selection);
    canvas.requestRenderAll();
  }
  const createQRCodeElement = async (
    url: string,
    codeOption: QRCodeOption,
    codeContent?: string
  ) => {
    const { centerPoint } = useCenter();
    // const QRCode = classRegistry.getClass('QRCode')
    const codeObject = (await QRCode.fromURL(
      url,
      {},
      {
        id: nanoid(10),
        name: ElementNames.QRCODE,
        angle: 0,
        left: centerPoint.x,
        top: centerPoint.y,
        hasControls: true,
        hasBorders: true,
        opacity: 1,
        originX: "left",
        originY: "top",
        codeContent,
        codeOption,
        crossOrigin: "anonymous",
        noScaleCache: true, // Better quality when scaled
        statefullCache: false, // Prevent auto-cache updates
        dirty: true, // Force initial cache,
      }
    )) as QRCodeElement;
    console.log("codeObject", codeObject);
    codeObject.left -= codeObject.width / 2;
    codeObject.top -= codeObject.height / 2;

    const { currentTemplateWidth, currentTemplateHeight } = storeToRefs(
      useTemplatesStore()
    );
    const { zoom } = storeToRefs(useFabricStore());
    const maxWidth = (currentTemplateWidth.value * zoom.value) / 2;
    const maxHeight = (currentTemplateHeight.value * zoom.value) / 2;

    codeObject.scaleX = maxWidth / codeObject.width;
    codeObject.scaleY = maxHeight / codeObject.height;
    renderCanvas(codeObject);
  };

  const createBarCodeElement = async (
    url: string,
    codeContent: string,
    codeOption: JsBarcode.BaseOptions
  ) => {
    const { centerPoint } = useCenter();
    // const Barcode = classRegistry.getClass('BarCode')
    const barcodeObject = await BarCode.fromURL(
      url,
      {},
      {
        id: nanoid(10),
        name: ElementNames.BARCODE,
        angle: 0,
        left: centerPoint.x,
        top: centerPoint.y,
        hasControls: true,
        hasBorders: true,
        opacity: 1,
        originX: "left",
        originY: "top",
        codeContent,
        codeOption,
        crossOrigin: "anonymous",
        noScaleCache: true, // Better quality when scaled
        statefullCache: false, // Prevent auto-cache updates
        dirty: true, // Force initial cache,
      }
    );
    barcodeObject.left -= barcodeObject.width / 2;
    barcodeObject.top -= barcodeObject.height / 2;

    const { currentTemplateWidth, currentTemplateHeight } = storeToRefs(
      useTemplatesStore()
    );
    const { zoom } = storeToRefs(useFabricStore());
    const maxWidth = (currentTemplateWidth.value * zoom.value) / 2;
    const maxHeight = (currentTemplateHeight.value * zoom.value) / 2;

    barcodeObject.scaleX = maxWidth / barcodeObject.width;
    barcodeObject.scaleY = maxHeight / barcodeObject.height;

    renderCanvas(barcodeObject);
  };

  const createVideoElement = (url: string) => {
    const { centerPoint } = useCenter();
    const [canvas] = useCanvas();
    const videoEl = document.createElement("video");
    videoEl.loop = true;
    videoEl.crossOrigin = "anonymous";
    videoEl.controls = true;
    videoEl.style.display = "none";

    const sourceEl = document.createElement("source");
    sourceEl.src = url;
    videoEl.appendChild(sourceEl);

    videoEl.addEventListener("loadeddata", function () {
      videoEl.width = videoEl.videoWidth;
      videoEl.height = videoEl.videoHeight;
      const videoElement = new FabricImage(videoEl, {
        left: centerPoint.x,
        top: centerPoint.y,
        originX: "center",
        originY: "center",
        objectCaching: false,
        globalCompositeOperation: "source-atop",
      });
      canvas.add(videoElement);
      const viedoSource = videoElement.getElement() as any;
      viedoSource.play();
      util.requestAnimFrame(function render() {
        canvas.renderAll();
        util.requestAnimFrame(render);
      });
    });
  };

  return {
    createTextElement,
    createPathElement,
    createLineElement,
    createImageElement,
    createMaskElement,
    createQRCodeElement,
    createBarCodeElement,
    createVideoElement,
    createArcTextElement,
    createVerticalTextElement,
    createImageElementForReplace,
  };
};
