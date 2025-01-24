export interface SCL90Result {
  totalScore: number;
  totalSymptomIndex: number;
  positiveItemCount: number;
  positiveSymptomDistressIndex: number;
  factorScores: SCL90FactorScores;
}

export interface SCL90FactorScores {
  somatization: number;
  obsessiveCompulsive: number;
  interpersonalSensitivity: number;
  depression: number;
  anxiety: number;
  hostility: number;
  phobicAnxiety: number;
  paranoidIdeation: number;
  psychoticism: number;
  additionalItems: number;
}

export interface ComputeResult {
  score: number;
  level: string;
  summary: string;
}

export interface FivePersonalyResult {
  scores: {
    N: number; // 神经质
    E: number; // 外向性
    O: number; // 开放性
    A: number; // 宜人性
    C: number; // 尽责性
  };
  result: string[]; // 各维度的描述性结果
}
