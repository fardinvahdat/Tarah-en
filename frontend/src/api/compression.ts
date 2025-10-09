import axios from "axios";

export interface ImageCompressionRequest {
  base64_image: string;
  quality?: number;
  max_width?: number;
  max_height?: number;
}

export interface ImageCompressionResponse {
  success: boolean;
  url: string;
  filename: string;
  original_dimensions: {
    width: number;
    height: number;
  };
  compressed_dimensions: {
    width: number;
    height: number;
  };
  file_size: number;
  compression_ratio: number;
}

export const compressAndUploadImage = async (
  base64Image: string,
  options: Partial<ImageCompressionRequest> = {}
): Promise<ImageCompressionResponse> => {
  try {
    const response = await axios.post<ImageCompressionResponse>(
      "/api/v1/images/compress-image",
      {
        base64_image: base64Image,
        quality: options.quality || 80,
        max_width: options.max_width,
        max_height: options.max_height,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Image compression failed:", error);
    throw new Error(error.response?.data?.detail || "Image compression failed");
  }
};
