<template>
    <view class="result-page">
        <!-- 加载状态 -->
        <view v-if="isLoading" class="loading-state">
            <text>计算结果中...</text>
        </view>

        <!-- 结果内容 -->
        <template v-else>
            <!-- 头部标题 -->
            <view class="header">
                <text class="title">{{ manifest.name }} · 测评结果</text>
            </view>

            <!-- 结果区域 -->
            <view class="result-section">
                <text class="result-title">{{ resultInfo?.scoreText }}</text>
                <view class="score-circle">
                    <text class="score">{{ resultInfo?.score }}</text>
                    <text class="unit">分</text>
                </view>
            </view>

            <!-- 结果概述 -->
            <view class="result-content">
                <view class="section-title">测评结果概述</view>
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

            <!-- 底部按钮 -->
            <view class="footer">
                <button class="back-btn" @tap="goBack">返回首页</button>
                <button class="share-btn" @tap="shareResult">邀请朋友测一测</button>
            </view>
        </template>
    </view>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import type { ResultItem, ComputeResult, ResultResponse } from '@/types/test'
import manifest from '@/manifest.json'

const RESULT_API = 'http://10.31.11.188:8080/scale/compute'

export default defineComponent({
    name: 'TestResult',
    setup() {
        const store = useStore()
        const resultInfo = ref<ResultItem>()
        const isLoading = ref(false)

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

            if (type === 'test') {
                isLoading.value = true
                try {
                    if (testJson) {
                        // 解码并解析测试数据
                        const decodedJson = decodeURIComponent(testJson)
                        const test = JSON.parse(decodedJson)

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

                        // 设置导航栏标题
                        uni.setNavigationBarTitle({
                            title: test.name,
                        })
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
            shareResult,
            goBack,
        }
    },
})
</script>

<style lang="scss">
.result-page {
    min-height: 100vh;
    background: #f5f6fa;
    padding: 30rpx;
}

.header {
    margin-bottom: 40rpx;

    .title {
        font-size: 36rpx;
        color: #4080ff;
        font-weight: bold;
    }
}

.result-section {
    background: #fff;
    border-radius: 20rpx;
    padding: 40rpx;
    text-align: center;
    margin-bottom: 30rpx;

    .result-title {
        font-size: 40rpx;
        color: #333;
        font-weight: bold;
        margin-bottom: 30rpx;
    }

    .score-circle {
        width: 200rpx;
        height: 200rpx;
        border-radius: 50%;
        border: 8rpx solid #4080ff;
        margin: 0 auto;
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

    .section-title {
        font-size: 32rpx;
        color: #4080ff;
        margin-bottom: 20rpx;
    }

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

.tips-section {
    background: #fff;
    border-radius: 20rpx;
    padding: 40rpx;
    margin-bottom: 120rpx;

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

.footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20rpx 30rpx;
    display: flex;
    gap: 20rpx;
    background: #fff;

    .back-btn,
    .share-btn {
        flex: 1;
        height: 88rpx;
        line-height: 88rpx;
        border-radius: 44rpx;
        font-size: 32rpx;
        text-align: center;
    }

    .back-btn {
        background: #f5f6fa;
        color: #666;
    }

    .share-btn {
        background: #4080ff;
        color: #fff;
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
