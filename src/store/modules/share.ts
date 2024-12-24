import type { Module } from "vuex";
import type { State } from "..";

export interface ShareState {
  isFromShare: boolean;
  sharedTestId: string;
}

const share: Module<ShareState, State> = {
  namespaced: true,

  state: {
    isFromShare: false,
    sharedTestId: "",
  },

  mutations: {
    SET_SHARE_STATUS(state, payload: { isFromShare: boolean; testId: string }) {
      state.isFromShare = payload.isFromShare;
      state.sharedTestId = payload.testId;
    },
    CLEAR_SHARE_STATUS(state) {
      state.isFromShare = false;
      state.sharedTestId = "";
    },
  },

  actions: {
    setShareStatus(
      { commit },
      payload: { isFromShare: boolean; testId: string }
    ) {
      commit("SET_SHARE_STATUS", payload);
    },
    clearShareStatus({ commit }) {
      commit("CLEAR_SHARE_STATUS");
    },
  },
};

export default share;
