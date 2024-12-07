<template>
    <view class="test-area">
        <scroll-view
            class="content-scroll"
            scroll-y
            :show-scrollbar="false"
            :style="{ height: '100%' }">
            <!-- 头部信息 -->
            <view class="test-header">
                <text class="title">心理测评</text>
                <view class="subtitle">
                    <image src="/static/logo.png" mode="aspectFit" class="check-icon" />
                    <text>纯绿色，不收费，无广告，无套路</text>
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
                            <text>{{ proTest.userCount }}万人测过</text>
                            <text class="divider">/</text>
                            <text>{{ proTest.questionCount }}题</text>
                            <text class="divider">/</text>
                            <text>{{ proTest.duration }}分钟</text>
                        </view>
                    </view>
                    <image
                        src="/static/images/avatar-pro.png"
                        mode="aspectFit"
                        class="card-image" />
                </view>

                <!-- 其他测评卡片网格 -->
                <test-grid :testItems="gridTestItems" @test-click="goToTest" />
            </view>
        </scroll-view>
    </view>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from '@/store'
import TestGrid from '@/components/TestGrid.vue'

export default defineComponent({
    name: 'TestArea',
    components: {
        TestGrid,
    },
    setup() {
        const store = useStore()

        const proTest = computed(() => store.getters['test/proTest'])
        const gridTestItems = computed(() => store.getters['test/gridTestItems'])

        // 在 test-area/index.vue 中修改 goToTest 方法
        const goToTest = (id: string) => {
            console.log(`id : ${id}`)
            const selectedTest = store.state.test.testItems.find((item) => item.id === id)
            if (selectedTest) {
                uni.navigateTo({
                    url: `/pages/test-intro/index?id=${id}`,
                })
            }
        }

        return {
            proTest,
            gridTestItems,
            goToTest,
        }
    },
})
</script>

<style lang="scss">
.test-area {
    height: 100vh;
    overflow: visible;
    display: flex;
    flex-direction: column;
}

.content-scroll {
    flex: 1;
    padding: 30rpx;
    // box-sizing: border-box;
    padding-bottom: 120rpx;
    .test-header {
        padding: 30rpx;
        background: linear-gradient(180deg, #e7e0ff 0%, #f5f6fa 100%);
        border-radius: 20rpx;
        margin-bottom: 30rpx;

        .title {
            font-size: 36rpx;
            font-weight: bold;
            color: #333;
        }

        .subtitle {
            display: flex;
            align-items: center;
            margin-top: 10rpx;
            font-size: 24rpx;
            color: #666;

            .check-icon {
                width: 48rpx;
                height: 48rpx;
                margin-right: 10rpx;
            }
        }
    }
}

.test-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    position: relative;

    &.pro-card {
        .card-content {
            flex: 1;
        }

        .card-title {
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 10rpx;
        }

        .card-desc {
            font-size: 26rpx;
            color: #999;
            margin-bottom: 20rpx;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.5;
            max-height: calc(26rpx * 1.5 * 3);
        }

        .card-meta {
            font-size: 24rpx;
            color: #666;

            .divider {
                margin: 0 10rpx;
                color: #ddd;
            }
        }

        .card-image {
            width: 160rpx;
            height: 160rpx;
            position: absolute;
            right: 30rpx;
            bottom: 30rpx;
        }
    }
}
</style>
