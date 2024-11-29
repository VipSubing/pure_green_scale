<template>
    <view class="test-page">
        <!-- 进度条 -->
        <view class="progress-bar">
            <view class="progress-text"> 当前进度 </view>
            <view class="progress-track">
                <view
                    class="progress-fill"
                    :style="{
                        width: `${((currentIndex + 1) / testPaper?.items?.length) * 100}%`,
                    }"></view>
            </view>
            <text class="progress-count"
                >{{ currentIndex + 1 }}/{{ testPaper?.items?.length }}</text
            >
        </view>

        <!-- 问题区域 -->
        <scroll-view scroll-y :show-scrollbar="false" class="question-scroll">
            <view class="question-area">
                <view class="question-text">{{ currentQuestion?.title }}</view>

                <!-- 题目类型标识 -->
                <view class="question-type">
                    <text>{{ testPaper?.soloChoice ? '单选题' : '多选题' }}</text>
                </view>

                <!-- 答案列表 -->
                <view class="answer-list">
                    <view
                        v-for="(answer, index) in currentQuestion?.answers"
                        :key="index"
                        class="answer-item"
                        :class="{ selected: answer.selected }"
                        @tap="handleAnswer(index)">
                        <text>{{ answer.text }}</text>
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 底部按钮区 -->
        <view class="footer">
            <!-- 上一题按钮 - 非第一题时显示 -->
            <button v-if="currentIndex > 0" class="prev-btn" @tap="prevQuestion">上一题</button>

            <!-- 下一题/完成按钮 - 多选时显示 -->
            <button
                v-if="!testPaper?.soloChoice"
                class="next-btn"
                :class="{ 'full-width': currentIndex === 0 }"
                :disabled="!hasSelectedAnswer"
                @tap="nextQuestion">
                {{ isLastQuestion ? '完成' : '下一题' }}
            </button>
        </view>
    </view>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import type { TestPaperItem } from '@/types/test'

export default defineComponent({
    name: 'TestPage',
    setup() {
        const store = useStore()
        const testPaper = ref<TestPaperItem>()
        const currentIndex = ref(0)
        const answers = ref<number[]>([])

        // 当前问题
        const currentQuestion = computed(() => {
            return testPaper.value?.items?.[currentIndex.value]
        })

        // 是否是最后一题
        const isLastQuestion = computed(() => {
            return currentIndex.value === (testPaper.value?.items?.length || 0) - 1
        })

        // 是否已选择答案（用于多选时判断是否可以进入下一题）
        const hasSelectedAnswer = computed(() => {
            return currentQuestion.value?.answers.some((answer) => answer.selected)
        })

        // 重置所有答案的选中状态
        const resetAnswers = (paper: TestPaperItem) => {
            if (paper.items) {
                paper.items.forEach((item) => {
                    item.answers.forEach((answer) => {
                        answer.selected = undefined
                    })
                })
            }
        }

        onLoad((options: any) => {
            const testId = options.type
            const test = store.state.test.testItems.find((item) => item.id === testId)
            if (test) {
                testPaper.value = JSON.parse(JSON.stringify(test))
                resetAnswers(testPaper.value)
            }

            answers.value = new Array(testPaper.value?.items?.length || 0).fill(-1)

            if (testPaper.value) {
                uni.setNavigationBarTitle({
                    title: testPaper.value.name,
                })
            }
        })

        // 处理答案选择
        const handleAnswer = (answerIndex: number) => {
            if (!testPaper.value || !currentQuestion.value) return

            if (testPaper.value.soloChoice) {
                // 单选模式：清除当前题目其他答案的选中状态
                currentQuestion.value.answers.forEach((answer, index) => {
                    answer.selected = index === answerIndex
                })
                // 记录选择
                answers.value[currentIndex.value] = answerIndex
                nextQuestion()
            } else {
                // 多选模式：切换选中状态
                currentQuestion.value.answers[answerIndex].selected =
                    !currentQuestion.value.answers[answerIndex].selected
            }
        }

        // 进入下一题或完成测评
        const nextQuestion = () => {
            if (isLastQuestion.value) {
                finishTest()
            } else {
                currentIndex.value++
                // 如果下一题已经回答过，恢复选中状态
                if (testPaper.value?.items && testPaper.value.soloChoice) {
                    const nextAnswerIndex = answers.value[currentIndex.value]
                    if (nextAnswerIndex !== -1) {
                        testPaper.value.items[currentIndex.value].answers.forEach(
                            (answer, index) => {
                                answer.selected = index === nextAnswerIndex
                            }
                        )
                    }
                }
            }
        }

        // 完成测评，计算得分
        const finishTest = async () => {
            if (!testPaper.value) return

            // 计算原始分数和收集答案
            let totalScore = 0
            const selectedAnswers: number[][] = []

            testPaper.value.items?.forEach((item, index) => {
                const questionAnswers: number[] = []
                if (testPaper.value?.soloChoice) {
                    questionAnswers.push(answers.value[index])
                    totalScore += item.answers[answers.value[index]].score
                } else {
                    item.answers.forEach((answer, answerIndex) => {
                        if (answer.selected) {
                            questionAnswers.push(answerIndex)
                            totalScore += answer.score
                        }
                    })
                }
                selectedAnswers.push(questionAnswers)
            })

            try {
                let finalScore = totalScore
                let scoreText = getScoreText(totalScore)
                let suggest = testPaper.value.suggest

                // 使用缓存的评分脚本
                const scriptContent = loadScriptFromCache(testPaper.value.id)
                if (scriptContent) {
                    const scoreCalculator = new Function('score', 'answers', scriptContent)
                    const result = scoreCalculator(totalScore, selectedAnswers)
                    if (result) {
                        finalScore = result.score ?? totalScore
                        scoreText = result.scoreText ?? getScoreText(finalScore)
                        suggest = result.suggest ?? suggest
                    }
                }

                // 创建结果对象
                const resultItem: ResultItem = {
                    id: Date.now().toString(),
                    test: {
                        id: testPaper.value.id,
                        name: testPaper.value.name,
                        description: testPaper.value.description,
                        userCount: testPaper.value.userCount,
                        questionCount: testPaper.value.questionCount,
                        duration: testPaper.value.duration,
                        type: testPaper.value.type,
                        source: testPaper.value.source,
                        soloChoice: testPaper.value.soloChoice,
                    },
                    completedDate: Date.now(),
                    score: finalScore,
                    scoreText,
                    suggest,
                }

                // 保存到 store
                store.dispatch('test/addTestResult', resultItem)

                // 跳转到结果页面
                uni.navigateTo({
                    url: `/pages/test-result/index?id=${resultItem.id}`,
                })
            } catch (e) {
                console.error('Error in score calculation:', e)
                uni.showToast({
                    title: '计算分数时出错',
                    icon: 'none',
                })
            }
        }

        // 根据分数获取结果描述
        const getScoreText = (score: number): string => {
            if (score >= 27) return '重度抑郁倾向'
            if (score >= 20) return '中度抑郁倾向'
            if (score >= 10) return '轻度抑郁倾向'
            return '心理状态正常'
        }

        // 上一题按钮
        const prevQuestion = () => {
            if (currentIndex.value > 0) {
                currentIndex.value--
                // 恢复上一题的选中状态
                if (testPaper.value?.items && testPaper.value.soloChoice) {
                    const prevAnswerIndex = answers.value[currentIndex.value]
                    if (prevAnswerIndex !== -1) {
                        testPaper.value.items[currentIndex.value].answers.forEach(
                            (answer, index) => {
                                answer.selected = index === prevAnswerIndex
                            }
                        )
                    }
                }
            }
        }

        return {
            testPaper,
            currentIndex,
            currentQuestion,
            isLastQuestion,
            hasSelectedAnswer,
            handleAnswer,
            nextQuestion,
            prevQuestion,
        }
    },
})
</script>

<style lang="scss">
.test-page {
    min-height: 100vh;
    background: #f5f6fa;
    display: flex;
    flex-direction: column;
}

.progress-bar {
    padding: 30rpx;
    display: flex; // 添加此行
    align-items: center; // 添加此行
    gap: 20rpx; // 添加此行，控制元素间距

    .progress-text {
        font-size: 24rpx;
        color: #666;
        white-space: nowrap; // 防止文字换行
    }

    .progress-track {
        height: 8rpx;
        background: #e0e0e0;
        border-radius: 4rpx;
        overflow: hidden;
        width: 100%;
        .progress-fill {
            height: 100%;
            background: #4080ff;
            transition: width 0.3s ease;
        }
    }

    .progress-count {
        color: #4080ff;
        font-size: 24rpx;
        white-space: nowrap; // 防止文字换行
    }
}

.question-scroll {
    flex: 1;
    height: 0; // 让滚动区域自适应剩余高度
    padding: 30rpx;
    padding-top: 10rpx;
    padding-bottom: 140rpx; // 为底部按钮预留空间
    box-sizing: border-box;
}

.question-area {
    flex: 1;
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;

    &:active {
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    }

    .question-text {
        flex: 1;
        font-size: 32rpx;
        color: #333;
        line-height: 1.6;
        // padding: 20rpx;
        // background: #f5f6fa;
        // border-radius: 20rpx;
    }

    .answer-list {
        margin-top: 30rpx;
        .answer-item {
            padding: 30rpx;
            background: #f5f6fa;
            border-radius: 16rpx;
            margin-bottom: 20rpx;
            font-size: 30rpx;
            color: #333;
            transition: all 0.3s ease;

            // 点击时的高亮效果
            &:active {
                background: rgba(64, 128, 255, 0.1);
                color: #4080ff;
            }

            // 选中状态
            &.selected {
                background: rgba(64, 128, 255, 0.1); // 修改为半透明蓝色
                color: #4080ff; // 文字改为蓝色
                position: relative;

                // 添加选中时的左边框标识
                &::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 6rpx;
                    background: #4080ff; // 边框标识改为蓝色
                    border-radius: 3rpx;
                }
            }
        }
    }
}

.question-type {
    margin: 10rpx 0;
    // padding: 0 30rpx;

    text {
        font-size: 22rpx;
        color: #4080ff;
        background: rgba(64, 128, 255, 0.1);
        padding: 6rpx 20rpx;
        border-radius: 10rpx;
    }
}

.footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20rpx 30rpx;
    z-index: 100;
    display: flex;
    gap: 20rpx;

    /* 适配底部安全区域 */
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);

    .prev-btn {
        flex: 1;
        margin: 0 20rpx 0 20rpx;
        height: 88rpx;
        background: rgba(64, 128, 255, 0.1); // 修改为浅蓝色背景
        color: #4080ff; // 修改为蓝色文字
        font-size: 32rpx;
        border-radius: 22rpx;
        text-align: center;
        transition: all 0.3s ease;

        &:active {
            background: rgba(64, 128, 255, 0.2); // 点击时稍微加深
        }
    }

    .next-btn {
        flex: 1;
        height: 88rpx;
        line-height: 88rpx;
        background: #4080ff; // 保持蓝色背景
        color: #fff;
        font-size: 32rpx;
        border-radius: 22rpx;
        text-align: center;
        transition: all 0.3s ease;

        &.full-width {
            width: 100%;
        }

        &:disabled {
            background: #ccc;
            opacity: 0.8;
        }

        &:active {
            opacity: 0.9;
        }
    }
}
</style>
