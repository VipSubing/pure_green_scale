<template>
    <view class="test-intro">
        <!-- 主要内容区域 -->
        <scroll-view scroll-y :show-scrollbar="false" class="content-scroll">
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
                        <text class="label">万人</text>
                        <text class="desc">已完成测评</text>
                    </view>
                </view>

                <!-- 测评说明文本 -->
                <view class="intro-content">
                    <view
                        v-for="(text, index) in testInfo?.description"
                        :key="index"
                        class="intro-paragraph">
                        <view class="indicator"></view>
                        <text>{{ text }}</text>
                    </view>
                </view>

                <!-- 隐私提示 -->
                <view class="privacy-notice">
                    本测试将收集您选择/填写的信息以计算结果，点击开始测评意为您已知悉并同意腾讯健康进行收集。
                </view>
            </view>
        </scroll-view>

        <!-- 底部按钮区 -->
        <view class="footer">
            <button class="share-btn" @tap="handleShare">
                <image src="/static/images/share.png" mode="aspectFit" class="share-icon" />
                分享
            </button>
            <button class="start-btn" @tap="startTest">开始测评</button>
        </view>
    </view>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { TestPaperItem } from '@/types/test'
import { useStore } from '@/store'

export default defineComponent({
    name: 'TestIntro',
    setup() {
        const store = useStore()
        const testInfo = ref<TestPaperItem>()

        onLoad((options: any) => {
            testInfo.value = store.state.test.testItems.find((item) => item.id === options.id)
        })

        const startTest = () => {
            if (testInfo.value) {
                uni.navigateTo({
                    url: `/pages/test/index?type=${testInfo.value.id}`,
                })
            }
        }

        const handleShare = () => {
            uni.showShareMenu({
                withShareTicket: true,
            })
        }

        return {
            testInfo,
            startTest,
            handleShare,
        }
    },
})
</script>

<style lang="scss">
.test-intro {
    min-height: 100vh;
    background: #fff;
    display: flex;
    flex-direction: column;
}

.content-scroll {
    flex: 1;
    padding: 30rpx;
    box-sizing: border-box;
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
        font-size: 48rpx;
        font-weight: bold;
        color: #333;
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
        font-size: 28rpx;
        color: #666;
    }
}

.intro-section {
    .intro-title {
        text-align: center;
        font-size: 32rpx;
        color: #4080ff;
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
            font-size: 48rpx;
            font-weight: bold;
            color: #333;
        }

        .label {
            font-size: 24rpx;
            color: #666;
            margin-left: 4rpx;
        }

        .desc {
            display: block;
            font-size: 24rpx;
            color: #999;
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
            font-size: 28rpx;
            color: #666;
            line-height: 1.8;
        }
    }
}

.privacy-notice {
    font-size: 24rpx;
    color: #999;
    line-height: 1.6;
    margin-top: 60rpx;
    text-align: center;
    padding: 0 30rpx;
}

.footer {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 20rpx 30rpx;
    background: #fff;
    border-top: 1rpx solid #eee;

    .share-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 180rpx;
        height: 88rpx;
        background: #f5f6fa;
        border-radius: 44rpx;
        font-size: 28rpx;
        color: #666;

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
        background: #4080ff;
        color: #fff;
        font-size: 32rpx;
        border-radius: 44rpx;
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
</style>
