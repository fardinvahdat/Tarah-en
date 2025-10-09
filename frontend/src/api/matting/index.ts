import request from '@/utils/request'
import { AxiosPromise } from 'axios'
import { UploadResult } from './types'


/**
 * Upload files
 *
 * @param image
 */
 export function uploadImage(image: File, type?: string): AxiosPromise<UploadResult> {
  const formData = new FormData()
  formData.append('image', image)
  return request({
    url: '/api/design/matting/file',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * Upload URL
 *
 * @param image
 */
export function uploadURL(image: string): AxiosPromise<UploadResult> {
  // const formData = new FormData()
  // formData.append('image', image)
  return request({
    url: '/api/matting/url',
    method: 'post',
    data: {image},
  })
}