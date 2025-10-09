/**
 * Image compression utility for reducing file size when over 1MB
 */

/**
 * Compresses an image if its size is over 1MB
 * @param file - The image file to compress
 * @param quality - Compression quality (0.1 to 1.0)
 * @returns Promise<string> - Base64 data URL of the compressed image
 */
export const compressImageIfNeeded = async (
  file: File,
  quality: number = 0.7
): Promise<string> => {
  const fileSizeInMB = file.size / (1024 * 1024);

  // If file is less than 3MB, return original as base64
  if (fileSizeInMB <= 1) {
    return toBase64(file);
  }

  // Compress the image
  return compressImage(file, quality);
};

/**
 * Compresses a base64 image if its estimated size is over 1MB
 * @param base64 - Base64 data URL
 * @param quality - Compression quality (0.1 to 1.0)
 * @returns Promise<string> - Compressed base64 data URL
 */
export const compressBase64IfNeeded = async (
  base64: string,
  quality: number = 0.7
): Promise<string> => {
  // Estimate file size from base64 (roughly 75% of base64 length)
  const estimatedSizeInBytes = base64.length * 0.75;
  const estimatedSizeInMB = estimatedSizeInBytes / (1024 * 1024);

  // If estimated size is less than 1MB, return original
  if (estimatedSizeInMB <= 1) {
    return base64;
  }

  // Convert base64 to file and compress
  const file = base64ToFile(base64, "image.jpg");
  return compressImage(file, quality);
};

/**
 * Compresses an image file
 * @param file - The image file to compress
 * @param quality - Compression quality (0.1 to 1.0)
 * @returns Promise<string> - Base64 data URL of the compressed image
 */
const compressImage = (file: File, quality: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions to image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx?.drawImage(img, 0, 0);

      // Get compressed base64
      const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedBase64);
    };

    img.onerror = reject;

    // Convert file to data URL for image loading
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a file to base64
 * @param file - The file to convert
 * @returns Promise<string> - Base64 data URL
 */
const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

/**
 * Converts base64 to File object
 * @param base64 - Base64 data URL
 * @param filename - Filename for the file
 * @returns File object
 */
const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};
