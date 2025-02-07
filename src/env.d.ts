/// <reference types="@dcloudio/types" />

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

import manifest from "@/manifest.json";

declare global {
  const MANIFEST: typeof manifest;
  interface Window {
    MANIFEST: typeof manifest;
  }
}
