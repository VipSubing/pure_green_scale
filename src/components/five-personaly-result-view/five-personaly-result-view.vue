<template>
  <view class="bg-white p-4 rounded-lg w-full max-w-md">
    <view class="flex justify-center mb-8">
      <canvas
        canvas-id="resultChart"
        id="resultChart"
        style="width: 300px; height: 300px"
        @touchstart="canvasTouchStart"
      ></canvas>
    </view>

    <view class="space-y-4">
      <view v-for="(score, key) in testResult" :key="key" class="border-b pb-2">
        <view class="flex justify-between items-center">
          <text class="font-semibold text-blue-700 primary-text">{{
            capitalizeFirstLetter(key)
          }}</text>
          <text class="text-blue-600 primary-text">{{ score.toFixed(1) }}</text>
        </view>
        <text class="text-sm text-gray-600 mt-1 block">{{
          interpretations[key]
        }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onReady } from "@dcloudio/uni-app";
import { onMounted, reactive } from "vue";
import { getCurrentInstance } from "vue";
const instance = getCurrentInstance();

interface TestResult {
  neuroticism: number;
  conscientiousness: number;
  agreeableness: number;
  openness: number;
  extraversion: number;
}

const testResult: TestResult = reactive({
  neuroticism: 3.5,
  conscientiousness: 4.2,
  agreeableness: 3.8,
  openness: 4.0,
  extraversion: 3.2,
});

const maxScore = 5;

const interpretations: Record<keyof TestResult, string> = {
  neuroticism: "倾向于经历负面情绪,如焦虑、抑郁、愤怒等。",
  conscientiousness: "体现了一个人的责任心、条理性和可靠性。",
  agreeableness: "反映了个体在人际关系中的和谐程度。",
  openness: "表现为对新经验的接受程度和创造性思维。",
  extraversion: "体现了一个人的社交倾向和活跃程度。",
};

onReady(() => {
  drawChart();
});

function capitalizeFirstLetter(string: string): string {
  const titles = {
    neuroticism: "神经质",
    conscientiousness: "严谨性",
    agreeableness: "宜人性",
    openness: "开放性",
    extraversion: "外向性",
  };

  return titles[string as keyof typeof titles];
}

function drawChart() {
  const ctx = uni.createCanvasContext("resultChart", instance);
  const canvasWidth = 300;
  const canvasHeight = 300;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = 120;

  // 绘制背景五边形
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.setStrokeStyle("#e5e7eb");
  ctx.stroke();

  // 绘制结果五边形
  ctx.beginPath();
  Object.values(testResult).forEach((score, index) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle) * (score / maxScore);
    const y = centerY + radius * Math.sin(angle) * (score / maxScore);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
  ctx.setFillStyle("rgba(59, 130, 246, 0.5)");
  ctx.setStrokeStyle("#3b82f6");
  ctx.fill();
  ctx.stroke();

  // 绘制轴线
  Object.values(testResult).forEach((_, index) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.setStrokeStyle("#e5e7eb");
    ctx.stroke();
  });

  // 绘制得分点和标签
  Object.values(testResult).forEach((score, index) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle) * (score / maxScore);
    const y = centerY + radius * Math.sin(angle) * (score / maxScore);

    // 绘制得分点
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.setFillStyle("#3b82f6");
    ctx.fill();

    // 绘制得分标签
    const labelOffset = 15;
    const labelX = x + labelOffset * Math.cos(angle);
    const labelY = y + labelOffset * Math.sin(angle);
    ctx.setFillStyle("#3b82f6");
    ctx.setFontSize(12);
    ctx.setTextAlign("center");
    ctx.setTextBaseline("middle");
    ctx.fillText(score.toFixed(1), labelX, labelY);
  });

  // 绘制特质标签
  const traits = ["神经质", "严谨性", "宜人性", "开放性", "外向性"];
  traits.forEach((trait, index) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const x = centerX + (radius + 30) * Math.cos(angle);
    const y = centerY + (radius + 30) * Math.sin(angle);
    ctx.setFillStyle("#3b82f6");
    ctx.setFontSize(14);
    ctx.setTextAlign("center");
    ctx.setTextBaseline("middle");
    ctx.fillText(trait, x, y);
  });

  ctx.draw();
}

function canvasTouchStart(e: any) {
  // 防止触摸事件穿透
  e.preventDefault();
}
</script>

<style lang="scss" scoped>
/* 这里可以添加任何额外的自定义样式 */
.primary-text {
  color: $uni-color-primary;
}
</style>
