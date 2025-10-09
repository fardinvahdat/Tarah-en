import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import "@/extension/index";
import "element-plus/dist/index.css";
import "@/assets/style/global.scss";
import "@/assets/style/font.scss";
import "@/assets/style/element-plus.scss";
import "@/assets/style/tailwindcss.scss";

import Component from "@/plugins/component";
import Directive from "@/plugins/directive";

import "virtual:svg-icons-register";
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(Component);
app.use(Directive);
app.mount("#app");