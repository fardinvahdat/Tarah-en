export const WorkSpaceDrawType = 'WorkSpaceDrawType'
export const WorkSpaceClipType = 'WorkSpaceClipType'
export const WorkSpaceSafeType = 'WorkSpaceSafeType'
export const WorkSpaceMaskType = 'WorkSpaceMaskType'
export const WorkSpaceLineType = 'WorkSpaceLineType'

export const WorkSpaceCommonType = [
  WorkSpaceDrawType, WorkSpaceClipType, WorkSpaceSafeType, WorkSpaceMaskType, WorkSpaceLineType
]

export const WorkSpaceThumbType = [
  WorkSpaceClipType, WorkSpaceSafeType, WorkSpaceMaskType, WorkSpaceLineType
]

// Split Server
export const Separator = '.'

// Fixed elements
export const WorkSpaceName = 'EDITOR-DRAW'

// 
export const CropLinesColor = '#purple'

// Database id
export const LocalStorageDiscardedKey = 'EDITOR_DISCARD_DB'

// Canvas Edit Color
export const WorkSpaceEditColor = 'rgba(255,255,255,0)'

// Canvas mask color
export const WorkSpaceMaskColor = "#e2ebfe";

// Canvas background color
export const CanvasBackground = 'rgba(255,255,255,0)'

// Canvas Cutout Color
export const WorkSpaceClipColor = 'purple'

// Canvas Safe Colors
export const WorkSpaceSafeColor = 'yellow'

// Canvas common parameters
export const WorkSpaceCommonOption = {
  absolutePositioned:true,
  selectable: false,
  transparentCorners: false,
  evented: false,
  excludeFromExport: true,
  hasControls: false,
  hasBorders: false,
  perPixelTargetFind: false,
  // absolutePositioned: true,
  lockMovementX: true,
  lockMovementY: true,
  lockRotation: true,
  lockScalingX: true,
  lockScalingY: true,
  lockUniScaling: true,
  hoverCursor: 'default',
  name: WorkSpaceName,
}

export const propertiesToInclude = [
  'id', // Ensure ID is always included
  'name',
  'left',
  'top',
  'width',
  'height',
  'scaleX',
  'scaleY',
  'angle',
  'flipX',
  'flipY',
  'opacity',
  'fill',
  'stroke',
  'strokeWidth',
  'strokeDashArray',
  'strokeLineCap',
  'strokeLineJoin',
  'strokeMiterLimit',
  'strokeDashOffset',
  'fillRule',
  'paintFirst',
  'globalCompositeOperation',
  'skewX',
  'skewY',
  'transformMatrix',
  'text',
  'fontSize',
  'fontWeight',
  'fontFamily',
  'fontStyle',
  'lineHeight',
  'textDecoration',
  'textAlign',
  'textBackgroundColor',
  'charSpacing',
  'styles',
  'path',
  'pathOffset',
  'shadow',
  'clipPath',
  'backgroundColor',
  'selectionBackgroundColor',
  'hoverCursor',
  'moveCursor',
  'visible',
  'borderColor',
  'borderDashArray',
  'cornerColor',
  'cornerStrokeColor',
  'cornerStyle',
  'cornerSize',
  'transparentCorners',
  'rotatingPointOffset',
  'borderOpacityWhenMoving',
  'borderScaleFactor',
  'lockMovementX',
  'lockMovementY',
  'lockRotation',
  'lockScalingX',
  'lockScalingY',
  'lockSkewingX',
  'lockSkewingY',
  'lockUniScaling',
  'hasControls',
  'hasBorders',
  'hasRotatingPoint',
  'selectable',
  'evented',
  'perPixelTargetFind',
  'includeDefaultValues',
  'clipTo'
]

export const WorkSpaceDrawData = {
  "rx": 0,
  "ry": 0,
  "id": "WorkSpaceDrawType",
  "name": "rect",
  "fill": "#fff",
  "selectable": false,
  "evented": false,
  "lockMovementX": false,
  "lockMovementY": false,
  "objectCaching": true,
  "transparentCorners": false,
  "hasBorders": true,
  "type": "Rect",
  "version": "6.0.0-beta9",
  "originX": "left",
  "originY": "top",
  "left": 0,
  "top": 0,
  "width": 1070.5512,
  "height": 645.3543,
  "stroke": "rgba(255,255,255,1)",
  "strokeWidth": 1,
  "strokeDashArray": null,
  "strokeLineCap": "butt",
  "strokeDashOffset": 0,
  "strokeLineJoin": "miter",
  "strokeUniform": false,
  "strokeMiterLimit": 4,
  "scaleX": 1,
  "scaleY": 1,
  "angle": 0,
  "flipX": false,
  "flipY": false,
  "opacity": 1,
  "shadow": null,
  "visible": true,
  "backgroundColor": "",
  "fillRule": "nonzero",
  "paintFirst": "fill",
  "globalCompositeOperation": "source-over",
  "skewX": 0,
  "skewY": 0
}
