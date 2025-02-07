import { createSSRApp } from "vue";
import { store, key } from "./store";
import App from "./App.vue";
import { manifest } from "./env";

export function createApp() {
  console.log("env", manifest.env.USER_ENV);

  const app = createSSRApp(App);
  app.use(store, key);

  // 载入历史记录、推荐测试和所有测试
  store.dispatch("test/loadHistoryResults");
  store.dispatch("test/loadRecommendedTests");
  store.dispatch("test/loadAllTests");

  return {
    app,
  };
}
