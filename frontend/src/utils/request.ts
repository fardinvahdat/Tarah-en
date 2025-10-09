import axios, { AxiosResponse } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { localStorage } from '@/utils/storage';
import { useUserStore } from '@/store';
import { storeToRefs } from 'pinia';

// Creating an axios instance
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 500000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
});

// Request Interceptor
service.interceptors.request.use(
  (config: any) => {
    if (!config.headers) {
      throw new Error(
        `Expected 'config' and 'config.headers' not to be undefined`
      );
    }
    const { loginStatus } = storeToRefs(useUserStore())
    if (loginStatus && localStorage.get('access_token')) {
      config.headers.Authorization = `Bearer ${localStorage.get('access_token')}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response Interceptors
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg } = response.data;
    if (code === 200) {
      return response;
    }
    else if (code === 401) {
      localStorage.remove('access_token')
      return response;
    }
    else {
      // Response data is processed as binary stream (Excel export)
      if (response.data instanceof ArrayBuffer) {
        return response;
      }
      if (response.data instanceof Array) {
        return response;
      }

      ElMessage({
        message: msg || 'System Error',
        type: 'error',
      });
      return Promise.reject(new Error(msg || 'Error'));
    }
  },
  (error: any) => {
    if (error.response.data) {
      const { detail } = error.response.data;
      console.log('code:', error.response.data)
      // Token expired, please log in again
      if (detail === 'Signature has expired.') {
        ElMessageBox.confirm('Current page is invalid, please log in again', 'Warning', {
          confirmButtonText: 'OK',
          type: 'warning',
        }).then(() => {
          localStorage.clear();
          // Use router navigation instead of direct window.location to prevent reload
          const router = window.app?.config?.globalProperties?.$router
          if (router) {
            router.push('/')
          } else {
            window.location.href = '/';
          }
        });
      } else {
        ElMessage({
          message: detail || 'System Error',
          type: 'error',
        });
      }
    }
    return Promise.reject(error.message);
  }
);

// Exporting an axios instance
export default service;
