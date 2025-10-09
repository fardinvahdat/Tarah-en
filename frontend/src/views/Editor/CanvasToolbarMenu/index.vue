
<template>
    <div class="w-full flex items-center justify-center mt-1">
        <div class="bg-white/70 px-3 py-1 h-full rounded-xl flex items-center justify-center shadow-lg toolbar-container">
            <component :is="currentPanelComponent" @trigger="emits('trigger', $event)"></component>
        </div>
    </div>
</template>

<script setup>
import { useMainStore } from "@/store/modules/main";
import { storeToRefs } from "pinia";
import { RightStates } from "@/types/elements";
import { computed } from 'vue';
import StyleToolbar from "./Components/StyleToolbar.vue";
import ElemnetStyleToolbar from "./Components/ElemnetStyleToolbar.vue";
import LayerStylePanel from "./Components/LayerStylePanel.vue";
import ImageStylePanel from "./Components/ImageStylePanel.vue";
import TextboxStylePanel from "./Components/TextboxStylePanel.vue";

const mainStore = useMainStore();
const { rightState } = storeToRefs(mainStore);
const emits = defineEmits(['trigger'])

const currentPanelComponent = computed(() => {
    const panelMap = {
        [RightStates.ELEMENT_CANVAS]: StyleToolbar,
        [RightStates.ELEMENT_STYLE]: ElemnetStyleToolbar,
        [RightStates.ELEMENT_LAYER]: LayerStylePanel,
    };
    return panelMap[rightState.value];
});
</script>

<style lang="scss" scoped>
.toolbar-container {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
