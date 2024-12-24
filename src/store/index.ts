import type { InjectionKey } from "vue";
import * as Vuex from "vuex";
import test from "./modules/test";
import type { TestState } from "./modules/test";
import share from "./modules/share";
import type { ShareState } from "./modules/share";

export interface State {
  test: TestState;
  share: ShareState;
}

export const key: InjectionKey<Vuex.Store<State>> = Symbol();

export const store = Vuex.createStore<State>({
  modules: {
    test,
    share,
  },
});

// 定义自己的 useStore 组合式函数
export function useStore() {
  return Vuex.useStore(key);
}

export default store;
