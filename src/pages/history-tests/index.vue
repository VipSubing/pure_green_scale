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
    background: #f5f6fa;
}

.history-list-scroll {
    flex: 1;
    height: 0;
}

.history-list {
    padding: 20rpx;
    padding-bottom: calc(0rpx + constant(safe-area-inset-bottom)); /* iOS 11.2 之前 */
    padding-bottom: calc(00rpx + env(safe-area-inset-bottom)); /* iOS 11.2 及以后 */

    .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx;
        margin-bottom: 20rpx;
        background: #fff;
        border-radius: 12rpx;

        .test-info {
            display: flex;
            flex-direction: column;
            gap: 10rpx;

            .test-name {
                font-size: 32rpx;
                font-weight: 500;
                color: #333;
            }

            .test-time {
                font-size: 24rpx;
                color: #999;
            }
        }

        .view-result {
            margin: 0;
            min-width: 160rpx;
            height: 64rpx;
            line-height: 64rpx;
            font-size: 28rpx;
            color: #fff;
            background: #4080ff;
            border-radius: 32rpx;
            padding: 0 30rpx;
            border: none;

            &::after {
                border: none;
            }
        }
    }
}
</style>
