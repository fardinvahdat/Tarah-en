import { defineStore } from "pinia";
import { baseURL } from "@/configs/base";

export const useWorkspaceStore = defineStore("workspaces", () => {
  const handleAddWorkspace = async (body: any) => {
    const token = window.localStorage.getItem("token");

    const response = await fetch(`${baseURL}/v1/users/me/workspaces`, {
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
  const handleGetWorkspace = async (id: any) => {
    const token = window.localStorage.getItem("token");

    const response = await fetch(`${baseURL}/v1/users/me/workspaces/${id}`, {
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
  const handleUpdateWorkspace = async (id: any, body: any) => {
    const token = window.localStorage.getItem("token");
    const response = await fetch(`${baseURL}/v1/users/me/workspaces/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const res = await response.json();
    return res;
  };

  return { handleAddWorkspace, handleGetWorkspace, handleUpdateWorkspace };
});
