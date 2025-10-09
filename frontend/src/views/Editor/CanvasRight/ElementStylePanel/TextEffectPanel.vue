<template>
    <div class="text-effect-panel !p-0">
        <!-- Effects Grid Selection -->
        <div v-if="!visible" class="effect-grid">
            <div v-for="(effect, index) in effects" :key="index" class="effect-card"
                :class="{ 'active': handleElement?.effects[0]?.type == effect.type }"
                @click="handleChangeEffect(effect)">
                <div class="effect-image-wrapper">
                    <img class="effect-image" :src="effect.image" alt="effect thumbnail" />
                </div>
                <div class="effect-footer">
                    <p class="effect-label">{{ effect.label }}</p>
                    <el-button v-if="handleElement?.effects[0]?.type == effect.type &&
            (effect.value?.length || effect.color) && effect.type !== 'normal'"
                        class="edit-button min-w-8 min-h-8 !py-0 p-0" circle size="small" @click.stop="visible = true">
                        <Icon name="edit" />
                    </el-button>
                </div>
            </div>
        </div>

        <!-- Effect Editor -->
        <div v-else class="effect-editor !p-0">
            <header class="editor-header">
                <h3 class="editor-title">Edit</h3>
                <el-button class="back-button min-w-10" circle size="small" @click="visible = false">
                    <Icon name="arrow-left" />
                </el-button>
            </header>

            <!-- Echo effect controls -->
            <div v-if="elementEffect?.type == 'echo'" class="effect-controls">
                <div v-for="(item, index) in elementEffect.value" :key="index" class="effect-control-item"
                    :class="index !== 0 ? 'with-divider' : ''">
                    <div class="control-header">
                        <span class="layer-label">Layer {{ index + 1 }}</span>
                    </div>

                    <div class="control-grid">
                        <!-- Color control -->
                        <div class="control-field">
                            <div class="flex justify-between">
                                <label class="field-label">Color</label>
                            </div>
                            <el-popover trigger="click" @click.stop placement="bottom" :width="265">
                                <template #reference>
                                    <TextColorButton :color="item.color" class="color-button">
                                        <Icon name="font-color" />
                                    </TextColorButton>
                                </template>
                                <ColorPicker :modelValue="item.color"
                                    @update:modelValue="(color) => { item.color = color; handleChangeEffect(elementEffect) }" />
                            </el-popover>
                        </div>

                        <!-- Horizontal offset -->
                        <div class="control-field">
                            <div class="flex justify-between">
                                <label class="field-label">Horizontal distance</label>
                                <div class="slider-value">{{ item.offsetX }}</div>
                            </div>
                            <el-slider v-model="item.offsetX" class="slider" :min="1" :max="10" :step="1"
                                @change="handleChangeEffect(elementEffect)" />
                        </div>

                        <!-- Vertical offset -->
                        <div class="control-field">
                            <div class="flex justify-between">
                                <label class="field-label">Vertical distance</label>
                                <div class="slider-value">{{ item.offsetY }}</div>
                            </div>
                            <el-slider v-model="item.offsetY" class="slider" :min="1" :max="10" :step="1"
                                @change="handleChangeEffect(elementEffect)" />
                        </div>

                        <!-- Opacity -->
                        <div class="control-field">
                            <div class="flex justify-between">
                                <label class="field-label">Transparency</label>
                                <div class="slider-value">{{ Math.round(item.opacity * 100) }}%</div>
                            </div>
                            <el-slider v-model="item.opacity" class="slider" :min="0" :max="1" :step="0.1"
                                @change="handleChangeEffect(elementEffect)" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Neon effect controls -->
            <div v-if="elementEffect?.type == 'neon'" class="effect-controls">
                <div class="effect-control-item">
                    <div class="control-grid">
                        <div class="control-field">
                            <div class="flex justify-between">
                                <label class="field-label">Color</label>
                            </div>
                            <el-popover trigger="click" @click.stop placement="bottom" :width="265">
                                <template #reference>
                                    <TextColorButton :color="elementEffect.color" class="color-button">
                                        <Icon name="font-color" />
                                    </TextColorButton>
                                </template>
                                <ColorPicker :modelValue="elementEffect.color"
                                    @update:modelValue="(color) => { elementEffect.color = color; handleChangeEffect(elementEffect, color) }" />
                            </el-popover>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Glitch effect controls -->
            <div v-if="elementEffect?.type == 'glitch'" class="effect-controls">
                <div v-for="(item, index) in elementEffect.value" :key="index" class="effect-control-item"
                    :class="index !== 0 ? 'with-divider' : ''">
                    <div class="control-header">
                        <span class="layer-label">Layer {{ index + 1 }}</span>
                    </div>

                    <div class="control-grid">
                        <!-- Color control -->
                        <div class="control-field">
                            <div class="flex justify-between">
                                <label class="field-label">Color</label>
                            </div>
                            <el-popover trigger="click" @click.stop placement="bottom" :width="265">
                                <template #reference>
                                    <TextColorButton :color="item.color" class="color-button">
                                        <Icon name="font-color" />
                                    </TextColorButton>
                                </template>
                                <ColorPicker :modelValue="item.color"
                                    @update:modelValue="(color) => { item.color = color; handleChangeEffect(elementEffect) }" />
                            </el-popover>
                        </div>

                        <!-- Horizontal offset -->
                        <div class="control-field">
                            <div class="flex justify-between">
                                <label class="field-label">Horizontal distance</label>
                                <div class="slider-value">{{ item.offsetX }}</div>
                            </div>
                            <el-slider v-model="item.offsetX" class="slider" :min="-10" :max="10" :step="1"
                                @change="handleChangeEffect(elementEffect)" />
                        </div>

                        <!-- Vertical offset -->
                        <div class="control-field">
                            <div class="flex justify-between">
                                <label class="field-label">Vertical distance</label>
                                <div class="slider-value">{{ item.offsetY }}</div>
                            </div>
                            <el-slider v-model="item.offsetY" class="slider" :min="0" :max="10" :step="1"
                                @change="handleChangeEffect(elementEffect)" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Outline effect controls -->
            <div v-if="elementEffect?.type == 'outline'" class="effect-controls">
                <div v-for="(item, index) in elementEffect.value" :key="index" class="effect-control-item"
                    :class="index !== 0 ? 'with-divider' : ''">
                    <div class="control-header">
                        <span class="layer-label">Layer {{ index + 1 }}</span>
                    </div>

                    <div class="control-grid">
                        <!-- Color control -->
                        <div class="control-field">
                            <div class="flex justify-between">
                                <label class="field-label">Color</label>
                            </div>
                            <el-popover trigger="click" @click.stop placement="bottom" :width="265">
                                <template #reference>
                                    <TextColorButton :color="item.color" class="color-button">
                                        <Icon name="font-color" />
                                    </TextColorButton>
                                </template>
                                <ColorPicker :modelValue="item.color"
                                    @update:modelValue="(color) => { item.color = color; handleChangeEffect(elementEffect) }" />
                            </el-popover>
                        </div>

                        <!-- Width -->
                        <div class="control-field">
                            <div class="flex justify-between">
                                <label class="field-label">Thickness</label>
                                <div class="slider-value">{{ item.width }}</div>
                            </div>
                            <el-slider v-model="item.width" class="slider" :min="0" :max="10" :step="1"
                                @change="handleChangeEffect(elementEffect)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useMainStore, useTemplatesStore } from '@/store'
import useCanvas from '@/views/Canvas/useCanvas'
import { ref, computed } from 'vue'

const handleElement = computed(() => canvasObject.value)
const elementEffect = computed(() => handleElement.value?.effects[0])

const [canvas] = useCanvas()
const mainStore = useMainStore()
const templatesStore = useTemplatesStore()
const { canvasObject } = storeToRefs(mainStore)
const visible = ref(false)

const effects = ref([
    {
        label: 'نئون',
        color: '#4f00ed',
        type: 'neon',
        image: '/images/effects/neon.png',
    },
    {
        label: 'لایه لایه',
        type: 'echo',
        image: '/images/effects/echo.png',
        value: [
            { color: '#000', offsetX: 4, offsetY: 4, blur: 0, opacity: 0.5 },
            { color: '#000', offsetX: 2, offsetY: 2, blur: 0, opacity: 0.3 },
        ]
    },
    {
        label: 'گلیچ',
        type: 'glitch',
        image: '/images/effects/glitch.png',
        value: [
            { color: '#0ff', offsetX: -5, offsetY: 0, blur: 0 },
            { color: '#f0f', offsetX: 5, offsetY: 0, blur: 0 },
        ]
    },
    {
        label: 'حاشیه',
        type: 'outline',
        image: '/images/effects/outline.png',
        value: [
            {
                color: "#c4c4c4",
                width: 4
            },
        ]
    },
    {
        label: 'عادی',
        type: 'normal',
        image: '/images/effects/normal.png',
        value: []
    }
])

// Helper function to get display name for effect types
const getEffectDisplayName = (type) => {
    const effectMap = {
        'neon': 'افکت نئون',
        'echo': 'افکت لایه لایه',
        'glitch': 'افکت گلیچ',
        'outline': 'حاشیه',
        'normal': 'عادی'
    }

    return effectMap[type] || type
}

const handleChangeEffect = (effect, color) => {
    switch (effect.type) {
        case "neon":
            effect.color = color || "#4f00ed"
            handleElementEffect(effect)
            break;
        case "echo":
            handleElementEffect(effect)
            break;
        case "glitch":
            handleElementEffect(effect)
            break;
        case "normal":
            handleElementEffect(effect)
            break;
        case "outline":
            handleElementEffect(effect)
            break;
        default:
            break;
    }
}

const handleElementEffect = (effect) => {
    if (handleElement.value.isEditing) {
        handleElement.value.setSelectionStyles({ effects: [effect] })
    }
    else {
        templatesStore.modifedElement(handleElement.value, { effects: [effect] })
    }
    canvas.renderAll()
}
</script>

<style lang="scss" scoped>
.text-effect-panel {
    @apply p-4;
}

.effect-grid {
    @apply grid grid-cols-2 gap-3;
}

.effect-card {
    @apply relative bg-white border border-gray-200 rounded-xl cursor-pointer overflow-hidden transition-all duration-200;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &:hover {
        @apply border-primary-default;
        transform: translateY(-2px);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
    }

    &.active {
        @apply border-primary-default;
        box-shadow: 0 0 0 2px rgba(34, 49, 158, 0.2);
    }

    .effect-image-wrapper {
        @apply p-2 flex items-center justify-center h-[100px] bg-gray-50;
    }

    .effect-image {
        @apply h-[80px] w-[80px] object-contain;
    }

    .effect-footer {
        @apply flex items-center justify-between p-2 bg-white border-t border-gray-100;

        .effect-label {
            @apply text-sm font-medium text-gray-700;
        }

        .edit-button {
            @apply text-gray-500;

            &:hover {
                @apply text-primary-default bg-gray-100;
            }
        }
    }
}

.effect-editor {
    @apply bg-white rounded-xl p-4;

    .editor-header {
        @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-100;

        .editor-title {
            @apply text-base font-medium text-gray-700;
        }

        .back-button {
            @apply hover:bg-gray-100;
        }
    }

    .effect-controls {
        @apply space-y-4;

        .effect-control-item {
            @apply p-3 rounded-lg bg-gray-50 mb-3;

            &.with-divider {
                @apply pt-4 border-t border-gray-200;
            }

            .control-header {
                @apply mb-3;

                .layer-label {
                    @apply text-sm font-medium text-gray-700;
                }
            }

            .control-grid {
                @apply space-y-3;

                .control-field {
                    @apply mb-3;

                    .field-label {
                        @apply text-xs text-gray-500;
                    }

                    .slider-value {
                        @apply text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md;
                    }

                    .color-button {
                        @apply w-full border border-gray-200 rounded-xl h-10 flex items-center justify-center;
                    }
                }
            }
        }
    }
}

:deep(.el-slider .el-slider__runway) {
    @apply h-2 rounded-full bg-gray-200;
    margin: 10px 0;
}

:deep(.el-slider .el-slider__bar) {
    @apply h-2 rounded-full bg-primary-default;
}

:deep(.el-slider .el-slider__button-wrapper) {
    // @apply top-[-9px];

    .el-slider__button {
        @apply border-2 border-primary-default bg-white h-5 w-5;
    }
}
</style>
