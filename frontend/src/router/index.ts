import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useMenuStore, useAuthStore } from "@/store";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import Studio from "@/views/Editor/index.vue";

type RouteRecordRaw = typeof RouteRecordRaw;

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Root",
    component: () => import("@/views/Home/index.vue"),
    meta: {
      title: "Designer",
    },
  },
  {
    path: "/home",
    name : "Home",
    component: () => import("@/views/Home/index.vue"),
    meta: {
      title: "Home",
    },
  },
  {
    path: "/projects",
    name: "Projects",
    component: () => import("@/views/Projects/index.vue"),
    meta: {
      title: "Projects",
    },
  },
  {
    path: "/templates",
    name: "Templates",
    component: () => import("@/views/Templates/index.vue"),
    meta: {
      title: "Molds",
    },
  },
  {
    path: "/apps",
    name: "Apps",
    component: () => import("@/views/Apps/index.vue"),
    meta: {
      title: "Apps",
    },
  },
  {
    path: "/studio",
    name: "Studio",
    component: Studio,
    meta: {
      title: "Studio",
    },
  },
  {
    path: "/github",
    component: () => import("@/views/OAuth/github.vue"),
    meta: {
      title: "editor-github",
    },
  },
  {
    path: "/401",
    component: () => import("@/views/Error/401.vue"),
    meta: { hidden: true },
  },
  {
    path: "/404",
    component: () => import("@/views/Error/404.vue"),
    meta: { hidden: true },
  },
];

/**
 * Creating Routes
 */
const router = createRouter({
  history: createWebHistory("/"),
  routes: constantRoutes,
  // When refreshing, the scroll bar position is restored
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

router.beforeResolve((to: any, from: any, next: any) => {
  const { user, isLoginDialogVisible } = storeToRefs(useAuthStore());
  const store = useMenuStore();
  if (to.path.includes("/studio")) {
    // setTimeout(() => {
    //   if (user.value?.role) {
    //   } else {
    //     store.updateMenu(true);
    //     ElMessage({
    //       type: "error",
    //       message: "لطفا ابتدا وارد شوید  ",
    //     });
    //     isLoginDialogVisible.value = true;
    //     router.push("/home");
    //     return;
    //   }
    // }, 1500);
  } else {
    store.updateMenu(false);
  }
  window.document.title = to.meta.title;
  next();
});

/**
 * Reset Router
 */
export const resetRouter = () => {
  router.replace({ path: "/" });
};

export default router;
