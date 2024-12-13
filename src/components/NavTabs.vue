<template>
    <view class="nav-tabs">
        <view
            v-for="(tab, index) in tabs"
            :key="index"
            :class="['tab-item', currentTab === index ? 'active' : '']"
            @tap="switchTab(index)">
            {{ tab }}
        </view>
    </view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'NavTabs',
    props: {
        tabs: {
            type: Array as () => string[],
            required: true,
        },
        currentTab: {
            type: Number,
            required: true,
        },
    },
    emits: ['update:currentTab'],
    setup(props, { emit }) {
        const switchTab = (index: number) => {
            emit('update:currentTab', index)
        }

        return {
            switchTab,
        }
    },
})
</script>

<style lang="scss">
.nav-tabs {
    display: flex;
    padding: 20rpx 40rpx;
    background: #fff;
    border-bottom: 1rpx solid #eee;

    .tab-item {
        position: relative;
        padding: 20rpx 40rpx;
        font-size: 35rpx;
        color: #666;

        &.active {
            color: #4080ff;
            font-weight: 500;

            &::after {
                content: '';
                position: absolute;
                bottom: -20rpx;
                left: 40rpx;
                right: 40rpx;
                height: 4rpx;
                background: #4080ff;
                border-radius: 2rpx;
            }
        }
    }
}
</style>
