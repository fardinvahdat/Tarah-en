<template>
  <div class="text-style-panel !p-0" v-if="props.type !== 'textEffect'">
    <ElementPosition />
    <el-divider style="margin: 12px 0" />

    <TextArrangementPanel 
      :handleElement="handleElement"
      @arrange-element="handleElementArrange"
      @char-spacing="handleElementCharSpacing" />

    <TextDeformationPanel 
      :handleElement="handleElement"
      @deformation="handleElementDeformation" />

    <ArcTextPanel 
      :handleElement="handleElement"
      @radius-change="changeArcTextRadius" />

    <el-divider style="margin: 12px 0" />

    <ElementFill />

    <el-divider style="margin: 12px 0" />

    <ElementStroke :hasStroke="hasStroke" />

    <el-divider style="margin: 12px 0" />

    <ElementShadow :hasShadow="hasShadow" />
  </div>
  <TextEffectPanel v-else />
</template>

<script lang="ts" setup>
import { computed, ref, defineProps } from 'vue'
import { useMainStore, useTemplatesStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { FabricObject, IText, Textbox } from 'fabric'
import { FontSizeLibs, LineHeightLibs, CharSpaceLibs } from '@/configs/texts'
import { WEB_FONTS } from '@/configs/fonts'
import { propertiesToInclude } from '@/configs/canvas'
import { TextboxElement } from '@/types/canvas'
import { ElementNames, FontGroupOption } from '@/types/elements'
import { loadFont } from '@/utils/fonts'
import { nanoid } from 'nanoid'
import { ArcText } from '@/extension/object/ArcText'
import { CurvedText } from '@/extension/object/CurvedText'
import { VerticalText } from '@/extension/object/VerticalText'
import opentype from "opentype.js"
import ElementPosition from '../Components/ElementPosition.vue'
import ElementStroke from '../Components/ElementStroke.vue'
import ElementShadow from '../Components/ElementShadow.vue'
import ElementOpacity from '../Components/ElementOpacity.vue'
import ElementPatterns from '../Components/ElementPatterns.vue'
import ElementEffects from '../Components/ElementEffects.vue'
import ElementFill from '../Backgrounds/ElementFill.vue'
import TextEffectPanel from './TextEffectPanel.vue'
import useHandleCreate from "@/hooks/useHandleCreate"
import useCanvas from '@/views/Canvas/useCanvas'

// Import new components
import TextArrangementPanel from './Components/TextArrangementPanel.vue'
import TextDeformationPanel from './Components/TextDeformationPanel.vue'
import ArcTextPanel from './Components/ArcTextPanel.vue'

const props = defineProps({
  type: {
    default: ''
  }
})

const mainStore = useMainStore()
const templatesStore = useTemplatesStore()
const { canvasObject, systemFonts, onlineFonts } = storeToRefs(mainStore)
const { createPathElement } = useHandleCreate()
const [canvas] = useCanvas()
const handleElement = computed(() => canvasObject.value as Textbox | ArcText)
const elementGrapheme = computed(() => handleElement.value.type.toLowerCase() !== ElementNames.VERTICALTEXT)
const elementBackgrounColor = computed(() => {
  if (handleElement.value.type.toLowerCase() === ElementNames.ARCTEXT) {
    return handleElement.value.textBackgroundColor
  }
  return handleElement.value.backgroundColor
})

// Computed property to control when to show text arrangement options
const showTextArrangementOptions = computed(() => {
  const elementType = handleElement.value.type.toLowerCase();
  // Only show for regular textboxes, not for ARC or VERTICAL
  return elementType !== ElementNames.ARCTEXT && elementType !== ElementNames.VERTICALTEXT;
})

const hasFontFamily = computed(() => handleElement.value.fontFamily)
const hasFontWeight = computed(() => handleElement.value.fontWeight !== 'normal')
const hasFontStyle = computed(() => handleElement.value.fontStyle !== 'normal')
const hasUnderline = computed(() => handleElement.value.underline)
const hasLinethrough = computed(() => handleElement.value.linethrough)
const textAlign = computed(() => handleElement.value.textAlign)
const hasStroke = computed(() => handleElement.value.stroke ? true : false)
const hasShadow = computed(() => handleElement.value.shadow ? true : false)
const hasPatterns = computed(() => (handleElement.value as TextboxElement).fillType === 1 ? true : false)
const elementFontFamily = ref<string>(hasFontFamily.value)
const fontOptionGroups = ref<FontGroupOption[]>([
  {
    label: 'System fonts',
    options: systemFonts.value
  },
  {
    label: 'Online Fonts',
    options: onlineFonts.value
  }
])

// Modify font family
const handleElementFontFamily = (fontFamily: string) => {
  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ fontFamily })
  }
  else {
    templatesStore.modifedElement(handleElement.value, { fontFamily })
  }
  canvas.renderAll()
}

// Modify input font size
const handleElementInputSize = (val: string) => {
  val = val.replace(/[^\d]/g, '')
  if (val) {
    templatesStore.modifedElement(handleElement.value, { fontSize: val })
  }
}

// Modify font size
const handleElementFontSize = (fontSize: string) => {
  fontSize = fontSize
  if (!fontSize) return
  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ fontSize })
  }
  else {
    templatesStore.modifedElement(handleElement.value, { fontSize })
  }
  canvas.renderAll()
}

// Modify font color
const updateFontColor = (fill: string) => {
  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ fill })
  }
  else {
    templatesStore.modifedElement(handleElement.value, { fill, color: fill })
  }
}

// Change the background color
const updateBackgroundColor = (backgroundColor: string) => {
  let changeData: Record<string, any> = { backgroundColor }
  if (handleElement.value.type.toLowerCase() === ElementNames.ARCTEXT) {
    changeData = { 'textBackgroundColor': backgroundColor }
  }
  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles(changeData)
  }
  else {
    templatesStore.modifedElement(handleElement.value, changeData)
  }
}

// Modify font size
const handleElementFontsize = (mode: string) => {
  if (handleElement.value.fontSize <= 6) return
  const fontSize = mode === '+' ? handleElement.value.fontSize + 1 : handleElement.value.fontSize - 1
  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ fontSize })
  }
  else {
    templatesStore.modifedElement(handleElement.value, { fontSize })
  }
  canvas.renderAll()
}

// Modify the font to bold
const handleElementBlod = () => {
  const fontBold = 'bold', fontNormal = 'normal'
  if (handleElement.value.isEditing) {
    const blodState = handleElement.value.getSelectionStyles().find(item => item.fontWeight !== fontBold)
    if (!blodState || (JSON.stringify(blodState) === '{}' && handleElement.value.fontWeight === fontBold)) {
      handleElement.value.setSelectionStyles({ 'fontWeight': fontNormal })
    }
    else {
      handleElement.value.setSelectionStyles({ 'fontWeight': fontBold })
    }
  }
  else {
    const elementStyle = handleElement.value.styles
    if (handleElement.value.fontWeight === fontBold) {
      templatesStore.modifedElement(handleElement.value, { fontWeight: fontNormal })
      for (let i in elementStyle) {
        for (let j in elementStyle[i]) {
          (elementStyle[i][j] as TextboxElement).set({ fontWeight: fontNormal })
        }
      }
    }
    else {
      templatesStore.modifedElement(handleElement.value, { fontWeight: fontBold })
      for (let i in elementStyle) {
        for (let j in elementStyle[i]) {
          (elementStyle[i][j] as TextboxElement).set({ fontWeight: fontBold })
          // elementStyle[i][j].fontWeight = fontBold
        }
      }
    }
  }
}

// Modify italics
const handleElementItalic = () => {
  const fontStyle = handleElement.value.fontStyle === 'italic' ? 'normal' : 'italic'

  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ fontStyle })
  }
  else {
    templatesStore.modifedElement(handleElement.value, { fontStyle })
  }

}

// Modify the Delete Line
const handleElementLinethrough = () => {
  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ linethrough: !handleElement.value.linethrough })
  }
  else {
    templatesStore.modifedElement(handleElement.value, { linethrough: !handleElement.value.linethrough })
  }
}

// Modify the dash
const handleElementUnderline = () => {
  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ underline: !handleElement.value.underline })
  }
  else {
    templatesStore.modifedElement(handleElement.value, { underline: !handleElement.value.underline })
  }
}

// Modify the font to center
const handleTextAlign = (textAlign: string) => {
  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ textAlign })
  }
  else {
    templatesStore.modifedElement(handleElement.value, { textAlign })
  }
}

// Modify indentation
const handleElementCharSpacing = (mode: '+' | '-') => {
  const handleCharSpacing = handleElement.value.charSpacing
  const charSpacing = mode === '+' ? handleCharSpacing + 10 : handleCharSpacing - 10
  templatesStore.modifedElement(handleElement.value, { charSpacing })
}

const changeLineHeight = (lineHeight: number) => {
  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ lineHeight })
  }
  else {
    templatesStore.modifedElement(handleElement.value, { lineHeight })
  }
}

const changeCharSpacing = (charSpacing: number) => {
  if (handleElement.value.isEditing) {
    handleElement.value.setSelectionStyles({ charSpacing })
  }
  else {
    templatesStore.modifedElement(handleElement.value, { charSpacing })
  }

  canvas.renderAll()
}

const handleElementArrange = (status: boolean) => {
  const options = (handleElement.value as any).toObject(propertiesToInclude as any[])
  options.lineHeight = 12
  delete options.type
  options.id = nanoid(10)
  let textElement: FabricObject = new Textbox(handleElement.value.text, options)
  if (status) {
    textElement = new VerticalText(handleElement.value.text, options)
  }
  const activeObject = canvas.getActiveObject()
  if (activeObject) canvas.remove(activeObject)
  canvas.discardActiveObject()
  canvas.add(textElement)
  templatesStore.addElement(textElement)
  canvas.setActiveObject(textElement)
  mainStore.setCanvasObject(textElement)
  canvas.renderAll()
}

const handleElementCurve = async () => {

  // ElMessage
  let fontElement: opentype.Font | undefined

  const fontURL = import.meta.env.MODE === 'production' ? `/assets/${hasFontFamily.value}.ttf` : `/src/assets/fonts/${hasFontFamily.value}.ttf`
  fontElement = await opentype.load(fontURL)

  if (!fontElement) return
  const path = fontElement.getPath(handleElement.value.text, 0, 0, handleElement.value.fontSize);
  createPathElement(path.toPathData(2), handleElement.value.left, handleElement.value.top)
  canvas.remove(handleElement.value)
  canvas.renderAll()
}

const handleElementDeformation = () => {
  const options = (handleElement.value as any).toObject(propertiesToInclude as any[]) as any
  options.originType = options.type
  delete options.type
  options.id = nanoid(10)
  let text
  if (handleElement.value.type.toLowerCase() === ElementNames.ARCTEXT) {
    text = new IText(options.text, options)
  } else {
    text = new ArcText(options.text, options)
  }
  canvas.add(text)
  handleElement.value.set({ visible: false })
  templatesStore.addElement(text)
  canvas.setActiveObject(text)
  canvas.renderAll()
}

const changeArcTextRadius = (val: number) => {
  (handleElement.value as ArcText).setRadius(val)
  templatesStore.modifedElement(handleElement.value, { radius: val })
}

const changeArcTextStatus = (showCurvature: boolean) => {
  (handleElement.value as ArcText).set({ showCurvature })
  templatesStore.modifedElement(handleElement.value, { showCurvature })
}

</script>

<style lang="scss" scoped>
.text-style-panel {
  user-select: none;
  @apply bg-white rounded-xl p-4;
}

.panel-section {
  @apply bg-gray-50 p-4 rounded-xl;
}

.panel-title {
  @apply text-gray-700 font-semibold text-sm;
}

.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.preset-style {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.preset-style-item {
  width: 50%;
  height: 50px;
  border: solid 1px #d6d6d6;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  transition: all $transitionDelay;

  &:hover {
    border-color: $themeColor;
    color: $themeColor;
    z-index: 1;
  }

  &:nth-child(2n) {
    margin-left: -1px;
  }

  &:nth-child(n+3) {
    margin-top: -1px;
  }
}

.font-size-btn {
  padding: 0;
}

.link-popover {
  width: 240px;

  .btns {
    margin-top: 10px;
    text-align: right;
  }
}

.mt-10 {
  margin-top: 10px;
}

.full-group {
  display: flex;
  flex: 1;

  .el-button {
    width: 50%;
  }
}

.tooltip-popover {
  .el-button {
    width: 100%;
    border-radius: 0;
  }

  .font-color {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    border-right: 0;
  }

  .high-light {
    border-right: 0;
  }
}

.font-size {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.full-ratio {
  display: flex;
  flex: 1;

  .el-radio-button {
    position: relative;
    display: inline-flex;
    outline: 0;
    flex: 1;
  }

  .el-radio-button__inner {
    width: 100%
  }
}

.flex-align {
  display: flex;
  align-items: center;
}

.full-checkbox {
  display: flex;
  flex: 1;
}

.full-button {
  width: 100%;

  .iconfont {
    font-size: 32px;
  }
}
</style>

<style scoped>
:deep(.full-ratio .el-radio-button__inner) {
  width: 100%;
}

:deep(.full-ratio .el-radio-button) {
  position: relative;
  display: inline-flex;
  outline: 0;
  flex: 1;
}

:deep(.full-checkbox .el-checkbox-button) {
  position: relative;
  display: inline-flex;
  outline: 0;
  flex: 1;
}

:deep(.full-checkbox .el-checkbox-button__inner) {
  width: 100%;
}

:deep(.el-select),
:deep(.el-input__wrapper) {
  width: 100%;
  border-radius: 12px;
}

:deep(.el-button) {
  border-radius: 12px;
  height: 40px;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
}

:deep(.el-divider) {
  background-color: #f0f0f0;
}

:deep(.el-slider__runway) {
  margin: 8px 0;
}
</style>
<style lang="scss" scoped>
.element-slider {
  @apply bg-gray-50 rounded-xl p-4;
}

.section {
  // margin-bottom: 16px;
}

.section-header {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider {
  flex: 1;
}

.slider-value {
  min-width: 46px;
  font-size: 12px;
  color: #666;
  text-align: center;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 8px;
}
</style>
