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
                            <text>{{ test.userCount }}人测过</text>
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
    background: $uni-bg-color-grey;
}

.category-tabs {
    background: $uni-bg-color;
    white-space: nowrap;
    padding: 0 $uni-spacing-row-lg;

    .tab-list {
        display: inline-flex;
        padding: $uni-spacing-col-lg 0;
    }

    .tab-item {
        padding: $uni-spacing-col-sm $uni-spacing-row-lg;
        margin: 0 $uni-spacing-row-base;
        font-size: $uni-font-size-base;
        color: $uni-text-color-placeholder;
        background: $uni-bg-color-grey;
        border-radius: $uni-border-radius-lg;

        &.active {
            color: $uni-text-color-inverse;
            background: $uni-color-primary;
        }
    }
}

/* 新增滚动容器样式 */
.test-list-scroll {
    flex: 1;
    height: 0; /* 关键：让scroll-view正确计算高度 */
}

.test-list {
    padding: $uni-spacing-row-lg;

    .test-item {
        padding: $uni-spacing-row-lg;
        margin-bottom: $uni-spacing-col-lg;
        background: $uni-bg-color;
        border-radius: $uni-border-radius-lg;

        .test-info {
            flex: 1;
            margin-right: 20rpx;
        }

        .test-name {
            font-size: $uni-font-size-lg;
            font-weight: 500;
            color: $uni-text-color;
            margin-bottom: $uni-spacing-col-base;
        }

        .test-meta {
            font-size: $uni-font-size-sm;
            color: $uni-text-color-grey;

            .tested-tag {
                color: $uni-text-color-placeholder;
                margin-right: $uni-spacing-row-lg;
            }

            .divider {
                margin: 0 $uni-spacing-row-base;
                color: $uni-border-color;
            }
        }

        .start-btn {
            margin-top: 30rpx;
            min-width: 160rpx;
            height: 64rpx;
            line-height: 64rpx;
            font-size: $uni-font-size-base;
            color: $uni-text-color-inverse;
            background: $uni-color-primary;
            border-radius: $uni-border-radius-lg;
            padding: 0 $uni-spacing-row-lg;
        }
    }
}
</style>
