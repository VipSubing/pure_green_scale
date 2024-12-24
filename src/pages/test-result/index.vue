<template>
  <view class="container">
    <!-- 可滚动内容区域 -->
    <scroll-view
      scroll-y
      class="content-scroll"
      :bounces="true"
      :enable-flex="true"
      :enhanced="true"
      :show-scrollbar="false"
    >
      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading-state">
        <text>计算结果中...</text>
      </view>

      <!-- 结果内容 -->
      <view v-else class="content">
        <!-- 头部标题 -->
        <view class="header">
          <text class="title">{{ manifest.name }} · 测评结果</text>
        </view>

        <!-- 结果区域 -->
        <view class="result-section">
          <view class="result-title">{{ resultInfo?.scoreText }}</view>
          <view class="score-circle">
            <text class="score">{{ resultInfo?.score }}</text>
            <text class="unit">分</text>
          </view>
        </view>

        <!-- 结果概述 -->
        <view class="result-content">
          <view class="section-title">
            <view class="title-bar"></view>
            <view>测评结果概述</view>
          </view>

          <view class="result-desc">
            {{ resultInfo?.introTexts }}
          </view>

          <!-- 添加分割线 -->
          <view class="divider"></view>

          <!-- 免责声明 -->
          <view class="disclaimer"> 此测试结果仅供参考，不能代替医生诊断 </view>
        </view>

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
import { ref } from "vue";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import { useStore } from "@/store";
import type { ResultItem, ComputeResult, ResultResponse } from "@/types/test";
import manifest from "@/manifest.json";

const RESULT_API = "https://subing.site/scale/api/compute";

const store = useStore();
const resultInfo = ref<ResultItem>();
const isLoading = ref(false);

// 从服务器获取测试结果
async function fetchTestResult(
  testId: string,
  items: any[]
): Promise<ComputeResult> {
  const response = await uni.request({
    url: RESULT_API,
    method: "POST",
    data: {
      items,
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
      // 如果返回的是字符串，需要解析
      const resultData =
        typeof resultResponse.data === "string"
          ? JSON.parse(resultResponse.data)
          : resultResponse.data;

      return resultData as ComputeResult;
    }
  }
  throw new Error("Failed to fetch test result");
}
onLoad(async (options: any) => {
  const { type, id, testJson } = options;
  console.log("type", type, "id", id);
  if (type === "test") {
    try {
      if (testJson) {
        // 解码并解析测试数据
        const decodedJson = decodeURIComponent(testJson);
        const test = JSON.parse(decodedJson);
        uni.setNavigationBarTitle({
          title: test.name || "测试结果",
        });
        // 获取测试结果
        const result = await fetchTestResult(id, test.items);
        console.log("result", result);

        // 生成结果对象
        const resultItem: ResultItem = {
          id: Date.now().toString(),
          test: {
            id: test.id,
            name: test.name,
            description: test.description,
            userCount: test.userCount,
            questionCount: test.questionCount,
            duration: test.duration,
            type: test.type,
            source: test.source,
            soloChoice: test.soloChoice,
          },
          introTexts: result.summary,
          completedDate: Date.now(),
          score: result.score,
          scoreText: result.level,
          suggest: test.suggest,
        };

        // 保存到 store
        store.dispatch("test/addTestResult", resultItem);
        resultInfo.value = resultItem;
      }
    } catch (e) {
      console.error("获取测试结果失败:", e);
      uni.showToast({
        title: "获取结果失败",
        icon: "none",
      });
    } finally {
      isLoading.value = false;
    }
  } else if (type === "history") {
    resultInfo.value = store.state.test.historyResults.find(
      (item: ResultItem) => item.id === id
    );
    uni.setNavigationBarTitle({
      title: resultInfo.value?.test.name || "测试结果",
    });
  }
});

function goBack() {
  uni.navigateBack({
    delta: 100, // 返回的页面数，如果 delta 大于现有页面数，则返回到首页
  });
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
