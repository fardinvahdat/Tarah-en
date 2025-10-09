import { padStart } from 'lodash-es'
/**
* 1. Random color
* 2. Convert image to Base64
*/

export function randomColor() {
  return `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padEnd(6, '0')}`
}
/** Convert image to base64 */
export function imgTransformBase64(imgUrl: string) {
  return new Promise((resolve) => {
    window.URL = window.URL || window.webkitURL
    const xhr = new XMLHttpRequest()
    xhr.open('get', imgUrl, true)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      if (this.status === 200) {
        // Get a blob object
        const blob = this.response
        // Crucial
        const oFileReader = new FileReader()
        oFileReader.readAsDataURL(blob)
        oFileReader.onloadend = function (e) {
          // The image obtained here is already base64, which can be assigned to do corresponding processing
          if (e.target)
            resolve(e.target.result)
        }
      }
    }
    xhr.send()
  })
}


/**
* Fill in the number of digits
* @param digit number
* @param len number of digits
*/
export const fillDigit = (digit: number, len: number) => {
  return padStart('' + digit, len, '0')
}

/*** Determine the device
 */
export const isPC = () => {
  return !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|Mobile|BlackBerry|Symbian|Windows Phone)/i)
}