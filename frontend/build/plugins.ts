import { PluginOption } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import { createHtmlPlugin } from "vite-plugin-html";
import { visualizer } from "rollup-plugin-visualizer";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import viteCompression from "vite-plugin-compression";
import vue from "@vitejs/plugin-vue";
import path from "path";

export const createVitePlugins = (): (PluginOption | PluginOption[])[] => {
  return [
    vue(),
    visualizer({ open: true }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: "gzip",
      ext: ".gz",
      //test
    }),
    AutoImport({
      imports: ["vue"],
      dts: path.resolve(__dirname, "../src/types/auto-imports.d.ts"),
      eslintrc: {
        enabled: true,
      },
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: path.resolve(__dirname, "../src/types/components.d.ts"),
    }),
    VitePWA({
      injectRegister: "auto",
      registerType: "autoUpdate",
      workbox: {
        cacheId: "editor-cache",
        runtimeCaching: [
          {
            urlPattern: /.*/i,
            handler: "NetworkFirst", //اولویت شبکه واسط
            options: {
              cacheName: "interface-cache",
            },
          },
          {
            urlPattern: /(.*?)\.(js|css|ts)/, //js/css/ts static resource cache
            handler: "CacheFirst",
            options: {
              cacheName: "js-css-cache",
            },
          },
          {
            urlPattern: /(.*?)\.(png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/, // Image Cache
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
      srcDir: "dist",
      filename: "sw.js",
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/icons/svg")], // Directory where icons are stored
      symbolId: "icon-[name]", // Symbol ID
      inject: "body-last", // Insertion location
      customDomId: "__svg__icons__dom__", // svg id
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: "Tarah",
        },
      },
    }),
  ];
};
