
import { useI18n as i18n } from 'vue-i18n';
import { changeLocale } from '@/plugins/i18n'

const useI18n = () => {
  return {
    changeLocale,
    ...(i18n() || {} )
  }
}

export default useI18n