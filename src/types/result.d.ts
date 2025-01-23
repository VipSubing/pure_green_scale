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
