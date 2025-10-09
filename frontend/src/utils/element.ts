import tinycolor from 'tinycolor2'
import { nanoid } from 'nanoid'
import { Template, CanvasElement } from '@/types/canvas'
import { ElementNames } from '@/types/elements'
// import { PPTElement, PPTLineElement, Slide } from '@/types/slides'

interface RotatedElementData {
  left: number
  top: number
  width: number
  height: number
  rotate: number
}

/**
* Calculate the new position range of the element after the rectangular range in the canvas is rotated
* @param element The position size and rotation angle information of the element
*/
export const getRectRotatedRange = (element: RotatedElementData) => {
  const { left, top, width, height, rotate = 0 } = element

  const radius = Math.sqrt( Math.pow(width, 2) + Math.pow(height, 2) ) / 2
  const auxiliaryAngle = Math.atan(height / width) * 180 / Math.PI

  const tlbraRadian = (180 - rotate - auxiliaryAngle) * Math.PI / 180
  const trblaRadian = (auxiliaryAngle - rotate) * Math.PI / 180

  const middleLeft = left + width / 2
  const middleTop = top + height / 2

  const xAxis = [
    middleLeft + radius * Math.cos(tlbraRadian),
    middleLeft + radius * Math.cos(trblaRadian),
    middleLeft - radius * Math.cos(tlbraRadian),
    middleLeft - radius * Math.cos(trblaRadian),
  ]
  const yAxis = [
    middleTop - radius * Math.sin(tlbraRadian),
    middleTop - radius * Math.sin(trblaRadian),
    middleTop + radius * Math.sin(tlbraRadian),
    middleTop + radius * Math.sin(trblaRadian),
  ]

  return {
    xRange: [Math.min(...xAxis), Math.max(...xAxis)],
    yRange: [Math.min(...yAxis), Math.max(...yAxis)],
  }
}

/**
* Calculate the deviation between the new position of the element after the rectangular range in the canvas is rotated and the position before the rotation
* @param element The position size and rotation angle information of the element
*/
export const getRectRotatedOffset = (element: RotatedElementData) => {
  const { xRange: originXRange, yRange: originYRange } = getRectRotatedRange({
    left: element.left,
    top: element.top,
    width: element.width,
    height: element.height,
    rotate: 0,
  })
  const { xRange: rotatedXRange, yRange: rotatedYRange } = getRectRotatedRange({
    left: element.left,
    top: element.top,
    width: element.width,
    height: element.height,
    rotate: element.rotate,
  })
  return {
    offsetX: rotatedXRange[0] - originXRange[0],
    offsetY: rotatedYRange[0] - originYRange[0],
  }
}

/**
* Calculate the position range of the element in the canvas
* @param element element information
*/
// export const getElementRange = (element: PPTElement) => {
//   let minX, maxX, minY, maxY

//   if (element.type === 'line') {
//     minX = element.left
//     maxX = element.left + Math.max(element.start[0], element.end[0])
//     minY = element.top
//     maxY = element.top + Math.max(element.start[1], element.end[1])
//   }
//   else if ('rotate' in element && element.rotate) {
//     const { left, top, width, height, rotate } = element
//     const { xRange, yRange } = getRectRotatedRange({ left, top, width, height, rotate })
//     minX = xRange[0]
//     maxX = xRange[1]
//     minY = yRange[0]
//     maxY = yRange[1]
//   }
//   else {
//     minX = element.left
//     maxX = element.left + element.width
//     minY = element.top
//     maxY = element.top + element.height
//   }
//   return { minX, maxX, minY, maxY }
// }

// /**
// * Calculate the position range of a group of elements in the canvas
// * @param elementList A group of element information
// */
// export const getElementListRange = (elementList: PPTElement[]) => {
//   const leftValues: number[] = []
//   const topValues: number[] = []
//   const rightValues: number[] = []
//   const bottomValues: number[] = []

//   elementList.forEach(element => {
//     const { minX, maxX, minY, maxY } = getElementRange(element)
//     leftValues.push(minX)
//     topValues.push(minY)
//     rightValues.push(maxX)
//     bottomValues.push(maxY)
//   })

//   const minX = Math.min(...leftValues)
//   const maxX = Math.max(...rightValues)
//   const minY = Math.min(...topValues)
//   const maxY = Math.max(...bottomValues)

//   return { minX, maxX, minY, maxY }
// }

export interface AlignLine {
  value: number
  range: [number, number]
}

/**
* Remove duplicates from a set of alignment adsorption lines: keep only one of the multiple alignment adsorption lines at the same position, and take the maximum and minimum values ​​of all alignment adsorption lines at that position as the new range
* @param lines A set of alignment adsorption line information
*/
export const uniqAlignLines = (lines: AlignLine[]) => {
  const uniqLines: AlignLine[] = []
  lines.forEach(line => {
    const index = uniqLines.findIndex(_line => _line.value === line.value)
    if (index === -1) uniqLines.push(line)
    else {
      const uniqLine = uniqLines[index]
      const rangeMin = Math.min(uniqLine.range[0], line.range[0])
      const rangeMax = Math.max(uniqLine.range[1], line.range[1])
      const range: [number, number] = [rangeMin, rangeMax]
      const _line = { value: line.value, range }
      uniqLines[index] = _line
    }
  })
  return uniqLines
}

/**
* Based on the page list, generate a new ID for each page and associate it with the old ID to form a dictionary
* Mainly used for page elements to maintain the original relationship between page IDs in the data
* @param slides page list
*/
export const createTemplateIdMap = (templates: Template[]) => {
  const templateIdMap = {}
  for (const template of templates) {
    templateIdMap[template.id] = nanoid(10)
  }
  return templateIdMap
}

/**
* Based on the element list, generate a new ID for each element and associate it with the old ID to form a dictionary
* Mainly used to maintain the original relationship of element IDs in the data when copying elements
* For example: two elements in a group originally have the same groupId, and after copying, they will still have another identical groupId
* @param elements element list data
*/
export const createElementIdMap = (elements: CanvasOption[]) => {
  const groupIdMap = {}
  const elIdMap = {}
  for (const element of elements) {
    const groupId = element.type === ElementNames.GROUP ? element.id : ''
    if (groupId && !groupIdMap[groupId]) {
      groupIdMap[groupId] = nanoid(10)
    }
    elIdMap[element.id] = nanoid(10)
  }
  return {
    groupIdMap,
    elIdMap,
  }
}

/**
* Get the sub-color corresponding to the color scheme based on the theme color of the table
* @param themeColor theme color
*/
export const getTableSubThemeColor = (themeColor: string) => {
  const rgba = tinycolor(themeColor)
  return [
    rgba.setAlpha(0.3).toRgbString(),
    rgba.setAlpha(0.1).toRgbString(),
  ]
}

// /**
// * Get the line element path string
// * @param element line element
// */
// export const getLineElementPath = (element: PPTLineElement) => {
//   const start = element.start.join(',')
//   const end = element.end.join(',')
//   if (element.broken) {
//     const mid = element.broken.join(',')
//     return `M${start} L${mid} L${end}`
//   }
//   else if (element.curve) {
//     const mid = element.curve.join(',')
//     return `M${start} Q${mid} ${end}`
//   }
//   else if (element.cubic) {
//     const [c1, c2] = element.cubic
//     const p1 = c1.join(',')
//     const p2 = c2.join(',')
//     return `M${start} C${p1} ${p2} ${end}`
//   }
//   return `M${start} L${end}`
// }