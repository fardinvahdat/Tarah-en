import { defineStore } from "pinia";
import { baseURL } from "@/configs/base";

export const useRoleStore = defineStore("role", () => {
  const requestRoleChange = async (body: any) => {
    const token = window.localStorage.getItem("token");
    const response = await fetch(`${baseURL}/v1/users/request-role-change`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data;
  };
  const getRoleChangeRequests = async () => {
    const token = window.localStorage.getItem("token");
    const response = await fetch(`${baseURL}/v1/users/role-change-requests`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data;
  };
  const handleChangeRole = async (body: any) => {
    const token = window.localStorage.getItem("token");
    const response = await fetch(
      `${baseURL}/v1/users/approve-role-change/${body.request_id}?action=${body.action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data;
  };

  return {
    requestRoleChange,
    getRoleChangeRequests,
    handleChangeRole,
  };
});
