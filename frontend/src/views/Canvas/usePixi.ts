import { useTemplatesStore } from "@/store";
import { CanvasElement, GroupElement } from "@/types/canvas";
import { ElementNames } from "@/types/elements";
import { Image } from "fabric";
import useCanvas from "./useCanvas";
import pixiWorker from "@/worker/pixi?worker";

let pixi: Worker | undefined = undefined;

// Mobile detection helper
const isLowEndMobile = () => {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  return (
    isMobile &&
    (!navigator.hardwareConcurrency || navigator.hardwareConcurrency < 2)
  );
};

export const initPixi = () => {
  if (pixi) return;
  if (isLowEndMobile()) {
    console.warn("Pixi disabled on low-end mobile device");
    return;
  }

  const width = 800,
    height = 600;
  const resolution = Math.min(window.devicePixelRatio, 2); // Cap for mobile
  const canvas = document.createElement("canvas");

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  document.body.appendChild(canvas);

  try {
    const view = canvas.transferControlToOffscreen();
    pixi = new pixiWorker();
    pixi.postMessage(
      {
        type: "init",
        width,
        height,
        resolution,
        view,
      },
      [view]
    );

    // Error handling
    pixi.addEventListener("error", (event) => {
      console.error("Pixi worker crashed:", event);
      terminatePixi();
    });
  } catch (error) {
    console.error("OffscreenCanvas not supported:", error);
  }

  handleFilter(pixi);
  document.body.removeChild(canvas);
};

export const terminatePixi = () => {
  if (pixi) {
    console.log("Terminating Pixi worker");
    pixi.postMessage({ type: "terminate" });
    pixi.terminate();
    pixi = undefined;
  }
};

const findElement = (
  eid: string,
  elements: CanvasElement[] | undefined
): CanvasElement | undefined => {
  if (!elements) return;
  for (let i = 0; i < elements.length; i++) {
    const item = elements[i] as CanvasElement;
    if (item.id === eid) return item;

    if (item.type.toLowerCase() === ElementNames.GROUP) {
      const element = findElement(
        eid,
        (item as GroupElement)._objects as CanvasElement[]
      );
      if (element) return element;
    }
  }
  return;
};

export const handleFilter = (worker: Worker) => {
  const templatesStore = useTemplatesStore();
  const [canvas] = useCanvas();

  worker.addEventListener("message", async (event) => {
    try {
      const data = event.data;
      if (data.error) {
        console.error("Pixi error:", data.error);
        return;
      }

      const objects = canvas?.getObjects();
      const element = findElement(data.id, objects as CanvasElement[]) as Image;

      if (element instanceof Image) {
        element.originSrc = element.getSrc();
        await element.setSrc(data.res);
        element.dirty = true;
        canvas.renderAll();
      }
    } catch (error) {
      console.error("Filter handling error:", error);
      canvas?.renderAll();
    }
  });
};

export default (): [Worker | undefined] => [pixi];
