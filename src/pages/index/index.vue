<template>
  <view class="container">
    <!-- 固定导航栏 -->
    <view class="nav-fixed">
      <nav-tabs :tabs="tabs" v-model:currentTab="currentTab" />
    </view>
    <!-- 可滚动的内容区域 -->
    <swiper
      class="swiper-content"
      :current="currentTab"
      @change="onSwiperChange"
      :duration="300"
    >
      <swiper-item>
        <test-area />
      </swiper-item>
      <swiper-item>
        <all-tests />
      </swiper-item>
      <swiper-item>
        <history-tests />
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow, onReady, onShareAppMessage } from "@dcloudio/uni-app";
import { useStore } from "@/store";
import TestArea from "@/pages/test-area/index.vue";
import AllTests from "@/pages/all-tests/index.vue";
import HistoryTests from "@/pages/history-tests/index.vue";
import manifest from "@/manifest.json";
// 引入组件

const store = useStore();

onShow(() => {
  console.log("index page onShow");
});
onReady(() => {
  console.log("index page onReady");
  store.dispatch("share/clearShareStatus");
});

// 分享配置直接使用生成好的图片
onShareAppMessage(() => {
  return {
    title: manifest.name,
    path: `/pages/index/index`,
    // imageUrl: shareImageUrl.value,
  };
});

const tabs = ["热门推荐", "全部测评", "历史测评"];
const currentTab = ref(0);

// 处理滑动切换
const onSwiperChange = (e: any) => {
  currentTab.value = e.detail.current;
};
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f6fa;
}

.nav-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  height: 100rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.swiper-content {
  flex: 1;
  margin-top: 100rpx;
  height: calc(100vh - 100rpx);
  overflow: hidden;
}
</style>
