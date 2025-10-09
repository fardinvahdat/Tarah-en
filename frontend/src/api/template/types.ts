export interface ItemInfo {
  id: number
  title: string
  text: string
  /** Image path */
  photo: string
  /** The width of the image, set after the front end obtains the image information */
  width?: number
  /** The height of the image, set after the front end obtains the image information */
  height?: number
  /**
   * The height of the column where the current node is located
   * - Not the total height of the column, just for debugging
   */
  currentColumnHeight?: number
}

export type ItemList = Array<ItemInfo>;

export interface PageParams {
  page: number
  size: number
}

export interface infoParams {
  pk: number
}

export interface TemplateItem {
  id: number
  preview: string
  width: number
  height:number
  data: string
  title: string
  text: string
  images?: string
}

export interface PageResult {
  total: number
  page: number
  total_pages: number
  size: number
  pages: number
  items: TemplateItem[]
}

export interface TemplateResult {
  code:number
  data: PageResult
  msg: string
}

export interface TemplateInfo {
  code: number
  data: TemplateItem
  msg: string
}