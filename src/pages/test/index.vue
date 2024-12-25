<template>
  <view class="test-page">
    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-text"> 当前进度 </view>
      <view class="progress-track">
        <view
          class="progress-fill"
          :style="{
            width: `${
              ((currentIndex + 1) / (testPaper?.items?.length ?? 1)) * 100
            }%`,
          }"
        ></view>
      </view>
      <text class="progress-count"
        >{{ currentIndex + 1 }}/{{ testPaper?.items?.length ?? 0 }}</text
      >
    </view>

    <!-- 问题区域 -->
    <scroll-view scroll-y :show-scrollbar="false" class="question-scroll">
      <view class="question-area">
        <view class="question-text">{{ currentQuestion?.title }}</view>

        <!-- 题目类型标识 -->
        <view class="question-type">
          <text>{{ testPaper?.soloChoice ? "单选题" : "多选题" }}</text>
        </view>

        <!-- 答案列表 -->
        <view class="answer-list">
          <view
            v-for="(answer, index) in currentQuestion?.answers"
            :key="index"
            class="answer-item"
            :class="{ selected: answer.selected }"
            @tap="handleAnswer(index)"
          >
            <text>{{ answer.text }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮区 -->
    <view class="footer">
      <!-- 上一题按钮 - 非第一题时显示 -->
      <button v-if="currentIndex > 0" class="prev-btn" @tap="prevQuestion">
        上一题
      </button>

      <!-- 下一题/完成按钮 - 多选时显示 -->
      <button
        v-if="!testPaper?.soloChoice"
        class="next-btn"
        :class="{ 'full-width': currentIndex === 0 }"
        :disabled="!hasSelectedAnswer"
        @tap="nextQuestion"
      >
        {{ isLastQuestion ? "完成" : "下一题" }}
      </button>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useStore } from "@/store";
import type { TestPaperItem } from "@/types/test";

export default defineComponent({
  name: "TestPage",
  setup() {
    const store = useStore();
    const testPaper = ref<TestPaperItem>();
    const currentIndex = ref(0);
    const answers = ref<number[]>([]);

    // 添加点击锁定状态
    const isClickLocked = ref(false);
    const CLICK_DELAY = 1000; // 点击间隔时间，单位毫秒

    // 当前问题
    const currentQuestion = computed(() => {
      return testPaper.value?.items?.[currentIndex.value];
    });

    // 是否是最后一题
    const isLastQuestion = computed(() => {
      return currentIndex.value === (testPaper.value?.items?.length || 0) - 1;
    });

    // 是否已选择答案（用于多选时判断是否可以进入下一题）
    const hasSelectedAnswer = computed(() => {
      return currentQuestion.value?.answers.some((answer) => answer.selected);
    });

    // 重置所有答案的选中状态
    const resetAnswers = (paper: TestPaperItem) => {
      if (paper.items) {
        paper.items.forEach((item) => {
          item.answers.forEach((answer) => {
            answer.selected = undefined;
          });
        });
      }
    };

    onLoad((options: any) => {
      const testId = options.type;
      const test = store.state.test.testItems.find(
        (item) => item.id === testId
      );
      if (test) {
        // 从缓存获取题目数据
        const key = `questions_${testId}`;
        const cachedQuestions = uni.getStorageSync(key);
        if (cachedQuestions) {
          const questions = JSON.parse(cachedQuestions);
          testPaper.value = {
            ...test,
            items: questions,
          };
          resetAnswers(testPaper.value);
        }
      }

      answers.value = new Array(testPaper.value?.items?.length || 0).fill(-1);

      if (testPaper.value) {
        uni.setNavigationBarTitle({
          title: testPaper.value.name,
        });
      }
    });

    // 处理答案选择
    const handleAnswer = (answerIndex: number) => {
      // 如果点击被锁定，直接返回
      if (isClickLocked.value) return;

      // 锁定点击
      isClickLocked.value = true;

      if (!testPaper.value || !currentQuestion.value) return;

      if (testPaper.value.soloChoice) {
        // 单选模式：清除当前题目其他答案的选中状态
        currentQuestion.value.answers.forEach((answer, index) => {
          answer.selected = index === answerIndex;
        });
        // 记录选择
        answers.value[currentIndex.value] = answerIndex;
        setTimeout(() => {
          nextQuestion();
        }, 300);

        // 延迟解锁点击
        setTimeout(() => {
          isClickLocked.value = false;
        }, CLICK_DELAY);
      } else {
        // 多选模式：切换选中状态
        currentQuestion.value.answers[answerIndex].selected =
          !currentQuestion.value.answers[answerIndex].selected;
      }
    };

    // 进入下一题或完成测评
    const nextQuestion = () => {
      if (isLastQuestion.value) {
        finishTest();
      } else {
        currentIndex.value++;
        // 如果下一题已经回答过，恢复选中状态
        if (testPaper.value?.items && testPaper.value.soloChoice) {
          const nextAnswerIndex = answers.value[currentIndex.value];
          if (nextAnswerIndex !== -1) {
            testPaper.value.items[currentIndex.value].answers.forEach(
              (answer, index) => {
                answer.selected = index === nextAnswerIndex;
              }
            );
          }
        }
      }
    };

    // 完成测评，计算得分
    const finishTest = async () => {
      if (!testPaper.value) return;

      try {
        // 跳转到结果页面，传递答题数据
        uni.redirectTo({
          url: `/pages/test-result/index?type=test&id=${
            testPaper.value.id
          }&testJson=${encodeURIComponent(JSON.stringify(testPaper.value))}`,
        });
      } catch (e) {
        console.error("计算分数时出错:", e);
        uni.showToast({
          title: "计算分数时出错",
          icon: "none",
        });
      }
    };

    // 上一题按钮
    const prevQuestion = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--;
        // 恢复上一题的选中状态
        if (testPaper.value?.items && testPaper.value.soloChoice) {
          const prevAnswerIndex = answers.value[currentIndex.value];
          if (prevAnswerIndex !== -1) {
            testPaper.value.items[currentIndex.value].answers.forEach(
              (answer, index) => {
                answer.selected = index === prevAnswerIndex;
              }
            );
          }
        }
      }
    };

    return {
      testPaper,
      currentIndex,
      currentQuestion,
      isLastQuestion,
      hasSelectedAnswer,
      handleAnswer,
      nextQuestion,
      prevQuestion,
    };
  },
});
</script>

<style lang="scss">
.test-page {
  min-height: 100vh;
  background: $uni-bg-color-grey;
  display: flex;
  flex-direction: column;
}

.progress-bar {
  padding: $uni-spacing-row-lg;
  display: flex;
  align-items: center;
  gap: $uni-spacing-row-lg;

  .progress-text {
    font-size: $uni-font-size-base;
    color: $uni-text-color;
    white-space: nowrap;
  }

  .progress-track {
    height: 12rpx;
    background: $uni-border-color;
    border-radius: $uni-border-radius-sm;
    overflow: hidden;
    width: 100%;
    .progress-fill {
      height: 100%;
      background: $uni-color-primary;
      transition: width 0.3s ease;
    }
  }

  .progress-count {
    color: $uni-color-primary;
    font-size: $uni-font-size-base;
    white-space: nowrap;
  }
}

.question-scroll {
  flex: 1;
  padding: $uni-spacing-row-lg;
  padding-top: $uni-spacing-row-lg;
  padding-bottom: 140rpx;
  box-sizing: border-box;
}

.question-area {
  flex: 1;
  background: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-row-lg;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  //   transition: box-shadow 0.3s ease;

  &:active {
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  }

  .question-text {
    flex: 1;
    font-size: $uni-font-size-lg;
    color: $uni-text-color;
    line-height: 1.6;
  }

  .answer-list {
    margin-top: calc($uni-spacing-row-lg + 20rpx);
    .answer-item {
      padding: $uni-spacing-row-lg;
      background: $uni-bg-color-grey;
      border-radius: $uni-border-radius-lg;
      margin-bottom: $uni-spacing-col-lg;
      font-size: $uni-font-size-base;
      color: $uni-text-color;
      transition: all 0.3s ease;

      &:active {
        background: rgba($uni-color-primary, 0.1);
        color: $uni-color-primary;
      }

      &.selected {
        background: rgba($uni-color-primary, 0.1);
        color: $uni-color-primary;
        position: relative;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 6rpx;
          background: $uni-color-primary;
          border-radius: 3rpx;
        }
      }
    }
  }
}

.question-type {
  margin: $uni-spacing-col-base 0;

  text {
    font-size: $uni-font-size-sm;
    color: $uni-color-primary;
    background: rgba($uni-color-primary, 0.1);
    padding: $uni-spacing-col-sm $uni-spacing-row-lg;
    border-radius: $uni-border-radius-base;
  }
}

.footer {
  margin-bottom: $safe-area-inset-bottom;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: $uni-spacing-col-lg $uni-spacing-row-lg;
  z-index: 100;
  display: flex;
  gap: $uni-spacing-row-lg;

  .prev-btn {
    flex: 1;
    margin: 0 $uni-spacing-row-lg 0 $uni-spacing-row-lg;
    height: 88rpx;
    background: rgba($uni-color-primary, 0.1);
    color: $uni-color-primary;
    font-size: $uni-font-size-lg;
    border-radius: $uni-border-radius-lg;
    text-align: center;
    transition: all 0.3s ease;

    &:active {
      background: rgba($uni-color-primary, 0.2);
    }
  }

  .next-btn {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    background: $uni-color-primary;
    color: $uni-text-color-inverse;
    font-size: $uni-font-size-lg;
    border-radius: $uni-border-radius-lg;
    text-align: center;
    transition: all 0.3s ease;

    &.full-width {
      width: 100%;
    }

    &:disabled {
      background: $uni-text-color-disable;
      opacity: $uni-opacity-disabled;
    }

    &:active {
      opacity: 0.9;
    }
  }
}
</style>
