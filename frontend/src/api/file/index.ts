import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { UploadResult, ExportData, ExportResult } from "./types";

/**
 * Upload files
 *
 * @param file
 */
export function uploadFile(file: File, type: string) {
  // const formData = new FormData()
  // formData.append('file', file)
  // formData.append('type', type)
  // return request({
  //   url: '/api/design/parse/file',
  //   method: 'post',
  //   data: formData,
  //   headers: {
  //     'Content-Type': 'multipart/form-data',
  //   },
  // })
}

/**
 * Export file
 *
 * @param file
 */
export function exportFile(data: ExportData): AxiosPromise<ExportResult> {
  return request({
    url: "/api/design/export/file",
    method: "post",
    data,
  });
}
