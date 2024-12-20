<template>
    <view class="container">
        <!-- 固定导航栏 -->
        <view class="nav-fixed">
            <nav-tabs :tabs="tabs" v-model:currentTab="currentTab" />
        </view>
        <!-- 可滚动的内容区域 -->
        <view class="content">
            <test-area v-if="currentTab === 0" />
            <all-tests v-if="currentTab === 1" />
            <history-tests v-if="currentTab === 2" />
        </view>
    </view>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import NavTabs from '@/components/NavTabs.vue'
import TestArea from '@/pages/test-area/index.vue'
import AllTests from '@/pages/all-tests/index.vue'
import HistoryTests from '@/pages/history-tests/index.vue'
import manifest from '@/manifest.json'
export default defineComponent({
    name: 'Index',
    components: {
        NavTabs,
        TestArea,
        AllTests,
        HistoryTests,
    },
    setup() {
        const tabs = ['热门推荐', '全部测评', '历史测评']
        const currentTab = ref(0)
        // const scrollTop = ref(0)

        // const onScroll = (e: any) => {
        //     scrollTop.value = e.detail.scrollTop
        // }
        // ! 设置导航栏标题
        uni.setNavigationBarTitle({
            title: manifest.name,
        })
        return {
            tabs,
            currentTab,
            // scrollTop,
            // onScroll,
        }
    },
})
</script>

<style lang="scss" scoped>
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
    /* 导航栏下方添加阴影 */
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.content {
    flex: 1;
    /* ! 设置内容区域的上边距，值为导航栏的高度 */
    margin-top: 100rpx; /* 根据实际导航栏高度调整 */
    height: calc(100vh - 100rpx); /* 减去导航栏高度 */
    overflow: hidden;
}
</style>
