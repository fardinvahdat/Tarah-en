import { ref } from "vue";
import { saveAs } from "file-saver";
import { storeToRefs } from "pinia";
import { useFabricStore, useTemplatesStore } from "@/store";
import {
  WorkSpaceThumbType,
  WorkSpaceClipType,
  WorkSpaceCommonType,
  WorkSpaceSafeType,
  propertiesToInclude,
} from "@/configs/canvas";
import { ImageFormat } from "fabric";
import { changeDpiDataUrl } from "changedpi";
import useCanvas from "@/views/Canvas/useCanvas";
import useCenter from "@/views/Canvas/useCenter";
import { ElementNames } from "@/types/elements";

export default () => {
  const Exporting = ref(false);
  const { showClip, showSafe } = storeToRefs(useFabricStore());
  const { currentTemplate } = storeToRefs(
    useTemplatesStore()
  );
  const exportImage = (
    format: ImageFormat,
    quality: number,
    dpi: number,
    ignoreClip = true
  ) => {
    Exporting.value = true;
    const [canvas] = useCanvas();
    const { left, top, width, height } = useCenter();
    const zoom = canvas.getZoom();
    const viewportTransform = canvas.viewportTransform;
    const activeObject = canvas.getActiveObject();
    let ignoreObjects = canvas
      ?.getObjects()
      .filter((obj) => WorkSpaceCommonType.includes(obj.id));
    if (format === "jpeg") {
      ignoreObjects = canvas
        ?.getObjects()
        .filter((obj) => WorkSpaceThumbType.includes(obj.id));
    }
    if (ignoreClip) {
      ignoreObjects.map((item) => item.set({ visible: false }));
      canvas.renderAll();
    }
    if (activeObject) canvas.discardActiveObject();
    canvas
      ?.getObjects()
      .filter(
        (item) =>
          item.type === ElementNames.REFERENCELINE && item.visible === true
      )
      .map((item) => item.set({ visible: false }));
    canvas.set({ background: "rgba(255,255,255,0)" });
    canvas.renderAll();
    let result = canvas.toDataURL({
      multiplier: 1 / zoom,
      // multiplier: 2,
      quality: quality,
      format: format,
      width: width * zoom,
      height: height * zoom,
      left: left * zoom + viewportTransform[4],
      top: top * zoom + viewportTransform[5],
    });
    result = changeDpiDataUrl(result, dpi);
    saveAs(result, `editor-${Date.now()}.${format}`);
    Exporting.value = false;
    ignoreObjects.map((item) => item.set({ visible: true }));
    canvas
      ?.getObjects()
      .filter((obj) => obj.id === WorkSpaceClipType)
      .map((item) => item.set({ visible: showClip.value }));
    canvas
      ?.getObjects()
      .filter((obj) => obj.id === WorkSpaceSafeType)
      .map((item) => item.set({ visible: showSafe.value }));
    if (activeObject) canvas.setActiveObject(activeObject);
    canvas
      ?.getObjects()
      .filter(
        (item) =>
          item.type === ElementNames.REFERENCELINE && item.visible === false
      )
      .map((item) => item.set({ visible: true }));
    canvas.renderAll();
  };

  const getSVGData = async () => {
    const [canvas] = useCanvas();
    const { left, top, width, height } = useCenter();
    
    canvas
      ?.getObjects()
      .filter(
        (item) =>
          item.type === ElementNames.REFERENCELINE && item.visible === true
      )
      .map((item) => item.set({ visible: false }));
    canvas.renderAll();
    
    // Enhanced SVG generation with font definitions
    const data = canvas.toSVG(
      {
        viewBox: {
          x: left,
          y: top,
          width: width,
          height: height,
        },
        width: width + "px",
        height: height + "px",
      },
      (element) => element
    );
    
    canvas
      ?.getObjects()
      .filter(
        (item) =>
          item.type === ElementNames.REFERENCELINE && item.visible === false
      )
      .map((item) => item.set({ visible: true }));
    canvas.renderAll();
    return data;
  };

  const getJSONData = () => {
    const [canvas] = useCanvas();
    const serializer = canvas.toObject(propertiesToInclude);
    serializer.workSpace = currentTemplate.value.workSpace;
    serializer.zoom = currentTemplate.value.zoom;
    serializer.width = currentTemplate.value.width;
    serializer.height = currentTemplate.value.height;
    // console.log(JSON.stringify(serializer));

    return serializer;
  };

  const exportSVG = async (options: any = {}, type: string = "download") => {
    const [canvas] = useCanvas();
    const ignoreObjects = canvas
      ?.getObjects()
      .filter((obj) => WorkSpaceThumbType.includes(obj.id));
    ignoreObjects.map((item) => item.set({ visible: false }));
    canvas.renderAll();
    const data = await getSVGData();
    return await downloadSVG(data, options, type);
  };

  async function downloadSVG(
    svgString: string,
    options: any = {},
    type: string = "download"
  ) {
    const { format, quality, dpi, width, height, filename } = options;

    // Create SVG blob
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create canvas for rasterization
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Wait for image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = svgUrl;
    });

    // Calculate dimensions with DPI scaling
    const scale = dpi / 96;
    const imgWidth = options.width || img.width * scale;
    const imgHeight = options.height || img.height * scale;

    // Set canvas dimensions
    canvas.width = imgWidth;
    canvas.height = imgHeight;

    // Draw image to canvas
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

    // Create download link based on format
    let downloadUrl;
    switch (format.toLowerCase()) {
      case "png":
        downloadUrl = canvas.toDataURL("image/png");
        break;
      case "jpeg":
      case "jpg":
        downloadUrl = canvas.toDataURL("image/jpeg", quality);
        break;
      case "webp":
        downloadUrl = canvas.toDataURL("image/webp", quality);
        break;
      case "svg":
        downloadUrl = svgUrl;
        break;
      default:
        throw new Error("Unsupported format");
    }

    if (type == "download") {
      // Trigger download
      const link = document.createElement("a");
      link.download = `${filename}.${format}`;
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(svgUrl);
    } else if (type == "get-link") {
      return downloadUrl;
    }
  }

  // json
  const exportJSON = () => {
    const serializer = getJSONData();
    const blob = new Blob([JSON.stringify(serializer)]);
    saveAs(blob, `editor-${Date.now()}.json`);
  };

  function dataURLtoFile(dataurl: string, filename: string) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  return {
    exportImage,
    exportJSON,
    exportSVG,
    getJSONData,
    getSVGData,
    Exporting,
  };
};
