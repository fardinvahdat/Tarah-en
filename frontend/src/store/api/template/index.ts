import { defineStore } from "pinia";
import { baseURL } from "@/configs/base";

export const useTemplateStore = defineStore("Template", () => {
  const handleAddTemplate = async (body: any) => {
    const token = window.localStorage.getItem("token");

    const response = await fetch(`${baseURL}/v1/templates/`, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const res = await response.json();
    return res;
  };
  const handleGetTemplates = async (params: any) => {
    const response = await fetch(`${baseURL}/v1/templates/${params}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const res = await response.json();
    return res;
  };
  const handleGetTemplate = async (id: any) => {
    const token = window.localStorage.getItem("token");
    const response = await fetch(`${baseURL}/v1/templates/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const res = await response.json();
    return res;
  };

  return {
    handleAddTemplate,
    handleGetTemplates,
    handleGetTemplate,
  };
});
