import { defineStore } from "pinia";
import { baseURL } from "@/configs/base";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isLoginDialogVisible = ref(false);
  const currentLoginStep = ref(1);

  const handleLogin = async (body: any) => {
    console.log(body);
    const response = await fetch(`${baseURL}/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    window.localStorage.setItem("token", data.access_token);
    return data;
  };
  const handleRequestOTP = async (body: any) => {
    console.log(body);
    const response = await fetch(`${baseURL}/v1/auth/request-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    currentLoginStep.value = 1;
    return data;
  };
  const getUser = async () => {
    const token = window.localStorage.getItem("token");
    try {
      const response = await fetch(`${baseURL}/v1/users/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // user.value = await response?.json();
      return user.value;
    } catch (error) {
      throw error;
    }
  };
  const getUsers = async () => {
    const token = window.localStorage.getItem("token");
    const response = await fetch(`${baseURL}/v1/users/admin`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  };

  return {
    user,
    isLoginDialogVisible,
    currentLoginStep,
    handleRequestOTP,
    handleLogin,
    getUser,
    getUsers,
  };
});
