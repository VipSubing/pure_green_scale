<template>
  <view class="min-h-screen bg-blue-50 flex items-center justify-center p-4">
    <view class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
      <text class="text-3xl font-bold text-center text-blue-800 mb-6">
        中国大五人格问卷简式版（CBF-PI-B）结果
      </text>

      <view class="relative w-full aspect-square max-w-md mx-auto mb-8">
        <view class="pentagon-container">
          <view
            v-for="(trait, index) in traits"
            :key="index"
            class="pentagon-line"
            :style="getLineStyle(index)"
          >
            <view
              class="pentagon-point"
              :style="getPointStyle(trait.score)"
            ></view>
          </view>
          <view
            v-for="(trait, index) in traits"
            :key="index"
            class="pentagon-label"
            :style="getLabelStyle(index)"
          >
            {{ trait.name }}
          </view>
        </view>
      </view>

      <view class="space-y-4">
        <view
          v-for="(trait, index) in traits"
          :key="index"
          class="bg-blue-100 p-4 rounded-lg"
        >
          <text class="text-xl font-semibold text-blue-800 mb-2">{{
            trait.name
          }}</text>
          <text class="text-blue-700 mb-1">得分: {{ trait.score }}</text>
          <text class="text-sm text-blue-600">{{ trait.description }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
export default {
  name: "FivePersonalyResultView",
};
</script>

<script setup lang="ts">
import { ref } from "vue";

// defineProps<{
//   result: ;
// }>();

interface Trait {
  name: string;
  score: number;
  description: string;
}

const traits = ref<Trait[]>([
  {
    name: "神经质",
    score: 3.5,
    description: "情绪较为稳定，但有时可能会感到焦虑或沮丧。",
  },
  {
    name: "严谨性",
    score: 4.2,
    description: "有组织、负责任，注重细节和计划。",
  },
  {
    name: "宜人性",
    score: 3.8,
    description: "友善、乐于合作，但有时可能会有自己的主见。",
  },
  {
    name: "开放性",
    score: 4.5,
    description: "富有创造力、好奇心强，喜欢尝试新事物。",
  },
  {
    name: "外向性",
    score: 3.2,
    description: "社交能力适中，既能独处也能与人交往。",
  },
]);

function getLineStyle(index: number) {
  const angle = index * 72 - 90;
  return {
    transform: `rotate(${angle}deg)`,
  };
}

function getPointStyle(score: number) {
  const distance = (score / 5) * 100;
  return {
    bottom: `${distance}%`,
  };
}

function getLabelStyle(index: number) {
  const angle = index * 72 - 90;
  const radian = (angle * Math.PI) / 180;
  const x = 50 + 45 * Math.cos(radian);
  const y = 50 + 45 * Math.sin(radian);
  return {
    left: `${x}%`,
    top: `${y}%`,
  };
}
</script>

<style>
/* 五边形图表样式 */
.pentagon-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.pentagon-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: 2rpx;
  background-color: #93c5fd;
  transform-origin: left center;
}

.pentagon-point {
  position: absolute;
  right: 0;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #3b82f6;
  transform: translateX(50%);
}

.pentagon-label {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 24rpx;
  color: #1e40af;
}
</style>
