/**
 * Persian/Farsi utility functions for number conversion and localization
 */

// English to Persian digit mapping
const englishToPersianDigits: Record<string, string> = {
  '0': '۰',
  '1': '۱', 
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷',
  '8': '۸',
  '9': '۹'
}

// Persian to English digit mapping
const persianToEnglishDigits: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2', 
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9'
}

/**
 * Convert English numerals to Persian numerals
 * @param input - String or number containing English digits
 * @returns String with Persian digits
 */
export const toPersianNumerals = (input: string | number): string => {
  const str = String(input)
  return str.replace(/[0-9]/g, (digit) => englishToPersianDigits[digit] || digit)
}

/**
 * Convert Persian numerals to English numerals  
 * @param input - String containing Persian digits
 * @returns String with English digits
 */
export const toEnglishNumerals = (input: string): string => {
  return input.replace(/[۰-۹]/g, (digit) => persianToEnglishDigits[digit] || digit)
}

/**
 * Check if the current locale is Persian/Farsi
 * @param locale - Current locale string
 * @returns boolean indicating if locale is Persian
 */
export const isPersianLocale = (locale: string): boolean => {
  return locale === 'fa' || locale === 'fa-IR' || locale === 'persian' || locale === 'farsi'
}

/**
 * Format number according to locale (Persian or English numerals)
 * @param value - Number or string to format
 * @param locale - Current locale
 * @returns Formatted string with appropriate numerals
 */
export const formatNumberByLocale = (value: string | number, locale: string): string => {
  if (isPersianLocale(locale)) {
    return toPersianNumerals(value)
  }
  return String(value)
}