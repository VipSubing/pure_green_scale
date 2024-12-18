<template>
    <view class="all-tests">
        <!-- 分类标签固定在顶部 -->
        <scroll-view scroll-x class="category-tabs" :show-scrollbar="false">
            <view class="tab-list">
                <view
                    v-for="(tab, index) in categoryTabs"
                    :key="index"
                    :class="['tab-item', currentCategory === index ? 'active' : '']"
                    @tap="switchCategory(index)">
                    {{ tab }}
                </view>
            </view>
        </scroll-view>

        <!-- 测评列表可滚动区域 -->
        <scroll-view scroll-y :show-scrollbar="false" class="test-list-scroll">
            <view class="test-list">
                <view class="test-item" v-for="(test, index) in testList" :key="index">
                    <view class="test-info">
                        <view class="test-name">{{ test.name }}</view>
                        <view class="test-meta">
                            <text v-if="test.tested" class="tested-tag">已测过</text>
                            <text>{{ test.userCount }}万人测过</text>
                            <text class="divider">/</text>
                            <text>{{ test.questionCount }}题</text>
                            <text class="divider">/</text>
                            <text>约{{ test.duration }}分钟</text>
                        </view>
                    </view>
                    <button class="start-btn" @tap="startTest(test.id)">开始测评</button>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from '@/store'

export default defineComponent({
    name: 'AllTests',
    setup() {
        const store = useStore()

        const categoryTabs = computed(() => store.state.test.categoryTabs)
        const currentCategory = computed(() => store.state.test.currentCategory)
        const testList = computed(() => store.getters['test/filteredTests'])

        const switchCategory = (index: number) => {
            store.dispatch('test/switchCategory', index)
        }

        const startTest = (testId: string) => {
            uni.navigateTo({
                url: `/pages/test-intro/index?id=${testId}`,
            })
        }

        return {
            categoryTabs,
            currentCategory,
            testList,
            switchCategory,
            startTest,
        }
    },
})
</script>

<style lang="scss">
.all-tests {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f5f6fa;
}

.category-tabs {
    background: #fff;
    white-space: nowrap;
    padding: 0 20rpx;

    .tab-list {
        display: inline-flex;
        padding: 20rpx 0;
    }

    .tab-item {
        padding: 10rpx 30rpx;
        margin: 0 10rpx;
        font-size: 28rpx;
        color: #666;
        background: #f5f6fa;
        border-radius: 32rpx;

        &.active {
            color: #fff;
            background: #4080ff;
        }

        &:first-child {
            margin-left: 0;
        }
    }
}

/* 新增滚动容器样式 */
.test-list-scroll {
    flex: 1;
    height: 0; /* 关键：让scroll-view正确计算高度 */
}

.test-list {
    padding: 20rpx;
    padding-bottom: calc(0rpx + constant(safe-area-inset-bottom)); /* iOS 11.2 之前 */
    padding-bottom: calc(0rpx + env(safe-area-inset-bottom)); /* iOS 11.2 及以后 */

    .test-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 30rpx;
        margin-bottom: 20rpx;
        background: #fff;
        border-radius: 12rpx;

        .test-info {
            flex: 1;
            margin-right: 20rpx;
        }

        .test-name {
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 10rpx;
        }

        .test-meta {
            font-size: 24rpx;
            color: #999;

            .tested-tag {
                color: #666;
                margin-right: 20rpx;
            }

            .divider {
                margin: 0 10rpx;
                color: #ddd;
            }
        }

        .start-btn {
            min-width: 160rpx;
            height: 64rpx;
            line-height: 64rpx;
            font-size: 28rpx;
            color: #fff;
            background: #4080ff;
            border-radius: 32rpx;
            padding: 0 30rpx;
        }
    }
}
</style>
