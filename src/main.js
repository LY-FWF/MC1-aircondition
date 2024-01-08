import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import "virtual:uno.css";

const worker = new Worker(new URL("./worker.js", import.meta.url), {
  type: "module",
});

const app = createApp(App);

app.provide("worker", worker);

app.mount("#app");
