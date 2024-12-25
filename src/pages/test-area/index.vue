<template>
  <view class="test-area">
    <scroll-view
      class="content-scroll"
      scroll-y
      :bounces="true"
      :enable-flex="true"
      :enhanced="true"
      :show-scrollbar="false"
    >
      <view class="wrap">
        <view v-if="proTest" class="big-box">
          <!-- 头部信息 -->
          <view class="test-header">
            <text class="title">心理测评</text>
            <view class="subtitle">
              <image
                src="/static/logo.png"
                mode="aspectFit"
                class="check-icon"
              />
              <text>初见如蓝，公益免费无广告</text>
            </view>
          </view>

          <!-- 测评列表 -->
          <view class="test-list">
            <!-- 专业版测评卡片 -->
            <view class="test-card pro-card" @tap="goToTest(proTest.id)">
              <view class="card-content">
                <view class="card-title">{{ proTest.name }}</view>
                <view class="card-desc">{{ proTest.description[0] }}</view>
                <view class="card-meta">
                  <text>{{ proTest.userCount }}人测过</text>
                  <text class="divider">/</text>
                  <text>{{ proTest.questionCount }}题</text>
                  <text class="divider">/</text>
                  <text>{{ proTest.duration }}分钟</text>
                </view>
              </view>
              <view class="image-container">
                <image
                  :src="`/static/images/${
                    ['depressed', 'anxiety', 'personality'].includes(
                      proTest.type
                    )
                      ? proTest.type
                      : 'type_all'
                  }.png`"
                  mode="aspectFill"
                  class="card-image"
                />
              </view>
            </view>

            <!-- 其他测评卡片网格 -->
            <test-grid :testItems="gridTestItems" @test-click="goToTest" />
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "@/store";
import TestGrid from "@/components/TestGrid.vue";

export default defineComponent({
  name: "TestArea",
  components: {
    TestGrid,
  },
  setup() {
    const store = useStore();

    const proTest = computed(() => store.getters["test/proTest"]);
    const gridTestItems = computed(() => store.getters["test/gridTestItems"]);

    // 在 test-area/index.vue 中修改 goToTest 方法
    const goToTest = (id: string) => {
      console.log(`id : ${id}`);
      const selectedTest = store.state.test.testItems.find(
        (item) => item.id === id
      );
      if (selectedTest) {
        uni.navigateTo({
          url: `/pages/test-intro/index?id=${id}`,
        });
      }
    };

    return {
      proTest,
      gridTestItems,
      goToTest,
    };
  },
});
</script>

<style lang="scss" scoped>
.test-area {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $uni-bg-color-grey;
}

.content-scroll {
  flex: 1;
  height: 100%;
  .wrap {
    height: auto;
    padding: 30rpx;

    // 默认 padding-bottom
    // padding-bottom: 20rpx + $safe-area-inset-bottom;
  }
}
.big-box {
  padding: 30rpx;
  padding-bottom: 60rpx;
  border-radius: 20rpx;
  background: linear-gradient(180deg, #504af4 0%, #ffffff 100%);
  // background: blue;
}
.test-header {
  margin-bottom: $uni-spacing-col-lg;
  .title {
    font-size: $uni-font-size-title;
    font-weight: bold;
    color: white;
  }

  .subtitle {
    display: flex;
    align-items: center;
    margin-top: $uni-spacing-col-base;
    font-size: $uni-font-size-sm;
    color: white;

    .check-icon {
      width: 48rpx;
      height: 48rpx;
      border-radius: 10rpx;
      margin-right: 10rpx;
    }
  }
}
.test-card {
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-row-base;
  margin-bottom: $uni-spacing-col-lg;
  position: relative;
  display: flex;
  flex-direction: row;
  height: 240rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.05);

  &.pro-card {
    border: 2rpx solid rgba(0, 0, 0, 0.08);

    .card-content {
      flex: 3;
      padding-right: 20rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    }

    .card-title {
      font-size: $uni-font-size-lg;
      font-weight: 500;
      color: $uni-text-color;
      margin-bottom: 10rpx;
    }

    .card-desc {
      font-size: $uni-font-size-base;
      color: $uni-text-color-grey;
      margin-bottom: 20rpx;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.5;
    }

    .card-meta {
      font-size: $uni-font-size-sm;
      color: $uni-text-color-placeholder;

      .divider {
        margin: 0 $uni-spacing-row-base;
        color: $uni-border-color;
      }
    }

    .image-container {
      flex: 1.2;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      // background-color: blue;
      // min-width: 200rpx;
      // max-width: 200rpx;
    }

    .card-image {
      position: absolute;
      height: 200rpx;
      width: 280rpx;
      bottom: -20rpx;
      right: -60rpx;
    }
  }
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;

  .grid-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    border: 2rpx solid rgba(0, 0, 0, 0.05);
  }
}
</style>
