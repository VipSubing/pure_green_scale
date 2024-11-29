<template>
    <view class="test-grid">
        <view
            class="test-card"
            v-for="test in testItems"
            :key="test.id"
            @tap="onTestClick(test.id)">
            <view class="new-tag" v-if="test.isNew">New</view>
            <view class="card-content">
                <view class="card-title">{{ test.name }}</view>
                <view class="card-meta">
                    <text>{{ test.questionCount }}题</text>
                    <text class="divider">/</text>
                    <text>{{ test.duration }}分钟</text>
                </view>
                <view class="user-count">{{ test.userCount }}万人测过</view>
            </view>
            <image
                :src="`/static/images/avatar-${test.type}.png`"
                mode="aspectFit"
                class="card-image" />
        </view>
    </view>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { TestPaperItem } from '@/types/test'

export default defineComponent({
    name: 'TestGrid',
    props: {
        testItems: {
            type: Array as PropType<TestPaperItem[]>,
            required: true,
        },
    },
    emits: ['test-click'],
    setup(props, { emit }) {
        const onTestClick = (testId: string) => {
            emit('test-click', testId)
        }

        return {
            onTestClick,
        }
    },
})
</script>

<style lang="scss">
.test-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;

    .test-card {
        height: 240rpx;
        background: #fff;
        border-radius: 16rpx;
        padding: 30rpx;
        position: relative;

        .card-content {
            flex: 1;
        }

        .card-title {
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 10rpx;
        }

        .card-meta {
            font-size: 24rpx;
            color: #666;

            .divider {
                margin: 0 10rpx;
                color: #ddd;
            }
        }

        .user-count {
            font-size: 24rpx;
            color: #999;
            margin-top: 10rpx;
        }

        .card-image {
            width: 120rpx;
            height: 120rpx;
            position: absolute;
            right: 30rpx;
            bottom: 30rpx;
        }

        .new-tag {
            position: absolute;
            top: 20rpx;
            right: 20rpx;
            background: #ff5252;
            color: #fff;
            font-size: 20rpx;
            padding: 4rpx 12rpx;
            border-radius: 20rpx;
        }
    }
}
</style>
