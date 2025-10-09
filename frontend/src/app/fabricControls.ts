import { noop } from "@vueuse/core";
import { TControlSet } from "@/types/fabric";
import { PolygonElement } from "@/types/canvas";
import { PiBy180, toFixed } from "@/utils/common";
import { px2mm } from "@/utils/image";
import {
  Control,
  Object as FabricObject,
  controlsUtils,
  Point,
  Polygon,
  TPointerEvent,
  Transform,
  TDegree,
  util,
  TransformActionHandler,
} from "fabric";
import { storeToRefs } from "pinia";
import { useMainStore, useFabricStore, useStudioStore } from "@/store";
import { ArcText } from "@/extension/object/ArcText";
import useCanvas from "@/views/Canvas/useCanvas";
import { renderRotateIcon } from "@/utils/drawer";
import { ElementNames } from "@/types/elements";
import useHandleElement from "@/hooks/useHandleElement";
import { nanoid } from "nanoid";

const deleteObjectHandler: TransformActionHandler = (
  eventData,
  transform,
  x,
  y
) => {
  const { target } = transform;
  target.canvas?.remove(target);
  return true;
};

const toggleLockHandler: TransformActionHandler = (
  eventData,
  transform,
  x,
  y
) => {
  const target = transform.target;
  const lockedState = !(target.lockMovementX && target.lockMovementY);

  target.set({
    lockMovementX: lockedState,
    lockMovementY: lockedState,
    lockRotation: lockedState,
    lockScalingX: lockedState,
    lockScalingY: lockedState,
    lockSkewingX: lockedState,
    lockSkewingY: lockedState,
    editable: !lockedState,
  });

  target.canvas?.requestRenderAll();
  return true;
};

const cloneObjectHandler: TransformActionHandler = async (
  eventData,
  transform,
  x,
  y
) => {
  const { copyElement, pasteElement } = useHandleElement();
  const target = transform.target;
  try {
    copyElement();
    setTimeout(() => {
      pasteElement();
      setTimeout(() => {
        const cloned = target.canvas?.getActiveObject();
        cloned.id = nanoid(10);
      }, 100);
    }, 100);
  } catch (error) {
    console.error("Cloning failed:", error);
  }
  return true;
};

const controlImages = new Map<string, HTMLImageElement>();

const loadControlImage = (key: string, svgContent: string) => {
  const img = new Image();
  const sizedSvg = svgContent.replace(
    /<svg([^>]*)>/,
    `<svg$1 width="27" height="27">`
  );
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sizedSvg)}`;
  controlImages.set(key, img);
};

// Load icons (run this once during app initialization)
const initializeControlIcons = () => {
  // Lock icon
  loadControlImage(
    "lock",
    `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 16C9 16.5523 8.55228 17 8 17C7.44772 17 7 16.5523 7 16C7 15.4477 7.44772 15 8 15C8.55228 15 9 15.4477 9 16Z" fill="black"/>
      <path d="M13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16Z" fill="black"/>
      <path d="M17 16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16C15 15.4477 15.4477 15 16 15C16.5523 15 17 15.4477 17 16Z" fill="black"/>
      <path d="M6 10V8C6 7.65929 6.0284 7.32521 6.08296 7M18 10V8C18 4.68629 15.3137 2 12 2C10.208 2 8.59942 2.78563 7.5 4.03126" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M11 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `
  );

  // Unlock icon
  loadControlImage(
    "unlock",
    `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 16C9 16.5523 8.55228 17 8 17C7.44772 17 7 16.5523 7 16C7 15.4477 7.44772 15 8 15C8.55228 15 9 15.4477 9 16Z" fill="black"/>
      <path d="M13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16Z" fill="black"/>
      <path d="M17 16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16C15 15.4477 15.4477 15 16 15C16.5523 15 17 15.4477 17 16Z" fill="black"/>
      <path d="M11 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M6 10V8C6 7.65929 6.0284 7.32521 6.08296 7M17.811 6.5C17.1449 3.91216 14.7958 2 12 2C10.223 2 8.62643 2.7725 7.52779 4" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `
  );

  // Delete icon
  loadControlImage(
    "delete",
    `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 5.97998C17.67 5.64998 14.32 5.47998 10.98 5.47998C9 5.47998 7.02 5.57998 5.04 5.77998L3 5.97998" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path opacity="0.4" d="M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18.8504 9.14014L18.2004 19.2101C18.0904 20.7801 18.0004 22.0001 15.2104 22.0001H8.79039C6.00039 22.0001 5.91039 20.7801 5.80039 19.2101L5.15039 9.14014" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path opacity="0.4" d="M10.3301 16.5H13.6601" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path opacity="0.4" d="M9.5 12.5H14.5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
  );

  // Clone icon
  loadControlImage(
    "clone",
    `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.4" d="M8 16H5.43C3.14 16 2 14.86 2 12.57V5.43C2 3.14 3.14 2 5.43 2H10C12.29 2 13.43 3.14 13.43 5.43" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18.5703 22H14.0003C11.7103 22 10.5703 20.86 10.5703 18.57V11.43C10.5703 9.14 11.7103 8 14.0003 8H18.5703C20.8603 8 22.0003 9.14 22.0003 11.43V18.57C22.0003 20.86 20.8603 22 18.5703 22Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <g opacity="0.4">
        <path d="M14.8691 15H18.1291" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16.5 16.6301V13.3701" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>
  `
  );
};

// Call this once when your application initializes
initializeControlIcons();

const renderControlBackground = (
  ctx: CanvasRenderingContext2D,
  controlKey: string,
  width: number = 27,
  height: number = 27
) => {
  const radius = 4;
  let radii: [number, number, number, number] = [0, 0, 0, 0];

  switch (controlKey) {
    case "delete":
      radii = [radius, radius, radius, radius]; // Left rounded
      break;
    case "clone":
      radii = [radius, radius, radius, radius]; // Right rounded
      break;
    default:
      radii = [radius, radius, radius, radius]; // No radius
  }

  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, radii);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 0;
  ctx.stroke();
};

const renderLockControl = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: any,
  fabricObject: FabricObject
) => {
  ctx.save();
  ctx.translate(left, top);

  // Draw background
  renderControlBackground(ctx, fabricObject.lockMovementX ? "lock" : "unlock");

  // Draw icon
  const img = controlImages.get(fabricObject.lockMovementX ? "lock" : "unlock");
  if (img) {
    ctx.drawImage(img, -13, -13, 27, 27);
  }

  ctx.restore();
};

const renderDeleteControl = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: any,
  fabricObject: FabricObject
) => {
  ctx.save();
  ctx.translate(left, top);

  // Draw background
  renderControlBackground(ctx, "delete");

  // Draw icon
  const img = controlImages.get("delete");
  if (img) {
    ctx.drawImage(img, -13, -13, 27, 27);
  }

  ctx.restore();
};

const renderCloneControl = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: any,
  fabricObject: FabricObject
) => {
  ctx.save();
  ctx.translate(left, top);

  // Draw background
  renderControlBackground(ctx, "clone");

  // Draw icon
  const img = controlImages.get("clone");
  if (img) {
    ctx.drawImage(img, -13, -13, 27, 27);
  }

  ctx.restore();
};

export const changeObjectHeight: TransformActionHandler = (
  eventData: TPointerEvent,
  transform: Transform,
  x: number,
  y: number
) => {
  const localPoint = controlsUtils.getLocalPoint(
    transform,
    transform.originX,
    transform.originY,
    x,
    y
  );

  //  make sure the control changes width ONLY from it's side of target
  const { target } = transform;
  if (
    (transform.originY === "top" && localPoint.y > 0) ||
    (transform.originY === "bottom" && localPoint.y < 0)
  ) {
    const strokeWidth = target.strokeWidth ? target.strokeWidth : 0;
    if (!target.scaleY) return false;
    const strokePadding =
      strokeWidth / (target.strokeUniform ? target.scaleY : 1);
    const oldHeight = target.height;
    const newHeight = Math.ceil(
      Math.abs((localPoint.y * 1) / target.scaleY) - strokePadding
    );
    target.set("height", Math.max(newHeight, 0));
    return oldHeight !== target.height;
  }
  return false;
};

export const changeObjectCurvature: TransformActionHandler = (
  eventData: TPointerEvent,
  transform: Transform,
  x: number,
  y: number
) => {
  const target = transform.target as ArcText;
  let localPoint = controlsUtils.getLocalPoint(
      transform,
      transform.originX,
      transform.originY,
      x,
      y
    ),
    strokePadding =
      target.strokeWidth / (target.strokeUniform ? target.scaleX : 1),
    multiplier = transform.originY === "center" ? 2 : 1,
    cy =
      ((localPoint.y +
        target.controls[transform.corner].offsetY -
        target.height / 2 +
        target._contentOffsetY) *
        multiplier) /
        target.scaleY -
      strokePadding;

  let textHeight = target.calcTextHeight();

  let radius;
  if (Math.abs(cy) <= textHeight / 2) {
    radius = 0;
  } else {
    radius = cy > 0 ? cy - textHeight / 2 : cy + textHeight / 2;
  }

  target.set(radius);
  return false;
};

const renderResizeWidthControl = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: any,
  fabricObject: any
) => {
  const fabricStore = useFabricStore();
  const { zoom } = storeToRefs(fabricStore);
  const [canvas] = useCanvas();
  const obj = canvas.getActiveObject();
  const width = 6; // control width
  const height = Math.min((obj?.height * obj?.scaleY * zoom.value) / 2, 50); // control height
  const radius = 3; // rounded corner radius

  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(util.degreesToRadians(fabricObject.angle));

  ctx.beginPath();
  ctx.moveTo(-width / 2 + radius, -height / 2);
  ctx.lineTo(width / 2 - radius, -height / 2);
  ctx.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
  ctx.lineTo(width / 2, height / 2 - radius);
  ctx.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
  ctx.lineTo(-width / 2 + radius, height / 2);
  ctx.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
  ctx.lineTo(-width / 2, -height / 2 + radius);
  ctx.quadraticCurveTo(
    -width / 2,
    -height / 2,
    -width / 2 + radius,
    -height / 2
  );
  ctx.closePath();

  ctx.fillStyle = styleOverride?.fill || "#ffffff"; // white fill
  ctx.strokeStyle = styleOverride?.stroke || "#22319e"; // dark stroke
  ctx.lineWidth = 0;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};
const renderResizeHeightControl = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: any,
  fabricObject: any
) => {
  const fabricStore = useFabricStore();
  const { zoom } = storeToRefs(fabricStore);
  const [canvas] = useCanvas();
  const obj = canvas.getActiveObject();
  const width = Math.min((obj?.width * obj?.scaleX * zoom.value) / 2, 50); // control width
  const height = 6; // control height
  const radius = 3; // rounded corner radius

  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(util.degreesToRadians(fabricObject.angle));

  ctx.beginPath();
  ctx.moveTo(-width / 2 + radius, -height / 2);
  ctx.lineTo(width / 2 - radius, -height / 2);
  ctx.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
  ctx.lineTo(width / 2, height / 2 - radius);
  ctx.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
  ctx.lineTo(-width / 2 + radius, height / 2);
  ctx.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
  ctx.lineTo(-width / 2, -height / 2 + radius);
  ctx.quadraticCurveTo(
    -width / 2,
    -height / 2,
    -width / 2 + radius,
    -height / 2
  );
  ctx.closePath();

  ctx.fillStyle = styleOverride?.fill || "#ffffff"; // white fill
  ctx.strokeStyle = styleOverride?.stroke || "#22319e"; // dark stroke
  ctx.lineWidth = 0;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};

const resizeWidthControl = (positionX: number) =>
  new Control({
    x: positionX,
    y: 0,
    actionHandler: controlsUtils.changeWidth,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: "scaling",
    render: renderResizeWidthControl, // use custom render
  });

// define a function that can locate the controls.
// this function will be used both for drawing and for interaction.
export function polygonPositionHandler(
  dim: Point,
  finalMatrix: number[],
  fabricObject: any
) {
  // @ts-ignore
  const pointIndex = this.pointIndex;

  const x = fabricObject.points[pointIndex].x - fabricObject.pathOffset.x;
  const y = fabricObject.points[pointIndex].y - fabricObject.pathOffset.y;
  // console.log('fabricObject:', fabricObject.canvas?.viewportTransform)
  const canvasTransform = fabricObject.canvas?.viewportTransform
    ? fabricObject.canvas?.viewportTransform
    : [1, 0, 0, 1, 0, 0];
  const point = util.transformPoint(
    { x, y } as Point,
    util.multiplyTransformMatrices(
      // fabricObject.canvas?.viewportTransform,
      canvasTransform,
      fabricObject.calcTransformMatrix()
    )
  );
  const snapPoint = fabricObject.pointMoving(pointIndex, point);
  // console.log('Point:', point, 'x:', x, 'y:', y, snapPoint)
  return point;
}

const getObjectSizeWithStroke = (object: FabricObject) => {
  const scaleX = object.scaleX,
    scaleY = object.scaleY,
    strokeWidth = object.strokeWidth;
  const width = object.width,
    height = object.height;
  const stroke = new Point(
    object.strokeUniform ? 1 / scaleX : 1,
    object.strokeUniform ? 1 / scaleY : 1
  ).scalarMultiply(strokeWidth);
  return new Point(width + stroke.x, height + stroke.y);
};

// define a function that can keep the polygon in the same position when we change its
// width/height/top/left.
export const anchorWrapper = (anchorIndex: number, fn: Function) => {
  return function (
    eventData: MouseEvent,
    transform: any,
    x: number,
    y: number
  ) {
    const fabricObject = transform.target as Polygon;
    const pointX = fabricObject.points[anchorIndex].x,
      pointY = fabricObject.points[anchorIndex].y;
    const handlePoint = new Point({
      x: pointX - fabricObject.pathOffset.x,
      y: pointY - fabricObject.pathOffset.y,
    });
    const absolutePoint = util.transformPoint(
        handlePoint,
        fabricObject.calcTransformMatrix()
      ),
      actionPerformed = fn(eventData, transform, x, y),
      newDim = fabricObject.setDimensions(),
      polygonBaseSize = getObjectSizeWithStroke(fabricObject),
      newX = (pointX - fabricObject.pathOffset.x) / polygonBaseSize.x,
      newY = (pointY - fabricObject.pathOffset.y) / polygonBaseSize.y;
    fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
    return actionPerformed;
  };
};

export const actionHandler = (
  eventData: TPointerEvent,
  transform: any,
  x: number,
  y: number
) => {
  const polygon = transform.target as PolygonElement;
  if (!polygon.__corner) return;
  const currentControl = polygon.controls[polygon.__corner];
  const mouseLocalPosition = controlsUtils.getLocalPoint(
    transform,
    "center",
    "center",
    x,
    y
  );
  // const mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center')
  const polygonBaseSize = getObjectSizeWithStroke(polygon);

  const size = polygon._getTransformedDimensions(0);
  const finalPointPosition = {
    x:
      (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
      polygon.pathOffset.x,
    y:
      (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
      polygon.pathOffset.y,
  } as Point;
  polygon.points[currentControl.pointIndex as number] = finalPointPosition;
  return true;
};

/**
 * Calculate the position of the current control
 */
const positionHandler: Control["positionHandler"] = (
  dim,
  finalMatrix,
  fabricObject,
  currentControl
) => {
  return new Point(
    currentControl.x * dim.x + currentControl.offsetX,
    currentControl.y * dim.y + currentControl.offsetY
  ).transform(finalMatrix);
};

export const getWidthHeight = (fabricObject: FabricObject, noFixed = false) => {
  const objScale = fabricObject.getObjectScaling();
  const point = fabricObject._getTransformedDimensions({
    scaleX: objScale.x,
    scaleY: objScale.y,
  });
  if (!noFixed) {
    point.setX(toFixed(point.x));
    point.setY(toFixed(point.y));
  }
  return point;
};

/**
 * Update the control sizes of ml, mr, mt, mb
 */
const setCornersSize = (object: FabricObject) => {
  if (!object.canvas) return;
  const zoom = object.canvas.getZoom();
  const size = getWidthHeight(object).scalarMultiply(zoom);
  const controls = object.controls;
  const cornersH = ["ml", "mr"];
  cornersH.forEach((corner) => {
    controls[corner].sizeX = object.cornerSize;
    controls[corner].sizeY = size.y;
    controls[corner].touchSizeX = object.touchCornerSize;
    controls[corner].touchSizeY = size.y;
  });
  const cornersV = ["mt", "mb"];
  cornersV.forEach((corner) => {
    controls[corner].sizeX = size.x;
    controls[corner].sizeY = object.cornerSize;
    controls[corner].touchSizeX = size.x;
    controls[corner].touchSizeY = object.touchCornerSize;
  });
};

/**
 * Rotate icon
 */
const rotateIcon = (angle: number) => {
  return `url("data:image/svg+xml,<svg height='20' width='20' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'><g fill='none' transform='rotate(${angle} 16 16)'><path fill='white' d='M18.24 5.37C11.41 6.04 5.98 11.46 5.32 18.26L0 18.26L7.8 26L15.61 18.27L10.6 18.27C11.21 14.35 14.31 11.25 18.24 10.64L18.24 15.55L26 7.78L18.24 0L18.24 5.37Z'></path><path fill='black' d='M19.5463 6.61441C12.4063 6.68441 6.61632 12.4444 6.56632 19.5644L3.17632 19.5644L7.80632 24.1444L12.4363 19.5644L9.18632 19.5644C9.24632 13.8844 13.8563 9.28441 19.5463 9.22441L19.5463 12.3844L24.1463 7.78441L19.5463 3.16441L19.5463 6.61441Z'></path></g></svg>") 12 12,auto`;
};

//

/**
 * Rotate and adsorb, hold down the shift key, and adsorb at a 15-degree angle
 */
const rotationWithSnapping = (
  eventData: TPointerEvent,
  transform: Transform,
  x: number,
  y: number
) => {
  const { shiftKey } = eventData;
  const { target } = transform;
  const { rotationWithSnapping } = controlsUtils;
  let snapAngle: TDegree | undefined;
  if (shiftKey) {
    snapAngle = target.snapAngle;
    target.snapAngle = 15;
  }
  const res = rotationWithSnapping(eventData, transform, x, y);
  snapAngle && (target.snapAngle = snapAngle);
  return res;
};

/**
 * Get the rotation control
 */
const getRotateControl = (angle: number): Partial<Control> => ({
  sizeX: 16,
  sizeY: 16,
  actionHandler: (eventData, transformData, x, y) => {
    transformData.target.canvas?.setCursor(
      rotateIcon(transformData.target.angle + angle)
    );
    return rotationWithSnapping(eventData, transformData, x, y);
  },
  cursorStyleHandler: (eventData, control, fabricObject) => {
    return rotateIcon(fabricObject.angle + angle);
  },
  render: noop,
  actionName: "rotate",
});

/**
 * Get common control properties
 */
const getHornControl = {
  cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
  actionHandler: controlsUtils.scalingEqually,
  actionName: "scaling",
};

const changeWidth = controlsUtils.wrapWithFireEvent(
  "scaling",
  controlsUtils.wrapWithFixedAnchor(controlsUtils.changeWidth)
);

const changeHeight = controlsUtils.wrapWithFireEvent(
  "scaling",
  controlsUtils.wrapWithFixedAnchor(changeObjectHeight)
);

const changeCurvature = controlsUtils.wrapWithFireEvent(
  "scaling",
  controlsUtils.wrapWithFixedAnchor(changeObjectCurvature)
);

export const defaultControls = (): TControlSet => ({
  ml: new Control({
    x: -0.5,
    y: 0,
    actionHandler: controlsUtils.scalingXOrSkewingY,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: "scaling",
    render: renderResizeWidthControl,
    // Don't set positionHandler here, put it in size's positionHandler and update it together.
    // positionHandler: positionHandlerH,
  }),

  mr: new Control({
    x: 0.5,
    y: 0,
    actionHandler: controlsUtils.scalingXOrSkewingY,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: "scaling",
    render: renderResizeWidthControl,
    // positionHandler: positionHandlerH,
  }),

  mb: new Control({
    x: 0,
    y: 0.5,
    actionHandler: controlsUtils.scalingYOrSkewingX,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: "scaling",
    render: renderResizeHeightControl,
    // positionHandler: positionHandlerV,
  }),

  mt: new Control({
    x: 0,
    y: -0.5,
    actionHandler: controlsUtils.scalingYOrSkewingX,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    actionName: "scaling",
    render: renderResizeHeightControl,
    // positionHandler: positionHandlerV,
  }),

  tl: new Control({
    x: -0.5,
    y: -0.5,
    ...getHornControl,
  }),

  tr: new Control({
    x: 0.5,
    y: -0.5,
    ...getHornControl,
  }),

  bl: new Control({
    x: -0.5,
    y: 0.5,
    ...getHornControl,
  }),

  br: new Control({
    x: 0.5,
    y: 0.5,
    ...getHornControl,
  }),

  rotate: new Control({
    x: 0,
    y: 0.5,
    offsetY: 35, // push it below the object
    sizeX: 18,
    sizeY: 18,
    actionHandler: (eventData, transform, x, y) => {
      return rotationWithSnapping(eventData, transform, x, y);
    },
    render: renderRotateIcon, // you can customize this
    actionName: "rotate",
  }),

  delete: new Control({
    x: -0.5,
    y: -0.5,
    offsetX: 10, // Keep same X position
    offsetY: -25, // Increased from -20 to -25 (5px higher)
    cursorStyleHandler: () => "pointer",
    mouseUpHandler: deleteObjectHandler,
    render: renderDeleteControl,
    actionName: "delete",
  }),

  lock: new Control({
    x: -0.5,
    y: -0.5,
    offsetX: 40, // Increased from 35 to 45 (10px right)
    offsetY: -25, // Increased from -20 to -25 (5px higher)
    cursorStyleHandler: () => "pointer",
    mouseUpHandler: toggleLockHandler,
    render: renderLockControl,
    actionName: "toggleLock",
  }),

  clone: new Control({
    x: -0.5,
    y: -0.5,
    offsetX: 70, // Increased from 60 to 80 (20px right)
    offsetY: -25, // Increased from -20 to -25 (5px higher)
    cursorStyleHandler: () => "copy",
    mouseUpHandler: cloneObjectHandler,
    render: renderCloneControl,
    actionName: "cloneObject",
  }),
});

export const resizeControls = (): TControlSet => ({
  mr: resizeWidthControl(0.5),
  ml: resizeWidthControl(-0.5),
  mt: new Control({
    x: 0,
    y: -0.5,
    actionHandler: changeHeight,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    render: renderResizeHeightControl,
    // positionHandler: positionHandlerH,
  }),
  mb: new Control({
    x: 0,
    y: 0.5,
    actionHandler: changeHeight,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
    render: renderResizeHeightControl,
    // positionHandler: positionHandlerH,
  }),
});

export const arcTextControls = (): TControlSet => ({
  c: new Control({
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    actionHandler: changeCurvature,
    cursorStyle: "pointer",
    actionName: "resizing",
  }),
  ...defaultControls(),
  ...resizeControls(),
});

export const lineControls = (): TControlSet => ({
  ml: new Control({
    x: -0.5,
    y: 0,
    actionHandler: changeWidth,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
  }),
  mr: new Control({
    x: 0.5,
    y: 0,
    actionHandler: changeWidth,
    cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
  }),
});

export const textboxControls = (): TControlSet => ({
  ...defaultControls(),
  ...resizeControls(),
});
