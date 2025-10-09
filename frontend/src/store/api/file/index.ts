import { defineStore } from "pinia";
import { baseURL } from "@/configs/base";

export const useFileStore = defineStore("file", () => {
  const handleUploadImageWithPercentage = async (
    formData: FormData,
    onProgress: any
  ) => {
    try {
      const token = window.localStorage.getItem("token");
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && onProgress) {
            let progress = Math.round((event.loaded / event.total) * 100);
            if (progress < 0) {
              progress = 0;
            }
            onProgress(progress); // Update progress in real-time
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", `${baseURL}/v1/files/upload`, true);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (error) {
      throw error;
    }
  };

  const handleUpload = async (body: any) => {
    const token = window.localStorage.getItem("token");

    const response = await fetch(`${baseURL}/v1/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    return await response.json();
  };

  const removeBg = async (body: any) => {
    const token = window.localStorage.getItem("token");

    // If offline, queue for background sync

    const response = await fetch(`${baseURL}/v1/images/remove-background`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    return await response.json();
  };

  return {
    handleUpload,
    removeBg,
    handleUploadImageWithPercentage,
  };
});
