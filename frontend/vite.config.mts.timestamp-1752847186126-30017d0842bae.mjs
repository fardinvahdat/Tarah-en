// vite.config.mts
import path2 from "path";
import autoprefixer from "file:///Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/node_modules/.pnpm/autoprefixer@10.4.21_postcss@8.5.3/node_modules/autoprefixer/lib/autoprefixer.js";
import tailwindcss from "file:///Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/node_modules/.pnpm/tailwindcss@3.4.17/node_modules/tailwindcss/lib/index.js";

// build/optimize.ts
var include = [
  "vue",
  "axios",
  "vue-router",
  "vue-i18n",
  "lodash-es",
  "element-plus",
  "element-plus/es",
  "element-plus/es/locale/lang/zh-cn",
  "element-plus/es/locale/lang/en",
  "element-plus/es/components/backtop/style/css",
  "element-plus/es/components/form/style/css",
  "element-plus/es/components/radio-group/style/css",
  "element-plus/es/components/radio/style/css",
  "element-plus/es/components/checkbox/style/css",
  "element-plus/es/components/checkbox-group/style/css",
  "element-plus/es/components/switch/style/css",
  "element-plus/es/components/time-picker/style/css",
  "element-plus/es/components/date-picker/style/css",
  "element-plus/es/components/descriptions/style/css",
  "element-plus/es/components/descriptions-item/style/css",
  "element-plus/es/components/link/style/css",
  "element-plus/es/components/tooltip/style/css",
  "element-plus/es/components/drawer/style/css",
  "element-plus/es/components/dialog/style/css",
  "element-plus/es/components/checkbox-button/style/css",
  "element-plus/es/components/option-group/style/css",
  "element-plus/es/components/radio-button/style/css",
  "element-plus/es/components/cascader/style/css",
  "element-plus/es/components/color-picker/style/css",
  "element-plus/es/components/input-number/style/css",
  "element-plus/es/components/rate/style/css",
  "element-plus/es/components/select-v2/style/css",
  "element-plus/es/components/tree-select/style/css",
  "element-plus/es/components/slider/style/css",
  "element-plus/es/components/time-select/style/css",
  "element-plus/es/components/autocomplete/style/css",
  "element-plus/es/components/image-viewer/style/css",
  "element-plus/es/components/upload/style/css",
  "element-plus/es/components/col/style/css",
  "element-plus/es/components/form-item/style/css",
  "element-plus/es/components/alert/style/css",
  "element-plus/es/components/breadcrumb/style/css",
  "element-plus/es/components/select/style/css",
  "element-plus/es/components/input/style/css",
  "element-plus/es/components/breadcrumb-item/style/css",
  "element-plus/es/components/tag/style/css",
  "element-plus/es/components/pagination/style/css",
  "element-plus/es/components/table/style/css",
  "element-plus/es/components/table-v2/style/css",
  "element-plus/es/components/table-column/style/css",
  "element-plus/es/components/card/style/css",
  "element-plus/es/components/row/style/css",
  "element-plus/es/components/button/style/css",
  "element-plus/es/components/menu/style/css",
  "element-plus/es/components/sub-menu/style/css",
  "element-plus/es/components/menu-item/style/css",
  "element-plus/es/components/option/style/css",
  "element-plus/es/components/dropdown/style/css",
  "element-plus/es/components/dropdown-menu/style/css",
  "element-plus/es/components/dropdown-item/style/css",
  "element-plus/es/components/skeleton/style/css",
  "element-plus/es/components/skeleton/style/css",
  "element-plus/es/components/backtop/style/css",
  "element-plus/es/components/menu/style/css",
  "element-plus/es/components/sub-menu/style/css",
  "element-plus/es/components/menu-item/style/css",
  "element-plus/es/components/dropdown/style/css",
  "element-plus/es/components/tree/style/css",
  "element-plus/es/components/dropdown-menu/style/css",
  "element-plus/es/components/dropdown-item/style/css",
  "element-plus/es/components/badge/style/css",
  "element-plus/es/components/breadcrumb/style/css",
  "element-plus/es/components/breadcrumb-item/style/css",
  "element-plus/es/components/image/style/css",
  "element-plus/es/components/collapse-transition/style/css",
  "element-plus/es/components/timeline/style/css",
  "element-plus/es/components/timeline-item/style/css",
  "element-plus/es/components/collapse/style/css",
  "element-plus/es/components/collapse-item/style/css",
  "element-plus/es/components/button-group/style/css",
  "element-plus/es/components/text/style/css"
];
var exclude = [];

// build/plugins.ts
import { VitePWA } from "file:///Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/node_modules/.pnpm/vite-plugin-pwa@0.15.2_vite@5.4.19_@types+node@22.15.21_less@4.3.0_sass@1.89.0_terser@5.39.2__ti3riqvdqsxo3hcjpl2fihtilm/node_modules/vite-plugin-pwa/dist/index.js";
import { createSvgIconsPlugin } from "file:///Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/node_modules/.pnpm/vite-plugin-svg-icons@2.0.1_vite@5.4.19_@types+node@22.15.21_less@4.3.0_sass@1.89.0_terser@5.39.2_/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import { createHtmlPlugin } from "file:///Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/node_modules/.pnpm/vite-plugin-html@3.2.2_vite@5.4.19_@types+node@22.15.21_less@4.3.0_sass@1.89.0_terser@5.39.2_/node_modules/vite-plugin-html/dist/index.mjs";
import { visualizer } from "file:///Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/node_modules/.pnpm/rollup-plugin-visualizer@5.14.0_rollup@2.79.2/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { ElementPlusResolver } from "file:///Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/node_modules/.pnpm/unplugin-vue-components@0.25.2_@babel+parser@7.27.2_rollup@2.79.2_vue@3.5.14_typescript@5.8.3_/node_modules/unplugin-vue-components/dist/resolvers.mjs";
import AutoImport from "file:///Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/node_modules/.pnpm/unplugin-auto-import@0.16.7_@vueuse+core@10.11.1_vue@3.5.14_typescript@5.8.3___rollup@2.79.2/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/node_modules/.pnpm/unplugin-vue-components@0.25.2_@babel+parser@7.27.2_rollup@2.79.2_vue@3.5.14_typescript@5.8.3_/node_modules/unplugin-vue-components/dist/vite.mjs";
import viteCompression from "file:///Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/node_modules/.pnpm/vite-plugin-compression@0.5.1_vite@5.4.19_@types+node@22.15.21_less@4.3.0_sass@1.89.0_terser@5.39.2_/node_modules/vite-plugin-compression/dist/index.mjs";
import vue from "file:///Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/node_modules/.pnpm/@vitejs+plugin-vue@6.0.0_vite@5.4.19_@types+node@22.15.21_less@4.3.0_sass@1.89.0_terser@5.39._dr4cjjhnregfnwkckkyssyhmoq/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/build";
var createVitePlugins = () => {
  return [
    vue(),
    visualizer({ open: true }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: "gzip",
      ext: ".gz"
      //test
    }),
    AutoImport({
      imports: ["vue"],
      dts: path.resolve(__vite_injected_original_dirname, "../src/types/auto-imports.d.ts"),
      eslintrc: {
        enabled: true
      },
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: path.resolve(__vite_injected_original_dirname, "../src/types/components.d.ts")
    }),
    VitePWA({
      injectRegister: "auto",
      registerType: "autoUpdate",
      workbox: {
        cacheId: "editor-cache",
        runtimeCaching: [
          {
            urlPattern: /.*/i,
            handler: "NetworkFirst",
            //اولویت شبکه واسط
            options: {
              cacheName: "interface-cache"
            }
          },
          {
            urlPattern: /(.*?)\.(js|css|ts)/,
            //js/css/ts static resource cache
            handler: "CacheFirst",
            options: {
              cacheName: "js-css-cache"
            }
          },
          {
            urlPattern: /(.*?)\.(png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,
            // Image Cache
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache"
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      },
      srcDir: "dist",
      filename: "sw.js"
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/icons/svg")],
      // Directory where icons are stored
      symbolId: "icon-[name]",
      // Symbol ID
      inject: "body-last",
      // Insertion location
      customDomId: "__svg__icons__dom__"
      // svg id
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: "Tarah"
        }
      }
    })
  ];
};

// vite.config.mts
import viteCompression2 from "file:///Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend/node_modules/.pnpm/vite-plugin-compression@0.5.1_vite@5.4.19_@types+node@22.15.21_less@4.3.0_sass@1.89.0_terser@5.39.2_/node_modules/vite-plugin-compression/dist/index.mjs";
var __vite_injected_original_dirname2 = "/Users/fardinvahdat/workspace/dapp-glow-up-kit/frontend";
var vite_config_default = ({ command, mode }) => {
  const isProduction = mode === "production";
  return {
    base: "/",
    // Remove entire server block in production
    plugins: [...createVitePlugins(), viteCompression2({ algorithm: "gzip" })],
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
              "not dead"
            ],
            grid: true
          })
        ]
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "src/assets/style/variable.scss";@import "src/assets/style/mixin.scss";`
        }
      }
    },
    resolve: {
      alias: { "@": path2.resolve(__vite_injected_original_dirname2, "src") },
      extensions: [".js", ".ts", ".jsx", ".tsx", ".vue", ".json"]
    },
    build: {
      target: "esnext",
      outDir: path2.resolve(__vite_injected_original_dirname2, "dist"),
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
            ui: ["element-plus"]
            // Add other heavy dependencies here
          }
        }
      }
    }
  };
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIiwgImJ1aWxkL29wdGltaXplLnRzIiwgImJ1aWxkL3BsdWdpbnMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZmFyZGludmFoZGF0L3dvcmtzcGFjZS9kYXBwLWdsb3ctdXAta2l0L2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZmFyZGludmFoZGF0L3dvcmtzcGFjZS9kYXBwLWdsb3ctdXAta2l0L2Zyb250ZW5kL3ZpdGUuY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvZmFyZGludmFoZGF0L3dvcmtzcGFjZS9kYXBwLWdsb3ctdXAta2l0L2Zyb250ZW5kL3ZpdGUuY29uZmlnLm10c1wiO2ltcG9ydCB0eXBlIHsgQ29uZmlnRW52LCBVc2VyQ29uZmlnRXhwb3J0IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gXCJhdXRvcHJlZml4ZXJcIjtcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwidGFpbHdpbmRjc3NcIjtcbmltcG9ydCB7IGluY2x1ZGUsIGV4Y2x1ZGUgfSBmcm9tIFwiLi9idWlsZC9vcHRpbWl6ZVwiO1xuaW1wb3J0IHsgY3JlYXRlVml0ZVBsdWdpbnMgfSBmcm9tIFwiLi9idWlsZC9wbHVnaW5zXCI7XG5pbXBvcnQgdml0ZUNvbXByZXNzaW9uIGZyb20gXCJ2aXRlLXBsdWdpbi1jb21wcmVzc2lvblwiO1xuXG5leHBvcnQgZGVmYXVsdCAoeyBjb21tYW5kLCBtb2RlIH06IENvbmZpZ0Vudik6IFVzZXJDb25maWdFeHBvcnQgPT4ge1xuICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBtb2RlID09PSBcInByb2R1Y3Rpb25cIjtcblxuICByZXR1cm4ge1xuICAgIGJhc2U6IFwiL1wiLFxuICAgIC8vIFJlbW92ZSBlbnRpcmUgc2VydmVyIGJsb2NrIGluIHByb2R1Y3Rpb25cbiAgICBwbHVnaW5zOiBbLi4uY3JlYXRlVml0ZVBsdWdpbnMoKSwgdml0ZUNvbXByZXNzaW9uKHsgYWxnb3JpdGhtOiBcImd6aXBcIiB9KV0sXG4gICAgb3B0aW1pemVEZXBzOiB7IGluY2x1ZGUsIGV4Y2x1ZGUgfSxcbiAgICBjc3M6IHtcbiAgICAgIHBvc3Rjc3M6IHtcbiAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgIHRhaWx3aW5kY3NzLFxuICAgICAgICAgIGF1dG9wcmVmaXhlcih7XG4gICAgICAgICAgICBvdmVycmlkZUJyb3dzZXJzbGlzdDogW1xuICAgICAgICAgICAgICBcIkFuZHJvaWQgNC4xXCIsXG4gICAgICAgICAgICAgIFwiaU9TIDcuMVwiLFxuICAgICAgICAgICAgICBcIkNocm9tZSA+IDMxXCIsXG4gICAgICAgICAgICAgIFwiZmYgPiAzMVwiLFxuICAgICAgICAgICAgICBcIj4gMSVcIixcbiAgICAgICAgICAgICAgXCJsYXN0IDIgdmVyc2lvbnNcIixcbiAgICAgICAgICAgICAgXCJub3QgZGVhZFwiLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGdyaWQ6IHRydWUsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgICBzY3NzOiB7XG4gICAgICAgICAgYWRkaXRpb25hbERhdGE6IGBAaW1wb3J0IFwic3JjL2Fzc2V0cy9zdHlsZS92YXJpYWJsZS5zY3NzXCI7QGltcG9ydCBcInNyYy9hc3NldHMvc3R5bGUvbWl4aW4uc2Nzc1wiO2AsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHsgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpIH0sXG4gICAgICBleHRlbnNpb25zOiBbXCIuanNcIiwgXCIudHNcIiwgXCIuanN4XCIsIFwiLnRzeFwiLCBcIi52dWVcIiwgXCIuanNvblwiXSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgICBvdXREaXI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiZGlzdFwiKSxcbiAgICAgIG1pbmlmeTogXCJ0ZXJzZXJcIixcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogZmFsc2UsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDIwNDgsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgdnVlOiBbXCJ2dWVcIiwgXCJ2dWUtcm91dGVyXCJdLFxuICAgICAgICAgICAgZmFicmljOiBbXCJmYWJyaWNcIl0sXG4gICAgICAgICAgICBsb2Rhc2g6IFtcImxvZGFzaC1lc1wiXSxcbiAgICAgICAgICAgIHVpOiBbXCJlbGVtZW50LXBsdXNcIl0sXG4gICAgICAgICAgICAvLyBBZGQgb3RoZXIgaGVhdnkgZGVwZW5kZW5jaWVzIGhlcmVcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xufTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2ZhcmRpbnZhaGRhdC93b3Jrc3BhY2UvZGFwcC1nbG93LXVwLWtpdC9mcm9udGVuZC9idWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2ZhcmRpbnZhaGRhdC93b3Jrc3BhY2UvZGFwcC1nbG93LXVwLWtpdC9mcm9udGVuZC9idWlsZC9vcHRpbWl6ZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvZmFyZGludmFoZGF0L3dvcmtzcGFjZS9kYXBwLWdsb3ctdXAta2l0L2Zyb250ZW5kL2J1aWxkL29wdGltaXplLnRzXCI7Y29uc3QgaW5jbHVkZSA9IFtcclxuICAndnVlJyxcclxuICAnYXhpb3MnLFxyXG4gICd2dWUtcm91dGVyJyxcclxuICAndnVlLWkxOG4nLFxyXG4gICdsb2Rhc2gtZXMnLFxyXG4gICdlbGVtZW50LXBsdXMnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvbG9jYWxlL2xhbmcvemgtY24nLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvbG9jYWxlL2xhbmcvZW4nLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9iYWNrdG9wL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2Zvcm0vc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvcmFkaW8tZ3JvdXAvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvcmFkaW8vc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvY2hlY2tib3gvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvY2hlY2tib3gtZ3JvdXAvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvc3dpdGNoL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3RpbWUtcGlja2VyL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2Rlc2NyaXB0aW9ucy9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9kZXNjcmlwdGlvbnMtaXRlbS9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9saW5rL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3Rvb2x0aXAvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvZHJhd2VyL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2RpYWxvZy9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9jaGVja2JveC1idXR0b24vc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvb3B0aW9uLWdyb3VwL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3JhZGlvLWJ1dHRvbi9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9jYXNjYWRlci9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9jb2xvci1waWNrZXIvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvaW5wdXQtbnVtYmVyL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3JhdGUvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvc2VsZWN0LXYyL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3RyZWUtc2VsZWN0L3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3NsaWRlci9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy90aW1lLXNlbGVjdC9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9hdXRvY29tcGxldGUvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvaW1hZ2Utdmlld2VyL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3VwbG9hZC9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9jb2wvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvZm9ybS1pdGVtL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2FsZXJ0L3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2JyZWFkY3J1bWIvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvc2VsZWN0L3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2lucHV0L3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2JyZWFkY3J1bWItaXRlbS9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy90YWcvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvcGFnaW5hdGlvbi9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy90YWJsZS9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy90YWJsZS12Mi9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy90YWJsZS1jb2x1bW4vc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvY2FyZC9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9yb3cvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvYnV0dG9uL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL21lbnUvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvc3ViLW1lbnUvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvbWVudS1pdGVtL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL29wdGlvbi9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9kcm9wZG93bi9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9kcm9wZG93bi1tZW51L3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2Ryb3Bkb3duLWl0ZW0vc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvc2tlbGV0b24vc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvc2tlbGV0b24vc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvYmFja3RvcC9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9tZW51L3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3N1Yi1tZW51L3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL21lbnUtaXRlbS9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9kcm9wZG93bi9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy90cmVlL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2Ryb3Bkb3duLW1lbnUvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvZHJvcGRvd24taXRlbS9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9iYWRnZS9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9icmVhZGNydW1iL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL2JyZWFkY3J1bWItaXRlbS9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9pbWFnZS9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9jb2xsYXBzZS10cmFuc2l0aW9uL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3RpbWVsaW5lL3N0eWxlL2NzcycsXHJcbiAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzL3RpbWVsaW5lLWl0ZW0vc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvY29sbGFwc2Uvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvY29sbGFwc2UtaXRlbS9zdHlsZS9jc3MnLFxyXG4gICdlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy9idXR0b24tZ3JvdXAvc3R5bGUvY3NzJyxcclxuICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvdGV4dC9zdHlsZS9jc3MnXHJcbl1cclxuXHJcbmNvbnN0IGV4Y2x1ZGUgPSBbXVxyXG5cclxuZXhwb3J0IHsgaW5jbHVkZSwgZXhjbHVkZSB9XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2ZhcmRpbnZhaGRhdC93b3Jrc3BhY2UvZGFwcC1nbG93LXVwLWtpdC9mcm9udGVuZC9idWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2ZhcmRpbnZhaGRhdC93b3Jrc3BhY2UvZGFwcC1nbG93LXVwLWtpdC9mcm9udGVuZC9idWlsZC9wbHVnaW5zLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9mYXJkaW52YWhkYXQvd29ya3NwYWNlL2RhcHAtZ2xvdy11cC1raXQvZnJvbnRlbmQvYnVpbGQvcGx1Z2lucy50c1wiO2ltcG9ydCB7IFBsdWdpbk9wdGlvbiB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XHJcbmltcG9ydCB7IGNyZWF0ZVN2Z0ljb25zUGx1Z2luIH0gZnJvbSBcInZpdGUtcGx1Z2luLXN2Zy1pY29uc1wiO1xyXG5pbXBvcnQgeyBjcmVhdGVIdG1sUGx1Z2luIH0gZnJvbSBcInZpdGUtcGx1Z2luLWh0bWxcIjtcclxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIjtcclxuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnNcIjtcclxuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSBcInVucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGVcIjtcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSBcInVucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGVcIjtcclxuaW1wb3J0IHZpdGVDb21wcmVzc2lvbiBmcm9tIFwidml0ZS1wbHVnaW4tY29tcHJlc3Npb25cIjtcclxuaW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcblxyXG5leHBvcnQgY29uc3QgY3JlYXRlVml0ZVBsdWdpbnMgPSAoKTogKFBsdWdpbk9wdGlvbiB8IFBsdWdpbk9wdGlvbltdKVtdID0+IHtcclxuICByZXR1cm4gW1xyXG4gICAgdnVlKCksXHJcbiAgICB2aXN1YWxpemVyKHsgb3BlbjogdHJ1ZSB9KSxcclxuICAgIHZpdGVDb21wcmVzc2lvbih7XHJcbiAgICAgIHZlcmJvc2U6IHRydWUsXHJcbiAgICAgIGRpc2FibGU6IGZhbHNlLFxyXG4gICAgICB0aHJlc2hvbGQ6IDEwMjQwLFxyXG4gICAgICBhbGdvcml0aG06IFwiZ3ppcFwiLFxyXG4gICAgICBleHQ6IFwiLmd6XCIsXHJcbiAgICAgIC8vdGVzdFxyXG4gICAgfSksXHJcbiAgICBBdXRvSW1wb3J0KHtcclxuICAgICAgaW1wb3J0czogW1widnVlXCJdLFxyXG4gICAgICBkdHM6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vc3JjL3R5cGVzL2F1dG8taW1wb3J0cy5kLnRzXCIpLFxyXG4gICAgICBlc2xpbnRyYzoge1xyXG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV0sXHJcbiAgICB9KSxcclxuICAgIENvbXBvbmVudHMoe1xyXG4gICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCldLFxyXG4gICAgICBkdHM6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vc3JjL3R5cGVzL2NvbXBvbmVudHMuZC50c1wiKSxcclxuICAgIH0pLFxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIGluamVjdFJlZ2lzdGVyOiBcImF1dG9cIixcclxuICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcclxuICAgICAgd29ya2JveDoge1xyXG4gICAgICAgIGNhY2hlSWQ6IFwiZWRpdG9yLWNhY2hlXCIsXHJcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiTmV0d29ya0ZpcnN0XCIsIC8vXHUwNjI3XHUwNjQ4XHUwNjQ0XHUwNjQ4XHUwNkNDXHUwNjJBIFx1MDYzNFx1MDYyOFx1MDZBOVx1MDY0NyBcdTA2NDhcdTA2MjdcdTA2MzNcdTA2MzdcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogXCJpbnRlcmZhY2UtY2FjaGVcIixcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC8oLio/KVxcLihqc3xjc3N8dHMpLywgLy9qcy9jc3MvdHMgc3RhdGljIHJlc291cmNlIGNhY2hlXHJcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiQ2FjaGVGaXJzdFwiLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiBcImpzLWNzcy1jYWNoZVwiLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogLyguKj8pXFwuKHBuZ3xqcGU/Z3xzdmd8Z2lmfGJtcHxwc2R8dGlmZnx0Z2F8ZXBzKS8sIC8vIEltYWdlIENhY2hlXHJcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiQ2FjaGVGaXJzdFwiLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiBcImltYWdlLWNhY2hlXCIsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGRldk9wdGlvbnM6IHtcclxuICAgICAgICBlbmFibGVkOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgICAgc3JjRGlyOiBcImRpc3RcIixcclxuICAgICAgZmlsZW5hbWU6IFwic3cuanNcIixcclxuICAgIH0pLFxyXG4gICAgY3JlYXRlU3ZnSWNvbnNQbHVnaW4oe1xyXG4gICAgICBpY29uRGlyczogW3BhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBcInNyYy9pY29ucy9zdmdcIildLCAvLyBEaXJlY3Rvcnkgd2hlcmUgaWNvbnMgYXJlIHN0b3JlZFxyXG4gICAgICBzeW1ib2xJZDogXCJpY29uLVtuYW1lXVwiLCAvLyBTeW1ib2wgSURcclxuICAgICAgaW5qZWN0OiBcImJvZHktbGFzdFwiLCAvLyBJbnNlcnRpb24gbG9jYXRpb25cclxuICAgICAgY3VzdG9tRG9tSWQ6IFwiX19zdmdfX2ljb25zX19kb21fX1wiLCAvLyBzdmcgaWRcclxuICAgIH0pLFxyXG4gICAgY3JlYXRlSHRtbFBsdWdpbih7XHJcbiAgICAgIG1pbmlmeTogdHJ1ZSxcclxuICAgICAgaW5qZWN0OiB7XHJcbiAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgdGl0bGU6IFwiVGFyYWhcIixcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgXTtcclxufTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLE9BQU9BLFdBQVU7QUFDakIsT0FBTyxrQkFBa0I7QUFDekIsT0FBTyxpQkFBaUI7OztBQ0gyVSxJQUFNLFVBQVU7QUFBQSxFQUNqWDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFB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QUNSLFFBQVE7QUFBQSxRQUNOLE1BQU07QUFBQSxVQUNKLE9BQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRjs7O0FGaEZBLE9BQU9DLHNCQUFxQjtBQU41QixJQUFNQyxvQ0FBbUM7QUFRekMsSUFBTyxzQkFBUSxDQUFDLEVBQUUsU0FBUyxLQUFLLE1BQW1DO0FBQ2pFLFFBQU0sZUFBZSxTQUFTO0FBRTlCLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQTtBQUFBLElBRU4sU0FBUyxDQUFDLEdBQUcsa0JBQWtCLEdBQUdDLGlCQUFnQixFQUFFLFdBQVcsT0FBTyxDQUFDLENBQUM7QUFBQSxJQUN4RSxjQUFjLEVBQUUsU0FBUyxRQUFRO0FBQUEsSUFDakMsS0FBSztBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ1AsU0FBUztBQUFBLFVBQ1A7QUFBQSxVQUNBLGFBQWE7QUFBQSxZQUNYLHNCQUFzQjtBQUFBLGNBQ3BCO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsWUFDRjtBQUFBLFlBQ0EsTUFBTTtBQUFBLFVBQ1IsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsTUFDQSxxQkFBcUI7QUFBQSxRQUNuQixNQUFNO0FBQUEsVUFDSixnQkFBZ0I7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPLEVBQUUsS0FBS0MsTUFBSyxRQUFRQyxtQ0FBVyxLQUFLLEVBQUU7QUFBQSxNQUM3QyxZQUFZLENBQUMsT0FBTyxPQUFPLFFBQVEsUUFBUSxRQUFRLE9BQU87QUFBQSxJQUM1RDtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsUUFBUUQsTUFBSyxRQUFRQyxtQ0FBVyxNQUFNO0FBQUEsTUFDdEMsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLE1BQ1gsc0JBQXNCO0FBQUEsTUFDdEIsdUJBQXVCO0FBQUEsTUFDdkIsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osS0FBSyxDQUFDLE9BQU8sWUFBWTtBQUFBLFlBQ3pCLFFBQVEsQ0FBQyxRQUFRO0FBQUEsWUFDakIsUUFBUSxDQUFDLFdBQVc7QUFBQSxZQUNwQixJQUFJLENBQUMsY0FBYztBQUFBO0FBQUEsVUFFckI7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbInBhdGgiLCAidml0ZUNvbXByZXNzaW9uIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIiwgInZpdGVDb21wcmVzc2lvbiIsICJwYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIl0KfQo=
