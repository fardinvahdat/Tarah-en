<template>
    <div class="flex md:mt-4 relative">
        <div class="md:w-auto w-full md:p-0 md:bg-transparent bg-white md:z-auto z-[10]"
            :class="(poolShow && 'md:bg-white')">
            <ul class="grid md:grid-cols-1  gap-8 min-w-[60px] md:px-1 max-h-fit pb-2"
                :class="route.path !== '/studio' ? 'grid-cols-3' : 'grid-cols-5 max-h-[70px]'">
                <li v-for="(item, index) in menuOptions" :key="index" class="w-full h-fit py-1"
                    :class="item.route == route.path ? 'md:border-t-0 border-t-2 border-primary-b1' : ''">
                    <template v-if="route.path != '/studio'">
                        <router-link :to="item.route"
                            class="flex flex-col items-center md:bg-primary-b3 rounded-2xl md:py-1 hover:text-primary-b1 hover:bg-opacity-50"
                            :class="item.route == route.path ? 'text-primary-b1 md:bg-opacity-50' : 'text-primary-b2 md:bg-opacity-15 bg-opacity-0'">
                            <Icon :name="item.icon" :width="32" :height="32" />
                            <p class="text-xs" :class="item.route == route.path ? 'font-bold' : 'font-medium'">{{
                item.title
            }}
                            </p>
                        </router-link>
                    </template>
                    <template v-else>
                        <button
                            class="flex flex-col items-center gap-1 justify-center md:bg-primary-b3 rounded-2xl md:py-1 hover:text-primary-b1 hover:bg-opacity-50 w-[50px] h-[55px] cursor-pointer"
                            :class="item.name == poolType ? 'text-primary-b1 md:bg-opacity-50' : 'text-primary-b2 md:bg-opacity-15 bg-opacity-0'"
                            @click="setPoolType(item.name)">
                            <Icon :name="item.icon" />
                            <p class="text-xs" :class="item.name == poolType ? 'font-bold' : 'font-medium'">{{
                item.title
            }}
                            </p>
                        </button>
                    </template>
                </li>
            </ul>
        </div>
        <div v-if="route.path == '/studio'" class="md:relative">
            <Menu />
            <CanvasRight :type="props.type" :visible="props.visible"
                class="layout-content-right md:w-[300px] w-full bg-[#fff] border-l-2 md:flex flex-col rounded-[15px] mr-2 shadow-lg p-2 absolute transition-all delay-800 md:max-h-full max-h-[200px] overflow-y-auto z-10 hidden"
                :class="!props.visible ? 'md:left-[-400px] md:bottom-0 md:top-0 bottom-[5000px]' : 'md:left-0 md:bottom-0 md:top-0 top-[-200px] bottom-0'"
                @close="handleCloseMenu" @open="props.visible = true" />
            <div class="md:hidden">
                <el-drawer class="md:hidden" v-model="props.visible" @close="emits('update', false)" direction="btt"
                    size="40%">
                    <CanvasRight :type="props.type" :visible="props.visible" />
                </el-drawer>
            </div>
        </div>
        <template v-else>
            <div
                class="w-full h-[calc(100vh-100px)] border-l-2 border-primary-b1 border-opacity-25 px-2 md:block hidden">
                <h1 class="mb-6 text-3xl flex items-center justify-center">
                    <img class="h-20 rounded-lg" src="/logo.png" />
                </h1>
            </div>
        </template>
    </div>
</template>

<script setup>
import Icon from '@/components/Icon.vue'
import Button from '@/components/Base/Button.vue'
import Menu from "@/views/Editor/CanvasLeft/Menu/index.vue";
import CanvasRight from "@/views/Editor/CanvasRight/index.vue";


import { useRoute } from 'vue-router';
import { useMenuStore, useAuthStore, useMainStore, useRoleStore } from '@/store'
import { storeToRefs } from 'pinia'


const props = defineProps({
    visible: {
        default: false
    },
    type: {
        default: ''
    }
})
const emits = defineEmits(['update', 'close'])

const store = useMenuStore()
const { menuOptions } = storeToRefs(store)
const route = useRoute()
const mainStore = useMainStore();
const { poolType, poolShow } = storeToRefs(mainStore);
const { user } = storeToRefs(useAuthStore())
const { requestRoleChange } = useRoleStore()
const { getUser } = useAuthStore()

const setPoolType = (tab) => {
    if (poolShow.value && tab === poolType.value) {
        poolShow.value = false;
    } else {
        poolShow.value = tab !== "help" ? true : false;
    }
    mainStore.setPoolType(tab);
    emits('close')
};
const handleCloseMenu = async () => {
    emits('update', false)
}
const handleRoleChangeRequest = async () => {
    try {
        const body = { requested_role: 'designer' }
        await requestRoleChange(body)
        await getUser()
    } catch (error) {
        console.error('Login failed:', error)
    }
}
</script>