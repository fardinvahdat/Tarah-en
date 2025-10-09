import type { ConfigEnv, UserConfigExport } from "vite";
import path from "path";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { include, exclude } from "./build/optimize";
import { createVitePlugins } from "./build/plugins";
import viteCompression from "vite-plugin-compression";

export default ({ command, mode }: ConfigEnv): UserConfigExport => {
  const isProduction = mode === "production";

  return {
    base: "/",
    // Remove entire server block in production
    plugins: [...createVitePlugins(), viteCompression({ algorithm: "gzip" })],
    optimizeDeps: { include, exclude },
    css: {
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer({
            overrideBrowserslist: [
              "Android 4.1",
              "iOS 7.1",
              "Chrome > 31",
              "ff > 31",
              "> 1%",
              "last 2 versions",
              "not dead",
            ],
            grid: true,
          }),
        ],
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "src/assets/style/variable.scss";@import "src/assets/style/mixin.scss";`,
        },
      },
    },
    resolve: {
      alias: { "@": path.resolve(__dirname, "src") },
      extensions: [".js", ".ts", ".jsx", ".tsx", ".vue", ".json"],
    },
    build: {
      target: "esnext",
      outDir: path.resolve(__dirname, "dist"),
      minify: "terser",
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2048,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ["vue", "vue-router"],
            fabric: ["fabric"],
            lodash: ["lodash-es"],
            ui: ["element-plus"],
            // Add other heavy dependencies here
          },
        },
      },
    },
  };
};
