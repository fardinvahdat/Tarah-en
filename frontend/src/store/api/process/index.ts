import { defineStore } from "pinia";
import { baseURL } from "@/configs/base";

export const useProcessStore = defineStore("process", () => {
  const handleIncreaseQuality = async (e: any) => {
    const token = window.localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    const response = await fetch(`${baseURL}/v1/images/enhance`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  return { handleIncreaseQuality };
});
