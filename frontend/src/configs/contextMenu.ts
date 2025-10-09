import { ContextMenu } from '@/components/Contextmenu/types'
import { ElementNames, AlignCommand, LayerCommand } from '@/types/elements'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store'
import useHandleElement from '@/hooks/useHandleElement'
import useHandleTool from '@/hooks/useHandleTool'



export const contextMenuThumbnails = (): ContextMenu[] => {
  const { pasteElement } = useHandleElement()
  return [
    {
      text: 'Affidance',
      subText: 'Ctrl + V',
      handler: pasteElement,
    },
    {
      text: 'Choose all',
      subText: 'Ctrl + A',
      // handler: selectAllSlide,
    },
    {
      text: 'Making the Hadid Page',
      subText: 'Enter',
      // handler: createSlide,
    },
    {
      text: 'Preview',
      subText: 'F5',
      // handler: enterScreeningFromStart,
    },
  ]
}

export const contextMenus = (): ContextMenu[] => {
  const { lockElement, deleteElement, cutElement, copyElement, pasteElement, uncombineElements, combineElements, resetElements } = useHandleElement()
  const { alignElement, layerElement } = useHandleTool()
  const { canvasObject } = storeToRefs(useMainStore())
  const element = canvasObject.value
  if (!element) {
    return [
      {
        text: 'Affiliate',
        subText: 'Ctrl + V',
        // handler: pasteSlide,
        handler: pasteElement,
      },
      {
        text: 'Choose all',
        subText: 'Ctrl + A',
        // handler: selectAllSlide,
      },
      {
        text: 'The ruler',
        // handler: createSlide,
      },
      {
        text: 'Network',
        // handler: enterScreeningFromStart,
      },
      {
        text: 'Reset',
        handler: resetElements,
      },
    ]
  }
  if (element.lockMovementX && element.lockMovementY) {
    return [{
      text: 'Unlock unlock', 
      handler: () => lockElement(element.id, false),
    }]
  }

  return [
    {
      text: 'Cut',
      subText: 'Ctrl + X',
      handler: cutElement,
    },
    {
      text: 'Copy',
      subText: 'Ctrl + C',
      handler: copyElement,
    },
    {
      text: 'Affiliate',
      subText: 'Ctrl + V',
      handler: pasteElement,
    },
    { divider: true },
    {
      text: 'Horizontal center',
      handler: () => alignElement(AlignCommand.HORIZONTAL),
      children: [
        { text: 'Vertical center', handler: () => alignElement(AlignCommand.CENTER), },
        { text: 'Horizontal center', handler: () => alignElement(AlignCommand.HORIZONTAL) },
        { text: 'Left -leaning', handler: () => alignElement(AlignCommand.LEFT) },
        { text: 'Right left', handler: () => alignElement(AlignCommand.RIGHT) },
      ],
    },
    {
      text: 'Vertical center',
      handler: () => alignElement(AlignCommand.VERTICAL),
      children: [
        { text: 'Horizontal center', handler: () => alignElement(AlignCommand.CENTER) },
        { text: 'Vertical center', handler: () => alignElement(AlignCommand.VERTICAL) },
        { text: 'High -level', handler: () => alignElement(AlignCommand.TOP) },
        { text: 'Lower balance', handler: () => alignElement(AlignCommand.BOTTOM) },
      ],
    },
    { divider: true },
    {
      text: 'Bring forward',
      // disable: props.isMultiSelect && !props.elementInfo.groupId,
      handler: () => layerElement(LayerCommand.TOP),
      children: [
        { text: 'Bring forward', handler: () => layerElement(LayerCommand.TOP) },
        { text: 'Take a high level', handler: () => layerElement(LayerCommand.UP) },
      ],
    },
    {
      text: 'Place at the bottom',
      // disable: props.isMultiSelect && !props.elementInfo.groupId,
      handler: () => layerElement(LayerCommand.BOTTOM),
      children: [
        { text: 'Place at the bottom', handler: () => layerElement(LayerCommand.BOTTOM) },
        { text: 'Move backwards', handler: () => layerElement(LayerCommand.DOWN) },
      ],
    },
    { divider: true },
    {
      text: element.type === ElementNames.GROUP ? 'Cancellation of integration' : 'Integration',
      subText: 'Ctrl + G',
      handler: element.type === ElementNames.GROUP ? uncombineElements : combineElements,
      // hide: !props.isMultiSelect,
    },
    {
      text: 'Choose all',
      subText: 'Ctrl + A',
      // handler: selectAllElement,
    },
    {
      text: 'To lock',
      subText: 'Ctrl + L',
      handler: () => lockElement(element.id, true),
    },
    {
      text: 'Delete',
      subText: 'Delete',
      handler: () => deleteElement(element.id),
    },
  ]
}

export const contextMenusThumbnails = (): ContextMenu[] => {
  return [
    {
      text: 'Cut',
      subText: 'Ctrl + X',
      // handler: cutSlide,
    },
    {
      text: 'Copy',
      subText: 'Ctrl + C',
      // handler: copySlide,
    },
    {
      text: 'Affidance',
      subText: 'Ctrl + V',
      // handler: pasteSlide,
    },
    {
      text: 'Choose all',
      subText: 'Ctrl + A',
      // handler: selectAllSlide,
    },
    { divider: true },
    {
      text: 'Create page',
      subText: 'Enter',
      // handler: createSlide,
    },
    {
      text: 'Copy the page',
      subText: 'Ctrl + D',
      // handler: copyAndPasteSlide,
    },
    {
      text: 'Remove the page',
      subText: 'Delete',
      // handler: () => deleteSlide(),
    },
    { divider: true },
    {
      text: 'Current preview',
      subText: 'Shift + F5',
      // handler: enterScreening,
    },
  ]
}