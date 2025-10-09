import { pasteCustomClipboardString } from '@/utils/clipboard'
import useHandleCreate from '@/hooks/useHandleCreate'
import useAddTemplateElement from '@/hooks/useAddTemplateElement'

interface PasteTextClipboardDataOptions {
  onlySlide?: boolean
  onlyElements?: boolean
}

export default () => {
  const { createTextElement } = useHandleCreate()
  const { addElementsFromData, addTemplatesFromData } = useAddTemplateElement()

  /**
   * Parse the clipboard content and select the appropriate paste method based on the parsing results
   * @param text Clipboard contents
   * @param options Configuration items: onlySlide -- only handles page pasting; onlyElements -- only handles element pasting;
   */
  const pasteTextClipboardData = (text: string, options?: PasteTextClipboardDataOptions) => {
    const onlySlide = options?.onlySlide || false
    const onlyElements = options?.onlyElements || false

    const clipboardData = pasteCustomClipboardString(text)

    // Element or Page
    if (typeof clipboardData === 'object') {
      const { type, data } = clipboardData

      if (type === 'elements' && !onlySlide) addElementsFromData(data)
      else if (type === 'templates' && !onlyElements) addTemplatesFromData(data)
    }

    else if (!onlyElements && !onlySlide) {
      createTextElement(36)
    }
  }

  return {
    pasteTextClipboardData,
  }
}