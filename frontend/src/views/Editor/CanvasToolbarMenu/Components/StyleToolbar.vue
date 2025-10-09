<template>
    <ul class="flex items-center justify-center h-full gap-4">
        <!-- <li class="w-8 h-8 flex items-center justify-center p-1 rounded-md hover:bg-primary-b3 cursor-pointer hover:bg-opacity-40"
            @click="emits('trigger', 'background')">
            <el-tooltip class="box-item" effect="dark" content="پس زمینه" placement="top">
                <Icon name="toolbar-menu-background" />
            </el-tooltip>
        </li> -->
        <li class="w-8 h-8 flex items-center justify-center p-1 rounded-md hover:bg-primary-b3 cursor-pointer hover:bg-opacity-40"
            @click="emits('trigger', 'layers')">
            <el-tooltip class="box-item" effect="dark" content="Layers" placement="top">
                <Icon name="toolbar-menu-layers" />
            </el-tooltip>
        </li>
    </ul>
</template>

<script setup>
const emits = defineEmits(['trigger'])
</script>