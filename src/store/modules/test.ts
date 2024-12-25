import type { TestPaperItem, ResultItem, ResultResponse } from "@/types/test";
import { API_URLS } from "@/config/api";

const HISTORY_STORAGE_KEY = "test_history_results";
const RECOMMENDED_TESTS_STORAGE_KEY = "recommended_tests";
const ALL_TESTS_STORAGE_KEY = "all_tests";
const RECOMMENDED_TESTS_URL = API_URLS.PRO_TEST;
const ALL_TESTS_URL = API_URLS.ALL_TEST;

// 从本地缓存加载历史记录
const loadHistoryFromStorage = (): ResultItem[] => {
  try {
    const historyStr = uni.getStorageSync(HISTORY_STORAGE_KEY);
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (e) {
    console.error("Failed to load history from storage:", e);
    return [];
  }
};

// 保存历史记录到本地缓存
const saveHistoryToStorage = (history: ResultItem[]) => {
  try {
    uni.setStorageSync(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save history to storage:", e);
  }
};

// 从本地缓存加载推荐测试
const loadRecommendedFromStorage = (): TestPaperItem[] => {
  try {
    const testsStr = uni.getStorageSync(RECOMMENDED_TESTS_STORAGE_KEY);
    return testsStr ? JSON.parse(testsStr) : [];
  } catch (e) {
    console.error("Failed to load recommended tests from storage:", e);
    return [];
  }
};

// 保存推荐测试到本地缓存
const saveRecommendedToStorage = (tests: TestPaperItem[]) => {
  try {
    uni.setStorageSync(RECOMMENDED_TESTS_STORAGE_KEY, JSON.stringify(tests));
  } catch (e) {
    console.error("Failed to save recommended tests to storage:", e);
  }
};

// 从本地缓存加载所有测试
const loadAllTestsFromStorage = (): TestPaperItem[] => {
  try {
    const testsStr = uni.getStorageSync(ALL_TESTS_STORAGE_KEY);
    return testsStr ? JSON.parse(testsStr) : [];
  } catch (e) {
    console.error("Failed to load all tests from storage:", e);
    return [];
  }
};

// 保存所有测试到本地缓存
const saveAllTestsToStorage = (tests: TestPaperItem[]) => {
  try {
    uni.setStorageSync(ALL_TESTS_STORAGE_KEY, JSON.stringify(tests));
  } catch (e) {
    console.error("Failed to save all tests to storage:", e);
  }
};

export interface TestState {
  recommendedTests: TestPaperItem[];
  testItems: TestPaperItem[];
  categoryTabs: string[];
  currentCategory: number;
  historyResults: ResultItem[];
}

export default {
  namespaced: true,
  state: (): TestState => ({
    recommendedTests: loadRecommendedFromStorage(),
    testItems: loadAllTestsFromStorage(), // 初始化时从缓存加载
    categoryTabs: ["全部", "焦虑", "抑郁", "人格"],
    currentCategory: 0,
    historyResults: loadHistoryFromStorage(),
  }),

  getters: {
    proTest: (state: TestState) => state.recommendedTests[0],
    // recommendedTests 除了 第一个 以外的测试
    gridTestItems: (state: TestState) => state.recommendedTests.slice(1),
    // allTests: (state: TestState) => state.testItems,
    // 根据currentCategory过滤测试, 全部 则返回所有测试,1 则返回type=anxiety,2 则返回type=depressed,3 则返回type=personality,使用if else表示
    filteredTests: (state: TestState) => {
      if (state.currentCategory === 0) return state.testItems;
      if (state.currentCategory === 1)
        return state.testItems.filter((item) => item.type === "anxiety");
      if (state.currentCategory === 2)
        return state.testItems.filter((item) => item.type === "depressed");
      if (state.currentCategory === 3)
        return state.testItems.filter((item) => item.type === "personality");
      return [];
    },
    historyList: (state: TestState) => state.historyResults,
  },

  mutations: {
    SET_CURRENT_CATEGORY(state: TestState, category: number) {
      state.currentCategory = category;
    },
    UPDATE_TEST_ITEM(state: TestState, test: TestPaperItem) {
      const index = state.testItems.findIndex((item) => item.id === test.id);
      if (index !== -1) {
        state.testItems[index] = test;
      }
    },
    ADD_TEST_RESULT(state: TestState, result: ResultItem) {
      state.historyResults.unshift(result);
      // 保存到本地缓存
      saveHistoryToStorage(state.historyResults);
    },
    // 添加新的 mutation 用于设置历史记录
    SET_HISTORY_RESULTS(state: TestState, history: ResultItem[]) {
      state.historyResults = history;
      saveHistoryToStorage(state.historyResults);
    },
    SET_RECOMMENDED_TESTS(state: TestState, tests: TestPaperItem[]) {
      state.recommendedTests = tests;
      saveRecommendedToStorage(tests);
    },
    SET_ALL_TESTS(state: TestState, tests: TestPaperItem[]) {
      state.testItems = tests;
      saveAllTestsToStorage(tests);
    },
  },

  actions: {
    switchCategory({ commit }: { commit: any }, category: number) {
      commit("SET_CURRENT_CATEGORY", category);
    },
    updateTestItem({ commit }: { commit: any }, test: TestPaperItem) {
      commit("UPDATE_TEST_ITEM", test);
    },
    addTestResult({ commit }: { commit: any }, result: ResultItem) {
      commit("ADD_TEST_RESULT", result);
    },
    // 添加新的 action 用于加载历史记录
    loadHistoryResults({ commit }: { commit: any }) {
      const history = loadHistoryFromStorage();
      commit("SET_HISTORY_RESULTS", history);
    },
    // 加载推荐测试
    async loadRecommendedTests({ commit }: { commit: any }) {
      try {
        const response = await uni.request({
          url: RECOMMENDED_TESTS_URL,
          method: "POST",
          header: {
            "Content-Type": "application/json",
          },
        });

        const result = response.data as ResultResponse;

        if (result.code === 200) {
          commit("SET_RECOMMENDED_TESTS", result.data);
        } else {
          uni.showToast({
            title: result.message || "获取推荐测试失败",
            icon: "none",
          });
        }
      } catch (e) {
        console.error("Failed to fetch recommended tests:", e);
        const cachedTests = loadRecommendedFromStorage();
        if (cachedTests.length > 0) {
          commit("SET_RECOMMENDED_TESTS", cachedTests);
        }
      }
    },
    // 加载所有测试
    async loadAllTests({ commit }: { commit: any }) {
      try {
        const response = await uni.request({
          url: ALL_TESTS_URL,
          method: "POST",
          header: {
            "Content-Type": "application/json",
          },
        });

        const result = response.data as ResultResponse;

        if (result.code === 200) {
          commit("SET_ALL_TESTS", result.data);
        } else {
          uni.showToast({
            title: result.message || "获取测试列表失败",
            icon: "none",
          });
        }
      } catch (e) {
        console.error("Failed to fetch all tests:", e);
        const cachedTests = loadAllTestsFromStorage();
        if (cachedTests.length > 0) {
          commit("SET_ALL_TESTS", cachedTests);
        }
      }
    },
  },
};
