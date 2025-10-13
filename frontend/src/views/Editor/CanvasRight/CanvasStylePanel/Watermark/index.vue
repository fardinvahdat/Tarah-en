<template>
  <el-row>
    <div class="w-full">
      <div class="title">
        <b>واترمارک</b>
      </div>
      <el-row class="mt-[10px] w-full items-center">
        <el-col :span="5" class="flex items-center">نام</el-col>
        <!-- <span class="mr-10px"></span> -->
        <el-col :span="19">
          <el-input
            class="w-320"
            v-model="waterMarkState.text"
            maxlength="15"
            show-word-limit
            type="textarea"
            autosize
          />
        </el-col>
      </el-row>
      <el-row class="mt-[10px] items-center">
        <el-col :span="5" class="flex items-center">سایز</el-col>
        <el-col :span="19">
          <el-slider
            class="w-11/12"
            v-model="waterMarkState.size"
            :min="18"
            :max="48"
          ></el-slider>
        </el-col>
      </el-row>
      <el-row class="mt-[10px] items-center">
        <el-col :span="5" class="flex items-center">مکان</el-col>
        <el-col :span="19">
          <el-radio-group
            v-model="waterMarkState.position"
            class="w-full grid grid-cols-5 gap-1"
          >
            <el-radio-button value="lt">
              <!-- <IconLeftSmallUp /> -->
            </el-radio-button>
            <el-radio-button value="rt">
              <!-- <IconRightSmallUp /> -->
            </el-radio-button>
            <el-radio-button value="lb">
              <!-- <IconLeftSmallDown /> -->
            </el-radio-button>
            <el-radio-button value="rb">
              <!-- <IconRightSmallDown /> -->
            </el-radio-button>
            <el-radio-button value="full">
              <!-- <IconFullScreen /> -->
            </el-radio-button>
          </el-radio-group>
        </el-col>
      </el-row>
      <div class="mt-[10px]" v-show="waterMarkState.position === 'full'">
        <span class="mr-10px">Angle</span>
        <div>
          <el-radio-group v-model="waterMarkState.isRotate">
            <el-radio :value="0">افقی</el-radio>
            <el-radio :value="1">عمودی</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="mt-[10px] w-full">
        <el-button-group class="w-full !flex items-center gap-2">
          <el-button @click="remWaterMark" class="w-full">پاک کردن</el-button>
          <el-button @click="addWaterMark" class="w-full">اعمال</el-button>
        </el-button-group>
      </div>
    </div>
  </el-row>
</template>

<script lang="ts" setup>
import useCanvas from "@/views/Canvas/useCanvas";
import { ref, reactive } from "vue";
import { debounce } from "lodash-es";
import { WorkSpaceThumbType, WorkSpaceDrawType } from "@/configs/canvas";
import { ElementNames } from "@/types/elements";
import { Image } from "fabric";
import { nanoid } from "nanoid";
import { ElMessage } from "element-plus";

const activeNames = ref(["TextWatermark"]);

// const { fontsList, loadFont } = useFont();
// const { canvasEditor }: any = useSelect();
const waterMarkState = reactive({
  text: "",
  size: 24,
  isRotate: 0, // The component does not support boolean
  fontFamily: "Arial", // Consider custom fonts
  color: "#ccc", // Custom colors are available
  position: "lt", // lt top left lr top right lb bottom left rb bottom right full tile
});

const createCanvas = (width: number, height: number) => {
  const waterCanvas = document.createElement("canvas");
  waterCanvas.width = width;
  waterCanvas.height = height;
  waterCanvas.style.position = "fixed";
  waterCanvas.style.opacity = "0";
  waterCanvas.style.zIndex = "-1";
  return waterCanvas;
};

const drawWaterMark: Record<string, any> = {
  lt: (width: number, height: number, cb: (imgString: string) => void) => {
    let waterCanvas: HTMLCanvasElement | null = createCanvas(width, height);
    const w = waterCanvas.width || width;
    let ctx: CanvasRenderingContext2D | null = waterCanvas.getContext("2d")!;
    ctx.fillStyle = waterMarkState.color;
    ctx.font = `${waterMarkState.size}px ${waterMarkState.fontFamily}`;
    ctx.fillText(waterMarkState.text, 10, waterMarkState.size + 10, w - 20);
    cb && cb(waterCanvas.toDataURL());
    waterCanvas = null;
    ctx = null;
  },
  rt: (width: number, height: number, cb: (imgString: string) => void) => {
    let waterCanvas: HTMLCanvasElement | null = createCanvas(width, height);
    let ctx: CanvasRenderingContext2D | null = waterCanvas.getContext("2d")!;
    const w = waterCanvas.width || width;
    ctx.fillStyle = waterMarkState.color;
    ctx.font = `${waterMarkState.size}px ${waterMarkState.fontFamily}`;
    ctx.fillText(
      waterMarkState.text,
      w - ctx.measureText(waterMarkState.text).width - 20,
      waterMarkState.size + 10,
      w - 20
    );
    cb && cb(waterCanvas.toDataURL());
    waterCanvas = null;
    ctx = null;
  },
  lb: (width: number, height: number, cb: (imgString: string) => void) => {
    let waterCanvas: HTMLCanvasElement | null = createCanvas(width, height);
    let ctx: CanvasRenderingContext2D | null = waterCanvas.getContext("2d")!;
    const w = waterCanvas.width || width;
    const h = waterCanvas.height || height;
    ctx.fillStyle = waterMarkState.color;
    ctx.font = `${waterMarkState.size}px ${waterMarkState.fontFamily}`;
    ctx.fillText(waterMarkState.text, 10, h - waterMarkState.size, w - 20);
    cb && cb(waterCanvas.toDataURL());
    waterCanvas = null;
    ctx = null;
  },
  rb: (width: number, height: number, cb: (imgString: string) => void) => {
    let waterCanvas: HTMLCanvasElement | null = createCanvas(width, height);
    let ctx: CanvasRenderingContext2D | null = waterCanvas.getContext("2d")!;
    const w = waterCanvas.width || width;
    ctx.fillStyle = waterMarkState.color;
    ctx.font = `${waterMarkState.size}px ${waterMarkState.fontFamily}`;
    ctx.fillText(
      waterMarkState.text,
      w - ctx.measureText(waterMarkState.text).width - 20,
      height - waterMarkState.size,
      width - 20
    );
    cb && cb(waterCanvas.toDataURL());
    waterCanvas = null;
    ctx = null;
  },
  full: (width: number, height: number, cb: (imgString: string) => void) => {
    let waterCanvas: HTMLCanvasElement | null = createCanvas(width, height);
    let ctx: CanvasRenderingContext2D | null = waterCanvas.getContext("2d")!;
    const textW = ctx.measureText(waterMarkState.text).width + 40;
    let patternCanvas: HTMLCanvasElement | null = createCanvas(
      waterMarkState.isRotate === 0 ? textW : textW * 2, // If there is an inclination, the hypotenuse will be greater than the right angle side, and it will be doubled according to 30 degrees (simple)
      waterMarkState.isRotate === 0 ? waterMarkState.size + 20 : textW + 20
    );
    document.body.appendChild(patternCanvas);
    let ctxWater: CanvasRenderingContext2D | null =
      patternCanvas.getContext("2d")!;
    ctxWater.textAlign = "left";
    ctxWater.textBaseline = "top";
    ctxWater.font = `${waterMarkState.size}px ${waterMarkState.fontFamily}`;
    ctxWater.fillStyle = `${waterMarkState.color}`;
    if (waterMarkState.isRotate === 0) {
      ctxWater.fillText(waterMarkState.text, 10, 10);
    } else {
      ctxWater.translate(0, textW - 10);
      ctxWater.rotate((-30 * Math.PI) / 180); // Simple example: 30 degrees
      ctxWater.fillText(waterMarkState.text, 0, 0);
    }
    ctx.fillStyle = ctx.createPattern(patternCanvas, "repeat")!;
    ctx.fillRect(0, 0, width, height);
    cb && cb(waterCanvas.toDataURL());
    waterCanvas = null;
    patternCanvas = null;
    ctx = null;
    ctxWater = null;
  },
};

// Add watermark
const addWaterMark = async () => {
  if (!waterMarkState.text)
    return ElMessage({
      type: "warning",
      message: "Watermark name cannot be empty",
    });
  const [canvas] = useCanvas();
  const workspace = canvas
    ?.getObjects()
    .find((item: any) => item.id === WorkSpaceDrawType);
  const { width, height, left, top } = workspace;
  drawWaterMark[waterMarkState.position](
    width,
    height,
    async (imgString: string) => {
      canvas.overlayImage = await Image.fromURL(
        imgString,
        {},
        {
          id: nanoid(10),
          crossOrigin: "anonymous",
          left: left,
          top: top,
          angle: waterMarkState.isRotate === 1 ? 30 : 0,
        }
      ); // Clear Overlay
      canvas.renderAll();
    }
  );
};

// Clear Watermark
const remWaterMark = () => {
  const [canvas] = useCanvas();
  canvas.set({ overlayImage: null });
  canvas.renderAll();
};
</script>

<style lang="scss" scoped></style>

<style scoped>
:deep(.w-full .el-radio-button__inner) {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
<style>
.el-textarea .el-input__count {
  right: unset !important;
  left: 10px;
}
</style>
