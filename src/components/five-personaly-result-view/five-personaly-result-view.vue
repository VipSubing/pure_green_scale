<template>
  <view v-if="props.testResult" class="bg-white p-4 rounded-lg w-full max-w-md">
    <view class="flex justify-center mb-8">
      <canvas
        canvas-id="resultChart"
        id="resultChart"
        style="width: 100%; height: 300px"
        @touchstart="canvasTouchStart"
      ></canvas>
    </view>

    <view class="space-y-4">
      <view
        v-for="(score, key, index) in props.testResult.scores"
        :key="key"
        class="border-b pb-2"
      >
        <view class="flex justify-between items-center">
          <text class="font-semibold text-blue-700 primary-text">{{
            capitalizeFirstLetter(key)
          }}</text>
          <text class="text-blue-600 primary-text">{{
            Math.floor(score)
          }}</text>
        </view>
        <text class="text-sm text-gray-600 mt-1 block">{{
          props.testResult.result[index]
        }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onReady } from "@dcloudio/uni-app";
import { getCurrentInstance } from "vue";
import type { FivePersonalyResult } from "@/types/result";

const props = defineProps<{
  testResult: FivePersonalyResult;
}>();

const instance = getCurrentInstance();

const maxScore = 48;

const titles = {
  N: "神经质-反向分",
  E: "外向性",
  O: "开放性",
  A: "宜人性",
  C: "尽责性",
};

onReady(() => {
  console.log("props.testResult", props.testResult);
  props.testResult.scores.N = maxScore - props.testResult.scores.N;
  drawChart();
});

function capitalizeFirstLetter(string: string): string {
  return titles[string as keyof typeof titles];
}

function drawChart() {
  const ctx = uni.createCanvasContext("resultChart", instance);
  const canvasWidth = 300;
  const canvasHeight = 300;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2 + 10; // 向下移动20px
  const radius = 105;

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
  Object.values(props.testResult.scores).forEach((score, index) => {
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
  Object.values(props.testResult.scores).forEach((_, index) => {
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
  Object.values(props.testResult.scores).forEach((score, index) => {
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
    ctx.fillText(Math.floor(score).toString(), labelX, labelY);
  });

  // 绘制特质标签
  const traits = Object.values(titles);
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
