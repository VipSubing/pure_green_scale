<template>
  <view class="normal-result">
    <view class="result-section">
      <view class="result-title">{{ result.level }}</view>
      <view class="score-circle">
        <text class="score">{{ result.score }}</text>
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
        {{ result.summary }}
      </view>

      <!-- 添加分割线 -->
      <view class="divider"></view>

      <!-- 免责声明 -->
      <view class="disclaimer"> 此测试结果仅供参考，不能代替医生诊断 </view>
    </view>
  </view>
</template>

<script lang="ts">
export default {
  name: "NormalResultView",
};
</script>

<script setup lang="ts">
import type { ComputeResult } from "@/types/result";

defineProps<{
  result: ComputeResult;
}>();
</script>

<style lang="scss" scoped>
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
</style>
