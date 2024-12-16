<template>
    <view class="container">
        <!-- 固定导航栏 -->
        <view class="nav-fixed">
            <uni-nav-bar
                :fixed="true"
                status-bar
                :leftIcon="page_type === 'test' ? '' : 'left'"
                :border="false"
                :title="page_title"
                @clickLeft="goBack" />
        </view>

        <!-- 可滚动内容区域 -->
        <scroll-view
            scroll-y
            class="content-scroll"
            :bounces="true"
            :enable-flex="true"
            :enhanced="true"
            :show-scrollbar="false"
            :style="{ height: 'calc(100vh - 44px - var(--status-bar-height) - 128rpx)' }">
            <!-- 加载状态 -->
            <view v-if="isLoading" class="loading-state">
                <text>计算结果中...</text>
            </view>

            <!-- 结果内容 -->
            <view v-else class="content">
                <!-- 头部标题 -->
                <view class="header">
                    <text class="title">{{ manifest.name }} · 测评结果</text>
                </view>

                <!-- 结果区域 -->
                <view class="result-section">
                    <view class="result-title">{{ resultInfo?.scoreText }}</view>
                    <view class="score-circle">
                        <text class="score">{{ resultInfo?.score }}</text>
                        <text class="unit">分</text>
                    </view>
                </view>

                <!-- 结果概述 -->
                <view class="result-content">
                    <view class="section-title">
                        <view class="title-bar"></view>
                        <view>测评结果概述</view>
                    </view>

                    <view class="result-desc">
                        {{ resultInfo?.introTexts }}
                    </view>

                    <!-- 添加分割线 -->
                    <view class="divider"></view>

                    <!-- 免责声明 -->
                    <view class="disclaimer"> 此测试结果仅供参考，不能代替医生诊断 </view>
                </view>

                <!-- 健康小贴士 -->
                <view v-if="resultInfo?.suggest" class="tips-section">
                    <view class="section-title">
                        <view class="title-bar"></view>
                        <text>健康小贴士</text>
                    </view>
                    <view class="tips-content">
                        <text class="tips-subtitle">{{ resultInfo?.suggest?.title }}</text>
                        <view
                            v-for="(suggest, index) in resultInfo?.suggest?.suggestes"
                            :key="index"
                            class="tip-item">
                            <text class="tip-number">{{ index + 1 }}.</text>
                            <text class="tip-text">{{ suggest }}</text>
                        </view>
                    </view>
                </view>
            </view>
            <!-- <view style="height: 50rpx"/> -->
        </scroll-view>

        <!-- 底部按钮 -->
        <view class="footer-fixed">
            <view class="footer">
                <button class="back-btn" @tap="goBack">返回首页</button>
                <button class="share-btn" @tap="shareResult">邀请朋友测一测</button>
            </view>
        </view>
    </view>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import type { ResultItem, ComputeResult, ResultResponse } from '@/types/test'
import manifest from '@/manifest.json'

const RESULT_API = 'http://subing.site/scale/compute'

export default defineComponent({
    name: 'TestResult',
    setup() {
        const store = useStore()
        const resultInfo = ref<ResultItem>()
        const isLoading = ref(false)
        const page_type = ref('')
        const page_title = ref('')

        // 从服务器获取测试结果
        const fetchTestResult = async (testId: string, items: any[]): Promise<ComputeResult> => {
            const response = await uni.request({
                url: RESULT_API,
                method: 'POST',
                data: {
                    items,
                    id: testId,
                },
                header: {
                    'content-type': 'application/json',
                },
            })
            console.log('response', response)
            if (response.statusCode === 200 && response.data) {
                const resultResponse = response.data as ResultResponse
                if (resultResponse.code === 200) {
                    // 如果返回的是字符串，需要解析
                    const resultData =
                        typeof resultResponse.data === 'string'
                            ? JSON.parse(resultResponse.data)
                            : resultResponse.data

                    return resultData as ComputeResult
                }
            }
            throw new Error('Failed to fetch test result')
        }

        onLoad(async (options: any) => {
            const { type, id, testJson } = options
            console.log('type', type, 'id', id)
            page_type.value = type
            if (type === 'test') {
                isLoading.value = true
                try {
                    if (testJson) {
                        // 解码并解析测试数据
                        const decodedJson = decodeURIComponent(testJson)
                        const test = JSON.parse(decodedJson)
                        page_title.value = test.name || '测试结果'

                        // 获取测试结果
                        const result = await fetchTestResult(id, test.items)
                        console.log('result', result)

                        // 生成结果对象
                        const resultItem: ResultItem = {
                            id: Date.now().toString(),
                            test: {
                                id: test.id,
                                name: test.name,
                                description: test.description,
                                userCount: test.userCount,
                                questionCount: test.questionCount,
                                duration: test.duration,
                                type: test.type,
                                source: test.source,
                                soloChoice: test.soloChoice,
                            },
                            introTexts: result.summary,
                            completedDate: Date.now(),
                            score: result.score,
                            scoreText: result.level,
                            suggest: test.suggest,
                        }

                        // 保存到 store
                        store.dispatch('test/addTestResult', resultItem)
                        resultInfo.value = resultItem
                    }
                } catch (e) {
                    console.error('获取测试结果失败:', e)
                    uni.showToast({
                        title: '获取结果失败',
                        icon: 'none',
                    })
                } finally {
                    isLoading.value = false
                }
            } else if (type === 'history') {
                const result = store.state.test.historyResults.find(
                    (item: ResultItem) => item.id === id
                )
                page_title.value = result?.test.name || '测试结果'

                resultInfo.value = result
            }
        })

        const shareResult = () => {
            uni.showShareMenu({
                withShareTicket: true,
            })
        }

        const goBack = () => {
            uni.navigateBack({
                delta: 100, // 返回的页面数，如果 delta 大于现有页面数，则返回到首页
            })
        }

        return {
            manifest,
            resultInfo,
            isLoading,
            page_title,
            shareResult,
            goBack,
            page_type,
        }
    },
})
</script>

<style lang="scss">
.container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    // overflow: hidden;
}

.nav-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: #fff;
}

.content-scroll {
    flex: 1;
    box-sizing: border-box;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    margin-top: 91px;
    margin-bottom: calc(100rpx + env(safe-area-inset-bottom));
    background: #f5f6fa;
}
.content {
    padding: 0 30rpx;
    padding-bottom: 50rpx;
}

.header {
    margin: 30rpx 0;
    // margin-top: 20rpx;
    // margin-bottom: 40rpx;

    .title {
        font-size: 36rpx;
        color: #4080ff;
        font-weight: bold;
    }
}

.result-section {
    padding: 50rpx 0;
    background: #fff;
    border-radius: 20rpx;
    // padding: 40rpx;
    text-align: center;
    margin-bottom: 30rpx;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 30rpx;
    .result-title {
        font-size: 50rpx;
        color: #4080ff;
        font-weight: bold;
        margin-bottom: 20rpx;
    }

    .score-circle {
        width: 200rpx;
        height: 200rpx;
        border-radius: 50%;
        border: 8rpx solid #4080ff;
        display: flex;
        align-items: center;
        justify-content: center;

        .score {
            font-size: 64rpx;
            color: #4080ff;
            font-weight: bold;
        }

        .unit {
            font-size: 24rpx;
            color: #4080ff;
            margin-left: 4rpx;
        }
    }
}

.result-content {
    background: #fff;
    border-radius: 20rpx;
    padding: 40rpx;
    margin-bottom: 30rpx;

    .result-desc {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
        margin-bottom: 30rpx;
    }

    .divider {
        height: 1rpx;
        background: #eee;
        margin: 30rpx 0;
    }

    .disclaimer {
        font-size: 24rpx;
        color: #999;
        text-align: center;
    }
}
.section-title {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    .title-bar {
        width: 6rpx;
        height: 32rpx;
        background: #4080ff;
        border-radius: 3rpx;
        margin-right: 16rpx;
    }
    text {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
    }
}

.tips-section {
    background: #fff;
    border-radius: 20rpx;
    padding: 40rpx;
    .tips-subtitle {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 30rpx;
        display: block;
    }

    .tip-item {
        display: flex;
        margin-bottom: 30rpx;

        .tip-number {
            font-size: 28rpx;
            color: #333;
            font-weight: 500;
            margin-right: 16rpx;
            flex-shrink: 0;
        }

        .tip-text {
            font-size: 28rpx;
            color: #666;
            line-height: 1.6;
            flex: 1;
        }
    }
}
.footer-fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    z-index: 100;
}
.footer {
    padding: 20rpx 30rpx;
    padding-bottom: env(safe-area-inset-bottom);
    display: flex;
    background: #fff;
    box-sizing: border-box;

    .back-btn {
        flex: 1;
        font-size: 30rpx;
        text-align: center;
        margin: 0;
        padding: 0;
        border-radius: 10rpx 0 0 10rpx;
        height: 80rpx;
        background: #f5f6fa;
        color: #666;
    }

    .share-btn {
        flex: 1;
        font-size: 30rpx;
        text-align: center;
        margin: 0;
        padding: 0;
        height: 80rpx;

        background: #4080ff;
        color: #fff;
        border-radius: 0 10rpx 10rpx 0;
    }
}

.loading-state {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    text {
        font-size: 32rpx;
        color: #666;
    }
}
</style>
