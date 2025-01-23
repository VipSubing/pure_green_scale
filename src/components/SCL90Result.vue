<template>
  <view class="flex flex-col min-h-screen bg-gray-100">
    <!-- 总评估结果报告 -->
    <view class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <view class="border-b border-gray-200 p-4">
        <text class="text-l font-semibold text-gray-800">总评估结果报告</text>
      </view>

      <view class="overflow-x-auto">
        <view class="min-w-full">
          <view class="bg-gray-50 flex">
            <view
              class="w-1/4 px-4 py-2 text-left text-sm font-medium text-gray-500"
              >统计项目</view
            >
            <view
              class="w-1/4 px-4 py-2 text-left text-sm font-medium text-gray-500"
              >得分结果</view
            >
            <view
              class="w-1/4 px-4 py-2 text-left text-sm font-medium text-gray-500"
              >参考结果</view
            >
            <view
              class="w-1/4 px-4 py-2 text-left text-sm font-medium text-gray-500"
              >数值范围</view
            >
          </view>
          <view
            v-for="(item, index) in summaryResults"
            :key="index"
            class="flex items-center border-b border-gray-200 h-[56px]"
          >
            <view class="w-1/4 px-4 py-2 text-sm text-gray-900">{{
              item.name
            }}</view>
            <view class="w-1/4 px-4 py-2 text-sm text-gray-900">{{
              item.score
            }}</view>
            <view class="w-1/4 px-4 py-2">
              <view class="flex flex-wrap gap-2" v-if="item.result">
                <text
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  {{ item.result }}
                </text>
              </view>
            </view>
            <view class="w-1/4 px-4 py-2 text-sm text-gray-900">{{
              item.range
            }}</view>
          </view>
        </view>
      </view>

      <view class="bg-gray-50 p-4">
        <text class="text-sm text-gray-600">
          说明：当测试总分超过160分，或阳性项目数超过43项，需考虑筛选阳性，阳性即说明可能存在问题。由于量表只是辅助筛查工具，因此量表测试结果仅供参考。
        </text>
      </view>
    </view>

    <!-- 各项症状评估结果报告 -->
    <view class="bg-white rounded-lg shadow-md overflow-hidden">
      <view class="border-b border-gray-200 p-4">
        <text class="text-l font-semibold text-gray-800"
          >各项症状评估结果报告</text
        >
      </view>

      <view class="overflow-x-auto">
        <view class="min-w-full">
          <view class="bg-gray-50 flex">
            <view
              class="w-1/5 px-4 py-2 text-left text-sm font-medium text-gray-500"
              >因子</view
            >
            <view
              class="w-1/5 px-4 py-2 text-left text-sm font-medium text-gray-500"
              >得分</view
            >
            <view
              class="w-1/5 px-4 py-2 text-left text-sm font-medium text-gray-500"
              >平均分数</view
            >
            <view
              class="w-1/5 px-4 py-2 text-left text-sm font-medium text-gray-500"
              >参考结果</view
            >
            <view
              class="w-1/5 px-4 py-2 text-left text-sm font-medium text-gray-500"
              >数值范围</view
            >
          </view>
          <view
            v-for="factor in factors"
            :key="factor.name"
            class="flex items-center border-b border-gray-200 h-[56px]"
          >
            <view class="w-1/5 px-4 py-2 text-sm text-gray-900">{{
              factor.name
            }}</view>
            <view class="w-1/5 px-4 py-2 text-sm text-gray-900">{{
              factor.score
            }}</view>
            <view class="w-1/5 px-4 py-2 text-sm text-gray-900">{{
              factor.average
            }}</view>
            <view class="w-1/5 px-4 py-2">
              <view class="flex flex-wrap gap-2" v-if="factor.result">
                <text
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    getSeverityClass(factor.severity),
                  ]"
                >
                  {{ factor.severity }}
                </text>
              </view>
            </view>
            <view class="w-1/5 px-4 py-2 text-sm text-gray-900">{{
              factor.range
            }}</view>
          </view>
        </view>
      </view>

      <view class="bg-gray-50 p-4">
        <text class="text-sm text-gray-600">
          说明：由于量表只是辅助筛查工具，因此量表测试结果仅供参考。
        </text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
export default {
  name: "Scl90ResultView",
};
</script>

<script setup lang="ts">
import type { SCL90Result } from "@/types/result";

const props = defineProps<{
  result: SCL90Result;
}>();

// Update summary results based on decoded data
const summaryResults = [
  {
    name: "总分",
    score: props.result.totalScore,
    result: props.result.totalScore >= 160 ? "阳性" : undefined,
    range: "90~450",
  },
  {
    name: "总症状指数",
    score: props.result.totalSymptomIndex,
    range: "1~5",
  },
  {
    name: "阳性症状项目数",
    score: props.result.positiveItemCount,
    result: props.result.positiveItemCount >= 43 ? "阳性" : undefined,
    range: "0~90",
  },
  {
    name: "阳性症状均分",
    score: props.result.positiveSymptomDistressIndex,
    range: "0~5",
  },
];

// Update factors based on decoded data
const factors = [
  {
    name: "躯体化",
    score: props.result.factorScores.somatization,
    average: Number((props.result.factorScores.somatization / 12).toFixed(2)),
    result:
      props.result.factorScores.somatization / 12 >= 2 ? "有症状" : undefined,
    severity: getSeverity(props.result.factorScores.somatization / 12),
    range: "12~60",
  },
  {
    name: "强迫症状",
    score: props.result.factorScores.obsessiveCompulsive,
    average: Number(
      (props.result.factorScores.obsessiveCompulsive / 10).toFixed(2)
    ),
    result:
      props.result.factorScores.obsessiveCompulsive / 10 >= 2
        ? "有症状"
        : undefined,
    severity: getSeverity(props.result.factorScores.obsessiveCompulsive / 10),
    range: "10~50",
  },
  {
    name: "人际敏感",
    score: props.result.factorScores.interpersonalSensitivity,
    average: Number(
      (props.result.factorScores.interpersonalSensitivity / 9).toFixed(2)
    ),
    result:
      props.result.factorScores.interpersonalSensitivity / 9 >= 2
        ? "有症状"
        : undefined,
    severity: getSeverity(
      props.result.factorScores.interpersonalSensitivity / 9
    ),
    range: "9~45",
  },
  {
    name: "抑郁",
    score: props.result.factorScores.depression,
    average: Number((props.result.factorScores.depression / 13).toFixed(2)),
    result:
      props.result.factorScores.depression / 13 >= 2 ? "有症状" : undefined,
    severity: getSeverity(props.result.factorScores.depression / 13),
    range: "13~65",
  },
  {
    name: "焦虑",
    score: props.result.factorScores.anxiety,
    average: Number((props.result.factorScores.anxiety / 10).toFixed(2)),
    result: props.result.factorScores.anxiety / 10 >= 2 ? "有症状" : undefined,
    severity: getSeverity(props.result.factorScores.anxiety / 10),
    range: "10~50",
  },
  {
    name: "敌对",
    score: props.result.factorScores.hostility,
    average: Number((props.result.factorScores.hostility / 6).toFixed(2)),
    result: props.result.factorScores.hostility / 6 >= 2 ? "有症状" : undefined,
    severity: getSeverity(props.result.factorScores.hostility / 6),
    range: "6~30",
  },
  {
    name: "恐怖",
    score: props.result.factorScores.phobicAnxiety,
    average: Number((props.result.factorScores.phobicAnxiety / 7).toFixed(2)),
    result:
      props.result.factorScores.phobicAnxiety / 7 >= 2 ? "有症状" : undefined,
    severity: getSeverity(props.result.factorScores.phobicAnxiety / 7),
    range: "7~35",
  },
  {
    name: "偏执",
    score: props.result.factorScores.paranoidIdeation,
    average: Number(
      (props.result.factorScores.paranoidIdeation / 6).toFixed(2)
    ),
    result:
      props.result.factorScores.paranoidIdeation / 6 >= 2
        ? "有症状"
        : undefined,
    severity: getSeverity(props.result.factorScores.paranoidIdeation / 6),
    range: "6~30",
  },
  {
    name: "精神病性",
    score: props.result.factorScores.psychoticism,
    average: Number((props.result.factorScores.psychoticism / 10).toFixed(2)),
    result:
      props.result.factorScores.psychoticism / 10 >= 2 ? "有症状" : undefined,
    severity: getSeverity(props.result.factorScores.psychoticism / 10),
    range: "10~50",
  },
  {
    name: "其它",
    score: props.result.factorScores.additionalItems,
    average: Number((props.result.factorScores.additionalItems / 7).toFixed(2)),
    result:
      props.result.factorScores.additionalItems / 7 >= 2 ? "有症状" : undefined,
    severity: getSeverity(props.result.factorScores.additionalItems / 7),
    range: "7~35",
  },
];

function getSeverity(score: number) {
  if (score >= 4) {
    return "重度";
  } else if (score >= 3) {
    return "中度";
  } else if (score >= 1) {
    return "轻度";
  } else {
    return "无症状";
  }
}

function getSeverityClass(severity: string) {
  switch (severity) {
    case "重度":
      return "bg-red-100 text-red-800";
    case "中度":
      return "bg-yellow-100 text-yellow-800";
    case "轻度":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
</script>
