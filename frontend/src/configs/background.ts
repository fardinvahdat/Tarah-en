export const TransparentFill = 'rgba(0,0,0,0)'
export const MinSize = 30
export const MaxSize = 800
export const Padding = 50000

export const DesignUnitMode = [
  {id: 0, name: 'mm'}, 
  {id: 1, name: 'px'}, 
]

export const DesignSizeMode = [
  {id: 0, name: 'Business card ', disabled: false}, 
  {id: 1, name: 'Single page', disabled: false}, 
  {id: 2, name: 'Custom', disabled: true}
]

export const BackgroundFillMode = [
  {id: 0, name: 'Uniform'}, 
  // {id: 1, name: 'تصویر'}, 
  {id: 2, name: 'Spectrum'},
  // {id: 3, name: 'شبکه'},
]

// Upload pictures
export const BackgroundFillImageMode = [
  {id: 'contain', name: 'Real size'}, 
  {id: 'repeat', name: 'Repetitive'}, 
  {id: 'cover', name: 'Fit'},
]

// Gradient
export const BackgroundFillGradientMode = [
  {id: 0, name: 'Linear spectrum', value: 'linear'}, 
  {id: 1, name: 'Radial spectrum', value: 'radial'}, 
]

// Grid Image
export const BackgroundFillGridMode = [
  {id: 0, name: 'Spectrum', value: 'interpolateLinear'}, 
  {id: 1, name: 'Flash', value: 'sparkle'}, 
  {id: 2, name: 'Shadow', value: 'shadows'},
]