<template>
  <div
    v-if="false"
    class="sticky -top-2 h-14 flex items-center justify-end md:flex-row flex-row-reverse md:bg-white md:p-2 md:gap-0 gap-2 z-10"
  >
    <div
      class="flex items-center gap-2 border-[1px] md:rounded-lg rounded-xl mt-4 px-2 py-1 mb-4 md:w-[35%] w-full mx-auto bg-white"
    >
      <Icon name="search" />
      <input placeholder="Search " class="base-button" />
    </div>
    <div class="items-center gap-4 md:flex hidden">
      <el-tooltip
        class="box-item"
        effect="dark"
        v-if="user?.role"
        content="Exit"
        placement="top"
      >
        <button
          @click="handleLogOut"
          class="hover:bg-primary-b3 hover:bg-opacity-30 w-[40px] h-[40px] rounded-xl flex items-center justify-center"
        >
          <Icon name="log-out" />
        </button>
      </el-tooltip>
      <el-tooltip
        class="box-item"
        effect="dark"
        content="Announcements"
        placement="top"
      >
        <button
          class="hover:bg-primary-b3 hover:bg-opacity-50 w-[40px] h-[40px] rounded-xl flex items-center justify-center"
        >
          <Icon name="notification" />
        </button>
      </el-tooltip>
      <button
        class="hover:bg-primary-b3 hover:bg-opacity-50 p-1 rounded-xl flex items-center justify-center gap-2"
        v-if="user?.role"
      >
        <img
          :src="`/images/avatars/${user?.role}.png`"
          class="h-14 w-14 p-1"
          style="border-radius: 12px"
        />
        <div class="flex flex-col items-start">
          <p class="text-sm font-semibold text-gray-500">
            {{
              user?.role == "admin"
                ? "Manager"
                : user?.role == "designer"
                ? "Designer"
                : user?.role == "user"
                ? "Personal"
                : ""
            }}
          </p>
          <p class="text-sm font-normal">{{ user?.mobile }}</p>
        </div>
      </button>
      <Button
        class="hover:bg-primary-b3 hover:bg-opacity-50 p-1 rounded-xl flex items-center justify-center gap-2 text-sm px-10"
        v-else
        @click="isLoginDialogVisible = !isLoginDialogVisible"
      >
        ورود
      </Button>
    </div>
    <button
      class="w-10 h-10 bg-white rounded-xl md:hidden flex items-center justify-center"
      @click="isDrawerVisible = !isDrawerVisible"
    >
      <icon name="text-align" />
    </button>
    <el-drawer
      v-model="isDrawerVisible"
      direction="ltr"
      size="80%"
      :with-header="false"
      class="p-5"
    >
      <header class="flex items-center justify-between">
        <b class="text-lg font-semibold">Menu</b>
        <Icon name="notification" />
      </header>
      <el-divider />
      <main>
        <div class="flex items-center justify-between">
          <template v-if="user?.role">
            <button
              class="hover:bg-primary-b3 hover:bg-opacity-50 p-1 rounded-xl flex items-center justify-center gap-2"
            >
              <img
                :src="`/images/avatars/${user?.role}.png`"
                class="h-14 w-14 p-1"
                style="border-radius: 12px"
              />
              <div class="flex flex-col items-start">
                <p class="text-sm font-semibold text-gray-500 mb-2">
                  {{
                    user?.role == "admin"
                      ? "Manager"
                      : user?.role == "designer"
                      ? "Designer"
                      : "Personal"
                  }}
                </p>
                <p class="text-sm font-normal">{{ user?.mobile }}</p>
              </div>
            </button>
            <button @click="handleLogOut">
              <Icon name="log-out" class="ml-2" />
            </button>
          </template>
          <Button
            class="hover:bg-primary-b3 hover:bg-opacity-50 p-1 rounded-xl flex items-center justify-center gap-2 text-sm px-10w w-full"
            v-else
            @click="isLoginDialogVisible = !isLoginDialogVisible"
          >
            Log
          </Button>
          <!-- <Icon name="angle-down" /> -->
        </div>
        <ul class="mt-6 grid gap-2">
          <li
            v-for="(item, index) in menuOptions"
            :key="index"
            class="w-full h-full"
          >
            <RouterLink
              :to="item.route"
              class="w-full h-full py-2 flex items-center gap-1 text-sm px-1 rounded-xl"
              :class="
                item.route == route.path
                  ? 'text-primary-b1 bg-primary-b3 bg-opacity-30'
                  : 'text-black md:bg-opacity-15 bg-opacity-0'
              "
            >
              <Icon :name="item.icon" /> {{ item.title }}
            </RouterLink>
          </li>
        </ul>
      </main>
    </el-drawer>
  </div>
  <div></div>
</template>

<script setup>
import Icon from "@/components/Icon.vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore, useMenuStore } from "@/store";
import Button from "./Button.vue";

const { user, isLoginDialogVisible } = storeToRefs(useAuthStore());
const store = useMenuStore();
const menuOptions = store.menuOptions;
const route = useRoute();
const isDrawerVisible = ref(false);

const handleLogOut = () => {
  window.localStorage.removeItem("token");
  user.value = null;
};
</script>
