/**
* . -- Any character
* + -- One or more, i.e. greater than or equal to 1
* ? -- If the preceding character is a single character, it means 0 or 1, i.e. yes or no
* -- If the preceding character is a continuous matching character, it means the number of matches should be as small as possible
*/

//
export const pattern1 = /[?&]name=([^&]*)(&|$)/
// Matching Tags
export const regTag = /<text.+?<\/text>/
// Matches the content within the tag
export const regContent = /(?<=>).+?(?=<)/

// Matches between two characters
// Because if match is grouped, the content of each group will be matched
export const reg1 = /a(\S*)b/
// const s = 'aasdfsdafsdfb'
// const result = s.match(reg1)
// if (result) {
//   result[1]
// }

// Matches all characters. .* does not include \n
export const regAllCharacter = /---([\s\S]*)---$/m
