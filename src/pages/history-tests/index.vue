<template>
    <view class="history-tests">
        <!-- 历史测评列表 -->
        <scroll-view
            scroll-y
            :bounces="true"
            :enable-flex="true"
            :enhanced="true"
            :show-scrollbar="false"
            class="history-list-scroll">
            <view class="history-list">
                <view v-for="result in historyList" :key="result.id" class="history-item">
                    <view class="test-info">
                        <text class="test-name">{{ result.test.name }}</text>
                        <text class="test-time">
                            测试完成时间 {{ formatDate(result.completedDate) }}
                        </text>
                    </view>
                    <button class="view-result" @tap="viewResult(result.id)">查看结果</button>
                </view>
            </view>
        </scroll-view> </view
    > 
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from '@/store'

export default defineComponent({
    name: 'HistoryTests',
    setup() {
        const store = useStore()

        // 从 store 获取历史记录列表
        const historyList = computed(() => store.getters['test/historyList'])

        const formatDate = (timestamp: number) => {
            const date = new Date(timestamp)
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
                date.getDate()
            ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
                date.getMinutes()
            ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
        }

        const viewResult = (resultId: string) => {
            uni.navigateTo({
                url: `/pages/test-result/index?type=history&id=${resultId}`,
            })
        }

        return {
            historyList,
            formatDate,
            viewResult,
        }
    },
})
</script>

<style lang="scss">
.history-tests {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: $uni-bg-color-grey;
}

.history-list-scroll {
    flex: 1;
    height: 0;
}

.history-list {
    padding: $uni-spacing-row-lg;

    .history-item {
        padding: $uni-spacing-row-lg;
        margin-bottom: $uni-spacing-col-lg;
        background: $uni-bg-color;
        border-radius: $uni-border-radius-lg;

        .test-info {
            .test-name {
                font-size: $uni-font-size-lg;
                font-weight: 500;
                color: $uni-text-color;
            }

            .test-time {
                font-size: $uni-font-size-sm;
                color: $uni-text-color-grey;
            }
        }

        .view-result {
            min-width: 160rpx;
            height: 64rpx;
            line-height: 64rpx;
            font-size: $uni-font-size-base;
            color: $uni-text-color-inverse;
            background: $uni-color-primary;
            border-radius: $uni-border-radius-lg;
            padding: 0 $uni-spacing-row-lg;
            border: none;
        }
    }
}
</style>
