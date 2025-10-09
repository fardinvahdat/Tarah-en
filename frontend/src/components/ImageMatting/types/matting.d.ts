export interface MattingType {
value: {}
/** Is it an erasing brush? */
isErasing: boolean
/** Download result image */
onDownloadResult: Function
/** Return result image */
getResult: Function
/** Input form selects file callback */
onFileChange: Function
/**
* Initialize the loaded image, the first parameter is the original image, the second parameter is the cropped image
*/
initLoadImages: Function
/** Brush size */
radius: number | string
/** Brush size: calculated property, display value */
brushSize: any
/** Brush hardness */
hardness: number | string
/** Brush hardness: calculated property, display value */
hardnessText: any
/** Constant */
constants: {
RADIUS_SLIDER_MIN: number
RADIUS_SLIDER_MAX: number
RADIUS_SLIDER_STEP: number
HARDNESS_SLIDER_MAX: number
HARDNESS_SLIDER_STEP: number 
HARDNESS_SLIDER_MIN: number 
} 
}