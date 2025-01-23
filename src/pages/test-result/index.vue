<template>
  <view class="container">
    <!-- 加载状态 -->
    <view v-if="isStatusView" class="loading-state">
      <text @click="loadStatus === 2 ? retryCompute() : null">{{
        loadStatus === 0 ? "计算结果中..." : "加载失败，点击重试"
      }}</text>
    </view>

    <!-- 可滚动内容区域 -->
    <scroll-view
      v-else
      scroll-y
      class="content-scroll"
      :bounces="true"
      :enable-flex="true"
      :enhanced="true"
      :show-scrollbar="false"
    >
      <!-- 结果内容 -->
      <view class="content">
        <!-- 头部标题 -->
        <view class="header">
          <text class="title">{{ manifest.name }} · 测评结果</text>
        </view>

        <normal-result-view
          v-if="isComputeResult(resultInfo?.result)"
          :result="resultInfo.result"
        />
        <!-- SCL90ResultView -->
        <scl90-result-view
          v-else-if="isSCL90Result(resultInfo?.result)"
          :result="resultInfo.result"
        />

        <!-- 健康小贴士 -->
        <view v-if="resultInfo?.suggest" class="tips-section">
          <view class="section-title">
            <view class="title-bar"></view>
            <text>健康小贴士</text>
          </view>
          <view class="tips-content">
            <text class="tips-subtitle">{{ resultInfo?.suggest?.title }}</text>
            <view
              v-for="(suggest, index) in resultInfo?.suggest?.suggestes"
              :key="index"
              class="tip-item"
            >
              <text class="tip-number">{{ index + 1 }}.</text>
              <text class="tip-text">{{ suggest }}</text>
            </view>
          </view>
        </view>
      </view>
      <!-- <view style="height: 50rpx"/> -->
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="footer-fixed">
      <view class="footer">
        <button class="back-btn" @tap="goBack">返回首页</button>
        <button open-type="share" class="share-btn">邀请朋友测一测</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import { useStore } from "@/store";
import * as base64 from "base64-arraybuffer";

import type { ResultItem, ResultResponse, TestPaperItem } from "@/types/test";

import type { SCL90Result, ComputeResult } from "@/types/result";

import manifest from "@/manifest.json";
import { API_URLS, ISDEV } from "@/config/api";
import pako from "pako";
import NormalResultView from "@/components/NormalResult.vue";
import Scl90ResultView from "@/components/SCL90Result.vue";

const RESULT_API = API_URLS.COMPUTE;

const store = useStore();
const resultInfo = ref<ResultItem>();
// 加载状态 0: 加载中 1: 加载完成 2: 加载失败
const loadStatus = ref(0);
const pageType = ref("test");

const isStatusView = computed(() => {
  let res = loadStatus.value !== 1 && pageType.value === "test";
  return res;
});

var paperItem: TestPaperItem;
var paperId: string;

onLoad(async (options: any) => {
  console.log("onLoad");

  const { type, id, testJson } = options;
  console.log("type", type, "id", id);
  pageType.value = type;

  if (type === "test") {
    // 解码并解析测试数据
    const decodedJson = decodeURIComponent(testJson);
    const test = JSON.parse(decodedJson);

    paperItem = test;
    paperId = id;
    uni.setNavigationBarTitle({
      title: test.name || "测试结果",
    });
    retryCompute();
  } else if (type === "history") {
    loadStatus.value = 1;
    resultInfo.value = store.state.test.historyResults.find(
      (item: ResultItem) => item.id === id
    );

    // if (ISDEV) {
    //   if (resultInfo.value && isSCL90Result(resultInfo.value.result)) {
    //     resultInfo.value.result.totalScore = 180;
    //     resultInfo.value.result.totalSymptomIndex = 2.5;
    //     resultInfo.value.result.positiveItemCount = 70;
    //     resultInfo.value.result.positiveSymptomDistressIndex = 2.5;
    //     resultInfo.value.result.factorScores.somatization = 60;
    //     resultInfo.value.result.factorScores.obsessiveCompulsive = 50;
    //     resultInfo.value.result.factorScores.interpersonalSensitivity = 30;
    //     resultInfo.value.result.factorScores.depression = 30;
    //     resultInfo.value.result.factorScores.anxiety = 10;
    //     resultInfo.value.result.factorScores.hostility = 10;
    //     resultInfo.value.result.factorScores.phobicAnxiety = 10;
    //     resultInfo.value.result.factorScores.paranoidIdeation = 10;
    //     resultInfo.value.result.factorScores.psychoticism = 10;
    //     resultInfo.value.result.factorScores.additionalItems = 10;
    //     console.log("result:", JSON.stringify(resultInfo.value));
    //   }
    // }

    uni.setNavigationBarTitle({
      title: resultInfo.value?.test.name || "测试结果",
    });
  }
});

// 从服务器获取测试结果
async function fetchTestResult(testId: string, data: string): Promise<Object> {
  const response = await uni.request({
    url: RESULT_API,
    method: "POST",
    data: {
      buffer: data,
      id: testId,
    },
    header: {
      "content-type": "application/json",
    },
  });
  console.log("response", response);
  if (response.statusCode === 200 && response.data) {
    const resultResponse = response.data as ResultResponse;
    if (resultResponse.code === 200) {
      return resultResponse.data;
    }
  }
  throw new Error("Failed to fetch test result");
}

function goBack() {
  if (store.state.share.isFromShare) {
    uni.reLaunch({
      url: "/pages/index/index",
    });
  } else {
    uni.navigateBack({
      delta: 100, // 返回的页面数，如果 delta 大于现有页面数，则返回到首页
    });
  }
}

async function retryCompute() {
  console.log("retryCompute");
  try {
    loadStatus.value = 0;
    if (paperItem.items) {
      // 获取测试结果
      const jsonStr = JSON.stringify(paperItem.items);
      const compressed = pako.gzip(jsonStr);
      // console.log("compressed", compressed);
      const base64Data = base64.encode(compressed);
      // 获取结果
      const result = await fetchTestResult(paperId, base64Data);

      // 生成结果对象
      const resultItem: ResultItem = {
        id: Date.now().toString(),
        completedDate: Date.now(),
        suggest: paperItem.suggest,
        test: {
          id: paperItem.id,
          name: paperItem.name,
          description: paperItem.description,
          userCount: paperItem.userCount,
          questionCount: paperItem.questionCount,
          duration: paperItem.duration,
          type: paperItem.type,
          source: paperItem.source,
          soloChoice: paperItem.soloChoice,
        },
        result: result,
      };
      // 保存到 store
      await store.dispatch("test/addTestResult", resultItem);
      console.log("store success");
      resultInfo.value = resultItem;

      loadStatus.value = 1;
    }
  } catch (e) {
    console.error("获取测试结果失败:", e);
    uni.showToast({
      title: "获取结果失败",
      icon: "none",
    });
    loadStatus.value = 2;
  }
}

function isSCL90Result(result: any): result is SCL90Result {
  return "factorScores" in result;
}

function isComputeResult(result: any): result is ComputeResult {
  return "score" in result;
}

onShareAppMessage(() => {
  return {
    title: resultInfo.value?.test.name || "心理测评",
    path: `/pages/test-intro/index?id=${resultInfo.value?.test.id}&share=true`,
  };
});
</script>

<style lang="scss">
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.content-scroll {
  flex: 1;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: calc(100rpx + $safe-area-inset-bottom);
  background: $uni-bg-color-grey;
}

.content {
  padding: 0 $uni-spacing-row-lg;
  padding-bottom: 50rpx;
}

.header {
  margin: $uni-spacing-row-lg 0;

  .title {
    font-size: $uni-font-size-lg;
    color: $uni-color-primary;
    font-weight: bold;
  }
}

.result-section {
  padding: 50rpx 0;
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  text-align: center;
  margin-bottom: $uni-spacing-row-lg;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: $uni-spacing-row-lg;

  .result-title {
    font-size: 50rpx;
    color: $uni-color-primary;
    font-weight: bold;
    margin-bottom: $uni-spacing-col-lg;
  }

  .score-circle {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    border: 8rpx solid $uni-color-primary;
    display: flex;
    align-items: center;
    justify-content: center;

    .score {
      font-size: 64rpx;
      color: $uni-color-primary;
      font-weight: bold;
    }

    .unit {
      font-size: $uni-font-size-sm;
      color: $uni-color-primary;
      margin-left: $uni-spacing-col-sm;
    }
  }
}

.result-content {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-row-lg;
  margin-bottom: $uni-spacing-row-lg;

  .result-desc {
    font-size: $uni-font-size-base;
    color: $uni-text-color-placeholder;
    line-height: 1.6;
    margin-bottom: $uni-spacing-row-lg;
  }

  .divider {
    height: 1rpx;
    background: $uni-border-color;
    margin: $uni-spacing-row-lg 0;
  }

  .disclaimer {
    font-size: $uni-font-size-sm;
    color: $uni-text-color-grey;
    text-align: center;
  }
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: $uni-spacing-row-lg;

  .title-bar {
    width: 6rpx;
    height: 32rpx;
    background: $uni-color-primary;
    border-radius: 3rpx;
    margin-right: $uni-spacing-row-base;
  }

  text {
    font-size: $uni-font-size-lg;
    color: $uni-text-color;
    font-weight: 500;
  }
}

.tips-section {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-row-lg;

  .tips-subtitle {
    font-size: $uni-font-size-base;
    color: $uni-text-color-placeholder;
    margin-bottom: $uni-spacing-row-lg;
    display: block;
  }

  .tip-item {
    display: flex;
    margin-bottom: $uni-spacing-row-lg;

    .tip-number {
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      font-weight: 500;
      margin-right: $uni-spacing-row-base;
      flex-shrink: 0;
    }

    .tip-text {
      font-size: $uni-font-size-base;
      color: $uni-text-color-placeholder;
      line-height: 1.6;
      flex: 1;
    }
  }
}

.footer-fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: $uni-bg-color;
  z-index: 100;
}

.footer {
  padding: $uni-spacing-col-lg $uni-spacing-row-lg;
  padding-bottom: $safe-area-inset-bottom;
  display: flex;
  background: $uni-bg-color;
  box-sizing: border-box;
  gap: 20rpx;

  .back-btn {
    flex: 1;
    font-size: $uni-font-size-base;
    text-align: center;
    margin: 0;
    padding: 0;
    border-radius: $uni-border-radius-lg;
    height: 80rpx;
    line-height: 80rpx;
    background: $uni-bg-color-grey;
    color: $uni-text-color-placeholder;
  }

  .share-btn {
    flex: 1;
    font-size: $uni-font-size-base;
    text-align: center;
    margin: 0;
    padding: 0;
    height: 80rpx;
    line-height: 80rpx;
    background: $uni-color-primary;
    color: $uni-text-color-inverse;
    border-radius: $uni-border-radius-lg;
  }
}

.loading-state {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: $uni-font-size-lg;
    color: $uni-text-color-placeholder;
  }
}
</style>
