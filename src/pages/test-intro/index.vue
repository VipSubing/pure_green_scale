<template>
  <view class="test-intro">
    <!-- 根据pageLoading==true显示加载中,否则显示页面内容 -->
    <view v-if="share && loadStatus !== 1" class="loading-state">
      <text @click="loadStatus === 2 ? loadData() : null">{{
        loadStatus === 0
          ? "加载中..."
          : loadStatus === 2
          ? "加载失败，点击重试"
          : "加载完成"
      }}</text>
    </view>
    <!-- 主要内容区域 -->
    <scroll-view
      v-if="!share || loadStatus === 1"
      scroll-y
      :show-scrollbar="false"
      class="content-scroll"
    >
      <!-- 头部Logo和标题 -->
      <view class="header">
        <!-- <image src="/static/images/health-logo.png" mode="aspectFit" class="logo" /> -->
        <text class="test-name">{{ testInfo?.name }}</text>
      </view>

      <!-- 基于量表说明 -->
      <view class="source-info" v-if="testInfo?.source">
        <!-- <image src="/static/images/check-circle.png" mode="aspectFit" class="check-icon" /> -->
        <text>本测评基于《{{ testInfo.source }}》编制</text>
      </view>

      <!-- 测评介绍 -->
      <view class="intro-section">
        <view class="intro-title">::: 测评介绍 :::</view>

        <!-- 测评基本信息 -->
        <view class="info-grid">
          <view class="info-item">
            <text class="number">{{ testInfo?.duration }}</text>
            <text class="label">分钟</text>
            <text class="desc">简单快速</text>
          </view>
          <view class="info-item">
            <text class="number">{{ testInfo?.questionCount }}</text>
            <text class="label">题</text>
            <text class="desc">专业量表</text>
          </view>
          <view class="info-item">
            <text class="number">{{ testInfo?.userCount }}</text>
            <text class="label">人</text>
            <text class="desc">已完成测评</text>
          </view>
        </view>

        <!-- 测评说明文本 -->
        <view class="intro-content">
          <view
            v-for="(text, index) in testInfo?.description"
            :key="index"
            class="intro-paragraph"
          >
            <view class="indicator"></view>
            <text>{{ text }}</text>
          </view>
        </view>

        <!-- 隐私提示 -->
        <view class="privacy-notice">
          本测试将收集您选择/填写的信息以计算结果，点击开始测评意为您已知悉并同意进行收集。
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮区 -->
    <view class="footer">
      <button open-type="share" class="share-btn">
        <image
          src="/static/images/share.png"
          mode="aspectFit"
          class="share-icon"
        />
        分享
      </button>
      <button
        class="start-btn"
        @tap="startTest"
        :disabled="loadStatus === 0 || loadStatus === 2"
      >
        {{
          loadStatus === 0
            ? "资源加载中..."
            : loadStatus === 2
            ? "加载失败"
            : "开始测评"
        }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import type { TestPaperItem, TestItem, ResultResponse } from "@/types/test";
import { useStore } from "@/store";
import { API_URLS } from "@/config/api";
import pako from "pako";
import * as base64 from "base64-arraybuffer";

const QUESTIONS_BASE_URL = API_URLS.QUESTIONS;
const TEST_INFO_BASE_URL = API_URLS.TEST_INFO;
// 响应式状态
const testInfo = ref<TestPaperItem>();
// ! 0: 加载中 1: 加载完成 2: 加载失败
const loadStatus = ref(0);
const share = ref(false);
const id = ref("");

const store = useStore();

onLoad(async (options: any) => {
  // 使用store中的状态

  share.value = options.share === "true";
  id.value = options.id;
  if (share.value) {
    // 设置分享状态
    store.dispatch("share/setShareStatus", {
      isFromShare: true,
      testId: id.value,
    });
  }
  console.log("share :", share.value);
  console.log("id :", id.value);
  loadData();
});
async function loadData() {
  loadStatus.value = 0;
  try {
    if (share.value) {
      // 通过id获取远程测试信息
      testInfo.value = await loadTestInfo(id.value);
    } else {
      const store = useStore();
      testInfo.value = store.state.test.testItems.find(
        (item) => item.id === id.value
      );
      if (!testInfo.value) {
        throw new Error("Test not found");
      }
      testInfo.value.items = await loadResources(id.value);
    }
    loadStatus.value = 1;
  } catch (e) {
    loadStatus.value = 2;
  }
}

// 资源加载函数
async function loadResources(id: string): Promise<TestItem[]> {
  let questions = loadQuestionsFromCache(id);
  if (!questions) {
    questions = await loadRemoteQuestions(id);
    saveQuestionsToCache(id, questions);
  }
  return questions;
}
// 缓存��关函数
function loadQuestionsFromCache(id: string): TestItem[] | null {
  try {
    const key = `questions_${id}`;
    const cached = uni.getStorageSync(key);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error("Failed to load questions from cache:", e);
    return null;
  }
}

async function saveQuestionsToCache(id: string, questions: TestItem[]) {
  try {
    const key = `questions_${id}`;
    uni.setStorageSync(key, JSON.stringify(questions));
  } catch (e) {
    console.error("Failed to save questions to cache:", e);
  }
}

// API 请求函数
async function loadRemoteQuestions(id: string): Promise<TestItem[]> {
  const response = await uni.request({
    url: QUESTIONS_BASE_URL,
    method: "POST",
    header: {
      "Content-Type": "application/json",
    },
    data: { id },
  });
  console.log("response :", response);
  if (response.statusCode === 200 && response.data) {
    const result = response.data as ResultResponse;
    if (result.code === 200) {
      const arrayBuffer = base64.decode(result.data);

      const decompressed = pako.inflate(arrayBuffer);
      const jsonString: string = new TextDecoder().decode(decompressed);
      const jsonObject = JSON.parse(jsonString);
      return jsonObject as TestItem[];
    }
  }
  throw new Error("Failed to load questions");
}

async function loadTestInfo(id: string): Promise<TestPaperItem> {
  const response = await uni.request({
    url: TEST_INFO_BASE_URL + "?id=" + id,
    method: "GET",
    header: {
      "Content-Type": "application/json",
    },
  });

  if (response.statusCode === 200 && response.data) {
    const result = response.data as ResultResponse;
    if (result.code === 200) {
      return result.data as TestPaperItem;
    }
  }
  throw new Error("Failed to load test info");
}
// 开始测试
function startTest() {
  if (testInfo.value) {
    uni.navigateTo({
      url: `/pages/test/index?type=${testInfo.value.id}`,
    });
  }
}

// 分享配置直接使用生成好的图片
onShareAppMessage(() => {
  return {
    title: testInfo.value?.name || "心理测评",
    path: `/pages/test-intro/index?id=${testInfo.value?.id}&share=true`,
    // imageUrl: shareImageUrl.value,
  };
});
// 无需显式导出，setup 语法糖会自动暴露模板需要的内容
</script>

<style lang="scss">
.test-intro {
  min-height: 100vh;
  background: $uni-bg-color;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
  padding: 30rpx;
  box-sizing: border-box;
  margin-bottom: calc(100rpx + $safe-area-inset-bottom);
  // &::-webkit-scrollbar {
  //     display: none;
  // }
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .logo {
    width: 60rpx;
    height: 60rpx;
    margin-right: 20rpx;
  }

  .test-name {
    font-size: $uni-font-size-title;
    font-weight: bold;
    color: $uni-text-color;
  }
}

.source-info {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;

  .check-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 10rpx;
  }

  text {
    font-size: $uni-font-size-base;
    color: $uni-text-color-placeholder;
  }
}

.intro-section {
  .intro-title {
    text-align: center;
    font-size: $uni-font-size-lg;
    color: $uni-color-primary;
    margin: 40rpx 0;
  }
}

.info-grid {
  display: flex;
  justify-content: space-around;
  margin-bottom: 60rpx;

  .info-item {
    text-align: center;

    .number {
      font-size: $uni-font-size-title;
      font-weight: bold;
      color: $uni-text-color;
    }

    .label {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-placeholder;
      margin-left: 4rpx;
    }

    .desc {
      display: block;
      font-size: $uni-font-size-sm;
      color: $uni-text-color-grey;
      margin-top: 8rpx;
    }
  }
}

.intro-content {
  .intro-paragraph {
    display: flex;
    margin-bottom: 30rpx;

    .indicator {
      width: 8rpx;
      height: 8rpx;
      background: #4080ff;
      border-radius: 50%;
      margin: 16rpx 20rpx 0 0;
      flex-shrink: 0;
    }

    text {
      flex: 1;
      font-size: $uni-font-size-base;
      color: $uni-text-color-placeholder;
      line-height: 1.8;
    }
  }
}

.privacy-notice {
  font-size: $uni-font-size-sm;
  color: $uni-text-color-grey;
  line-height: 1.6;
  margin-top: 60rpx;
  text-align: center;
  padding: 0 30rpx;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  padding-bottom: $safe-area-inset-bottom; /* iOS 11.2 及以后 */
  background: #fff;
  border-top: 1rpx solid $uni-border-color;

  .share-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 180rpx;
    height: 88rpx;
    background: $uni-bg-color-grey;
    border-radius: $uni-border-radius-lg;
    font-size: $uni-font-size-base;
    color: $uni-text-color-placeholder;
    border: none;
    .share-icon {
      width: 36rpx;
      height: 36rpx;
      margin-right: 8rpx;
    }
  }

  .start-btn {
    position: relative;
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    background: $uni-color-primary;
    color: $uni-text-color-inverse;
    font-size: $uni-font-size-lg;
    border-radius: $uni-border-radius-lg;
    text-align: center;

    .tag {
      position: absolute;
      top: -20rpx;
      right: 20rpx;
      font-size: 20rpx;
      color: #fff;
      background: #ff6b6b;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      transform: scale(0.8);
      line-height: normal;
    }
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
