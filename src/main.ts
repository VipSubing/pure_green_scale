import { createSSRApp } from "vue";
import { store, key } from "./store";
import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);
  app.use(store, key);

  // 载历史记录、推荐测试和所有测试
  store.dispatch("test/loadHistoryResults");
  store.dispatch("test/loadRecommendedTests");
  store.dispatch("test/loadAllTests");

  console.log("env ", process.env.NODE_ENV);
  return {
    app,
  };
}
