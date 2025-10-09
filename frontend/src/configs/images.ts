export const ratioClipOptions = [
  {
    label: 'نسبت تصویر (مربع)',
    children: [
      { key: '1:1', ratio: 1 / 1 },
    ],
  },
  {
    label: 'نسبت تصویر (عمودی)',
    children: [
      { key: '2:3', ratio: 3 / 2 },
      { key: '3:4', ratio: 4 / 3 },
      { key: '3:5', ratio: 5 / 3 },
      { key: '4:5', ratio: 5 / 4 },
    ],
  },
  {
    label: 'نسبت تصویر (افقی)',
    children: [
      { key: '3:2', ratio: 2 / 3 },
      { key: '4:3', ratio: 3 / 4 },
      { key: '5:3', ratio: 3 / 5 },
      { key: '5:4', ratio: 4 / 5 },
    ],
  },
  {
    children: [
      { key: '16:9', ratio: 9 / 16 },
      { key: '16:10', ratio: 10 / 16 },
    ],
  },
]

export const enum ClipPathTypes {
  RECT = 'rect',
  ELLIPSE = 'ellipse',
  POLYGON = 'polygon',
}

export const enum ClipPaths {
  RECT = 'rect',
  ROUNDRECT = 'roundRect',
  ELLIPSE = 'ellipse',
  TRIANGLE = 'triangle',
  PENTAGON = 'pentagon',
  RHOMBUS = 'rhombus',
  STAR = 'star',
}

export const CLIPPATHS = {
  rect: {
    name: 'مستطیل',
    type: ClipPathTypes.RECT,
    radius: '0',
    style: '',
    createPath: (width: number, height: number) => {
      return `M ${-width/2} ${-height/2} L ${width/2} ${-height/2} L ${width/2} ${height/2} L ${width/2} ${height/2} L ${-width/2} ${height/2} Z`
    },
  },
  rect2: {
    name: 'مستطیل 2',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(0% 0%, 80% 0%, 100% 20%, 100% 100%, 0 100%)',
    createPath: (width: number, height: number) => {
      return `M ${-width/2} ${-height/2} L ${width*0.3} ${-height/2} L ${width/2} ${-height*0.3} L ${width/2} ${height/2} L ${-width/2} ${height/2} Z`
    },
  },
  rect3: {
    name: 'مستطیل 3',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(0% 0%, 80% 0%, 100% 20%, 100% 100%, 20% 100%, 0% 80%)',
    createPath: (width: number, height: number) => {
      return `M ${-width/2} ${-height/2} L ${width*0.3} ${-height/2} L ${width/2} ${-height*0.3} L ${width/2} ${height/2} L ${-width*0.3} ${height/2} L ${-width/2} ${height * 0.3} Z`
    },
  },
  roundRect: {
    name: 'مستطیل گرد',
    type: ClipPathTypes.RECT,
    radius: '10px',
    style: 'inset(0 0 0 0 round 10px 10px 10px 10px)',
    createPath: (width: number, height: number, radius=50) => {
      return `M ${-width/2 + radius} ${-height/2}
              Q ${-width/2} ${-height/2} ${-width/2} ${-height/2 + radius}
              L ${-width/2} ${height/2 - radius}
              Q ${-width/2} ${height/2} ${-width/2 + radius} ${height/2}
              L ${width/2 - radius} ${height/2}
              Q ${width/2} ${height/2} ${width/2} ${height/2 - radius}
              L ${width/2} ${-height/2 + radius}
              Q ${width/2} ${-height/2} ${width/2 - radius} ${-height/2}
              L ${-width/2 + radius} ${-height/2}
              Z`
    },
  },
  ellipse: {
    name: 'گرد',
    type: ClipPathTypes.ELLIPSE,
    style: 'ellipse(50% 50% at 50% 50%)',
    createPath: (width: number, height: number, radius=100) => {
      const size = Math.min(width, height)
      return `M ${size/2} 0
      A ${size/2} ${size/2} 0 1 0 ${-size/2} 0
      A ${size/2} ${size/2} 0 1 0 ${size/2} 0
      Z`
    },
  },
  triangle: {
    name: 'مثلث',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    createPath: (width: number, height: number) => {
      return `M 0 ${-height/2} L ${-width/2} ${height/2} L ${width/2} ${height/2} Z`
    },
  },
  triangle2: {
    name: 'مثلث ۲',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(50% 100%, 0% 0%, 100% 0%)',
    createPath: (width: number, height: number) => {
      return `M 0 ${height/2} L ${-width/2} ${-height/2} L ${width/2} ${-height/2} Z`
    },
  },
  triangle3: {
    name: 'مثلث ۳',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(0% 0%, 0% 100%, 100% 100%)',
    createPath: (width: number, height: number) => {
      return `M ${-width/2} ${-height/2} L ${-width/2} ${height/2} L ${width/2} ${height/2} Z`
    },
  },
  rhombus: {
    name: 'الماس',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    createPath: (width: number, height: number) => {
      return `M 0 ${-height/2} L ${width/2} 0 L 0 ${height/2} L ${-width/2} 0 Z`
    },
  },
  pentagon: {
    name: 'پنتاگون',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
    createPath: (width: number, height: number) => {
      return `M 0 ${-height/2} L ${width/2} ${-0.12*height} L ${0.32*width} ${height/2} L ${-0.32*width} ${height/2} L ${-width/2} ${-0.12*height} Z`
    },
  },
  hexagon: {
    name: 'شش ضلعی',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)',
    createPath: (width: number, height: number) => {
      return `M ${-width * 0.3} ${-height/2} L ${width * 0.3} ${-height/2} L ${width/2} 0 L ${width * 0.3} ${height/2} L ${-width * 0.3} ${height/2} L ${-width/2} 0 Z`
    },
  },
  heptagon: {
    name: 'هفت ضلعی',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)',
    createPath: (width: number, height: number) => {
      return `M 0 ${-height/2} L ${width * 0.4} ${-height * 0.3} L ${width/2} ${height * 0.1} L ${width * 0.25} ${height/2} L ${-width * 0.25} ${height/2} L ${-width * 0.5} ${height * 0.1} L ${-width * 0.4} ${-height * 0.3} Z`
    },
  },
  octagon: {
    name: 'هشت ضلعی',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
    createPath: (width: number, height: number) => {
      return `M ${-width * 0.2} ${-height * 0.5} L ${width * 0.2} ${-height * 0.5} L ${width * 0.5} ${-height * 0.2} L ${width * 0.5} ${height * 0.2} L ${width * 0.2} ${height * 0.5} L ${-width * 0.2} ${height * 0.5} L ${-width * 0.5} ${height * 0.2} L ${-width * 0.5} ${-height * 0.2} Z`
    },
  },
  chevron: {
    name: 'V شکل',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)',
    createPath: (width: number, height: number) => {
      return `M ${width * 0.25} ${-height * 0.5} L ${width * 0.5} 0 L ${width * 0.25} ${height * 0.5} L ${-width * 0.5} ${height * 0.5} L ${-width * 0.25} 0 L ${-width * 0.5} ${-height * 0.5} Z`
    },
  },
  point: {
    name: 'نقطه',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)',
    createPath: (width: number, height: number) => {
      return `M ${-width * 0.5} ${-height * 0.5} L ${width * 0.25} ${-height * 0.5} L ${width * 0.5} 0 L ${width * 0.25} ${height * 0.5} L ${-width * 0.5} ${height * 0.5} Z`
    },
  },
  arrow: {
    name: 'فلش',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)',
    createPath: (width: number, height: number) => {
      return `M ${-width * 0.5} ${-height * 0.3} L ${width * 0.1} ${-height * 0.3} L ${width * 0.1} ${-height * 0.5} L ${width * 0.5} 0 L ${width * 0.1} ${height * 0.5} L ${width * 0.1} ${height * 0.3} L ${-width * 0.5} ${height * 0.3} Z`
    },
  },
  parallelogram: {
    name: 'متوازی الاضلاع',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(30% 0%, 100% 0%, 70% 100%, 0% 100%)',
    createPath: (width: number, height: number) => {
      return `M ${-width * 0.2} ${-height * 0.5} L ${width * 0.5} ${-height * 0.5} L ${width * 0.2} ${height * 0.5} L ${-width * 0.5} ${height * 0.5} Z`
    },
  },
  parallelogram2: {
    name: 'متوازی الاضلاع ۲',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(30% 100%, 100% 100%, 70% 0%, 0% 0%)',
    createPath: (width: number, height: number) => {
      return `M ${-width * 0.2} ${height * 0.5} L ${width * 0.5} ${height * 0.5} L ${width * 0.2} ${-height * 0.5} L ${-width * 0.5} ${-height * 0.5} Z`
    },
  },
  trapezoid: {
    name: 'ذوزنقه',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
    createPath: (width: number, height: number) => {
      return `M ${-width * 0.25} ${-height * 0.5} L ${width * 0.25} ${-height * 0.5} L ${width * 0.5} ${height * 0.5} L ${-width * 0.5} ${height * 0.5} Z`
    },
  },
  trapezoid2: {
    name: 'ذوزنقه 2',
    type: ClipPathTypes.POLYGON,
    style: 'polygon(0% 0%, 100% 0%, 75% 100%, 25% 100%)',
    createPath: (width: number, height: number) => {
      return `M ${-width * 0.5} ${-height * 0.5} L ${width * 0.5} ${-height * 0.5} L ${width * 0.25} ${height * 0.5} L ${-width * 0.25} ${height * 0.5} Z`
    },
  },
}

export type ClipPathType = 'rect' 
| 'rect2' 
| 'rect3' 
| 'roundRect' 
| 'ellipse' 
| 'triangle' 
| 'triangle2' 
| 'triangle3' 
| 'rhombus' 
| 'pentagon'
| 'hexagon'
| 'heptagon'
| 'octagon'
| 'chevron'
| 'point'
| 'arrow'
| 'parallelogram'
| 'parallelogram2'
| 'trapezoid'
| 'trapezoid2'

export const PatternImages = [
  { name: 'زمین لرزه', url: new URL(`/src/assets/images/escheresque.png`, import.meta.url).href },
  { name: 'گل خاکستری', url: new URL(`/src/assets/images/greyfloral.png`, import.meta.url).href },
  { name: 'چوب', url: new URL(`/src/assets/images/retina_wood.png`, import.meta.url).href },
]

export const GrayscaleType = 'Grayscale'
export const SharpenMatrix = [ 0, -1, 0, -1,   5, -1,  0,  -1,  0 ]
export const EmbossMatrix =  [ 1,  1, 1,  1, 0.7, -1, -1,  -1, -1 ]

// backgrounds, fashion, nature, science, education, feelings, health, people, religion, 
// places, animals, industry, computer, food, sports, transportation, travel, buildings, business, music
export const ImageCategoryInfo = [
  {id: 0, name: 'پس زمینه', type: 'backgrounds', category: [], total: []},
  {id: 1, name: 'طبیعت', type: 'nature', category: [], total: []},
  {id: 2, name: 'علم', type: 'science', category: [], total: []},
  {id: 3, name: 'آمورش', type: 'education' , category: [], total: []},
  {id: 4, name: 'احساسات', type: 'feelings', category: [], total: []},
  {id: 5, name: 'سلامتی' , type: 'health', category: [], total: []},
  {id: 6, name: 'مکان ها', type: 'places', category: [], total: []},
  {id: 7 , name: 'حیوانات', type: 'animals', category: [], total: []},
  {id: 8, name: 'صنعت', type: 'industry', category: [], total: []},
  {id: 9, name: 'کامپیوتر', type: 'computer', category: [], total: []},
  {id: 10, name: 'غذا', type: 'food', category: [], total: []} , {id: 11, name: 'Sports', type: 'sports', category: [], total: []},
  {id: 12, name: 'حمل و نقل', type: 'transportation', category: [] , total: []},
  {id: 13, name: 'سفر کنید', type: 'travel', category: [], total: []},
  {id: 14, name: 'ساختمان ها', type: 'buildings ', category: [], total: []},
  {id: 15, name: 'تجارت', type: 'business', category: [], total: []},
  {id: 16, name: 'مد', type: 'fashion', category: [], total: []},
  {id: 17, name: 'افراد', type: 'people', category: [], total: []},
 
]

export const MattingModel = [
  {id: 'universal', key: 'universal', name: 'کلی'},
  {id: 'people', key: 'people', name: 'پرتره'},
]

export const BlendModes = [
  {id: 'source-over', key: 'source-over', name: 'معمولی'},
// {id: 'source-in', key: 'source-in', name: 'Portrait'},
// {id: 'source-out', key: 'source-out', name: 'Portrait'},
// {id: 'source-atop', key: 'source-atop', name: 'Portrait'},
// {id: 'destination-in', key: 'destination-in', name: 'Portrait'},
// {id: 'destination-out', key: 'destination-out', name: 'Portrait'},
// {id: 'destination-atop', key: 'destination-atop', name: 'Portrait'},
// {id: 'lighter', key: 'lighter', name: 'Portrait'},
  {id: 'screen', key: 'screen', name: 'فیلتر رنگی'},
// {id: 'copy', key: 'copy', name: 'portrait'},
// {id: 'xor', key: 'xor', name: 'portrait'},
  {id: 'multiply', key: 'multiply', name: 'ضرب کنید'},
{id: 'darken', key: 'darken', name: 'تاریک کنید'},
{id: 'lighten', key: 'lighten', name: 'سبک کردن'},
{id: 'color-dodge', key: 'color-dodge', name: 'طفره رفتن رنگ'},
{id: 'color-burn', key: 'color-burn', name: 'رنگ سوختن'},
{id: 'hard-light', key: 'hard-light', name: 'نور سخت'},
{id: 'soft-light', key: 'soft-light', name: 'نور نرم'},
{id: 'difference', key: 'difference', name: 'تفاوت'},
{id: 'exclusion', key: 'exclusion', name: 'محرومیت'},
{id: 'hue', key: 'hue', name: 'رنگ'},
{id: 'saturation', key: 'saturation', name: 'اشباع'},
{id: 'color', key: 'color', name: 'رنگ'},
{id: 'luminosity', key: 'luminosity', name: 'روشنایی'},
]