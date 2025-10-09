import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useFabricStore, useTemplatesStore } from "@/store";
import { useElementBounding } from "@vueuse/core";
import { Group, Point } from "fabric";
import useCanvas from "@/views/Canvas/useCanvas";
import useCenter from "@/views/Canvas/useCenter";
import { WorkSpaceThumbType } from "@/configs/canvas";
import { getObjectsBoundingBox } from "@/extension/util/common";
import { throttle, debounce } from "lodash-es";

export default () => {
  const fabricStore = useFabricStore();
  const { zoom, wrapperRef, scalePercentage } = storeToRefs(fabricStore);
  const canvasScalePercentage = computed(
    () => Math.round(zoom.value * 100) + "%"
  );

  /**
   * Optimized zoom canvas with mobile performance in mind
   * @param command Zoom commands: Zoom in, Zoom out
   */
  const scaleCanvas = throttle((command: "+" | "-") => {
    const [canvas] = useCanvas();
    if (!canvas) return;

    let percentage = Math.round(zoom.value * 100);
    const step = 5;
    const max = 500;
    const min = 10;

    if (command === "+" && percentage <= max) percentage += step;
    if (command === "-" && percentage >= min) percentage -= step;

    const { centerPoint } = useCenter();

    // Disable rendering during zoom for performance
    canvas.renderOnAddRemove = false;
    canvas.zoomToPoint(centerPoint, percentage / 100);

    const newCenter = new Point(centerPoint.x, centerPoint.y)
      .scalarMultiply(canvas.getZoom())
      .subtract(canvas.getCenterPoint());

    canvas.absolutePan(newCenter, true); // Skip coords for performance
    canvas.renderOnAddRemove = true;
    const active = canvas.getActiveObject();
    canvas.discardActiveObject();
    canvas.setActiveObject(active);
    canvas.requestRenderAll();

    zoom.value = canvas.getZoom();
  }, 100);

  /**
   * Mobile-optimized canvas scale percentage setter
   * @param value Target canvas scale
   */
  const setCanvasScalePercentage = debounce((value: number) => {
    const [canvas] = useCanvas();
    if (!canvas) return;

    const { centerPoint } = useCenter();

    canvas.renderOnAddRemove = false;
    canvas.zoomToPoint(centerPoint, value / 100);
    canvas.absolutePan(
      new Point(centerPoint.x, centerPoint.y)
        .scalarMultiply(canvas.getZoom())
        .subtract(canvas.getCenterPoint()),
      true
    );
    canvas.renderOnAddRemove = true;
    canvas.requestRenderAll();

    zoom.value = canvas.getZoom();
  }, 100);

  const setWorkSpace = (width: number, height: number) => {
    const [canvas] = useCanvas();
    if (!canvas) return;

    const fabricStore = useFabricStore();
    const templatesStore = useTemplatesStore();
    const { scalePercentage, zoom, clip } = storeToRefs(fabricStore);
    const { currentTemplate } = storeToRefs(templatesStore);

    const scalePercentageVal = scalePercentage.value / 100;
    let zoomVal = 1;
    const workWidth = currentTemplate.value.width / currentTemplate.value.zoom;
    const workHeight =
      currentTemplate.value.height / currentTemplate.value.zoom;

    if (
      width < workWidth / scalePercentageVal ||
      height < workHeight / scalePercentageVal
    ) {
      if (workWidth / width > workHeight / height) {
        zoomVal = workWidth / (width * scalePercentageVal);
      } else {
        zoomVal = workHeight / (height * scalePercentageVal);
      }
    }

    zoom.value = 1 / zoomVal;
    clip.value = currentTemplate.value.clip;
    canvas.setZoom(zoom.value);

    return { workWidth, workHeight };
  };

  // Optimized canvas transform with batched operations
  const setCanvasTransform = debounce(() => {
    const [canvas] = useCanvas();
    if (!canvas) return;

    const { zoom } = storeToRefs(fabricStore);
    const objects = canvas
      ?.getObjects()
      .filter((ele) => !WorkSpaceThumbType.includes(ele.id));
    const boundingBox = getObjectsBoundingBox(objects);
    const { width, height, centerPoint } = useCenter();

    if (!boundingBox) return;

    // Batch canvas operations
    canvas.renderOnAddRemove = false;

    zoom.value =
      (Math.min(canvas.getWidth() / width, canvas.getHeight() / height) *
        scalePercentage.value) /
      100;
    canvas.setZoom(zoom.value);
    canvas.absolutePan(
      new Point(centerPoint.x, centerPoint.y)
        .scalarMultiply(zoom.value)
        .subtract(canvas.getCenterPoint()),
      true
    );

    canvas.renderOnAddRemove = true;
    canvas.requestRenderAll();
  }, 150);

  /**
   * Mobile-optimized canvas reset
   */
  const resetCanvas = () => {
    setCanvasTransform();
  };

  const setCanvasSize = debounce(() => {
    const [canvas] = useCanvas();
    const { width, height } = useElementBounding(wrapperRef.value);

    canvas.renderOnAddRemove = false;
    canvas.setDimensions({ width: width.value, height: height.value });
    canvas.renderOnAddRemove = true;
    canvas.requestRenderAll();
  }, 100);

  return {
    canvasScalePercentage,
    setCanvasScalePercentage,
    setCanvasTransform,
    setWorkSpace,
    scaleCanvas,
    resetCanvas,
    setCanvasSize,
  };
};
