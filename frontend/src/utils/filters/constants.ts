
export const FILTER_CATEGORIES = {
  ADJUSTMENTS: 'adjustments',
  EFFECTS: 'effects',
  DUOTONE: 'duotone',
  BASIC: 'basic'
}

export const FILTERS_MAP = {
  Brightness: { label: 'Lighting', min: -1, max: 1, step: 0.01, category: FILTER_CATEGORIES.ADJUSTMENTS, icon: 'brightness' },
  Contrast: { label: 'Contrast', min: -1, max: 1, step: 0.01, category: FILTER_CATEGORIES.ADJUSTMENTS, icon: 'contrast' },
  Saturation: { label: 'Saturation', min: -1, max: 1, step: 0.01, category: FILTER_CATEGORIES.ADJUSTMENTS, icon: 'saturation' },
  Vibrance: { label: 'Vibrant', min: -1, max: 1, step: 0.01, category: FILTER_CATEGORIES.ADJUSTMENTS, icon: 'vibrance' },
  Hue: { label: 'Color', min: -2, max: 2, step: 0.002, category: FILTER_CATEGORIES.ADJUSTMENTS, icon: 'hue' },
  Blur: { label: 'Blar', min: -1, max: 1, step: 0.01, category: FILTER_CATEGORIES.ADJUSTMENTS, icon: 'blur' },
  Noise: { label: 'Noise', min: 0, max: 1000, step: 100, category: FILTER_CATEGORIES.EFFECTS, icon: 'noise' },
  Pixelate: { label: 'Pixel', min: 2, max: 20, step: 1, category: FILTER_CATEGORIES.EFFECTS, icon: 'pixelate' }
}

export const FILTER_PRESETS = {
  'Invert': { label: 'Inversion', category: FILTER_CATEGORIES.EFFECTS, previewClass: 'filter-invert' },
  'Sharpen': { label: 'To sharpen', category: FILTER_CATEGORIES.EFFECTS, previewClass: 'filter-sharpen' },
  'Emboss': { label: 'Concave - convex', category: FILTER_CATEGORIES.EFFECTS, previewClass: 'filter-emboss' },
  'Sepia': { label: 'Spia', category: FILTER_CATEGORIES.DUOTONE, previewClass: 'filter-sepia' },
  'BlackWhite': { label: 'Black white ', category: FILTER_CATEGORIES.DUOTONE, previewClass: 'filter-bw' },
  'Brownie': { label: 'Brown', category: FILTER_CATEGORIES.DUOTONE, previewClass: 'filter-brownie' },
  'Vintage': { label: 'Vintage color', category: FILTER_CATEGORIES.DUOTONE, previewClass: 'filter-vintage' },
  'Kodachrome': { label: 'Kodachrome', category: FILTER_CATEGORIES.DUOTONE, previewClass: 'filter-kodachrome' },
  'Polaroid': { label: 'Polaroid', category: FILTER_CATEGORIES.DUOTONE, previewClass: 'filter-polaroid' },
}

export const GRAYSCALE_MODES = {
  'average': 'Mean',
  'luminosity': 'Shine',
  'lightness': 'Lighting'
}
