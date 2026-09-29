// Logistic Regression inference using parameters trained in ml/train_model.py
// (scikit-learn: SimpleImputer + StandardScaler + OneHotEncoder + LogisticRegression).
// Equivalent to pipeline.predict_proba() — no rules, no randomness.
import model from "./model.json";

export type PatientInput = {
  gender: string;
  age: number;
  hypertension: 0 | 1;
  heart_disease: 0 | 1;
  ever_married: string;
  work_type: string;
  Residence_type: string;
  avg_glucose_level: number;
  bmi: number | null;
  smoking_status: string;
};

export type PredictionResult = {
  prediction: 0 | 1;
  risk_probability: number;
  model: string;
};

export const modelData = model;
export const CATEGORIES = model.categories as Record<string, string[]>;

export function predictStroke(input: PatientInput): PredictionResult {
  const x: number[] = [];
  const { numerical, categorical } = model.features;
  numerical.forEach((f, i) => {
    let v = (input as unknown as Record<string, number | null>)[f];
    if (v === null || v === undefined || Number.isNaN(v))
      v = (model.imputer_medians as Record<string, number>)[f];
    x.push(((v ?? 0) - model.scaler.mean[i]!) / model.scaler.scale[i]!);
  });
  categorical.forEach((f) => {
    const val = (input as unknown as Record<string, string>)[f];
    for (const c of CATEGORIES[f] ?? []) x.push(c === val ? 1 : 0); // unknown -> all zeros
  });
  const z = x.reduce((s, v, i) => s + v * model.coef[i]!, model.intercept);
  const p = 1 / (1 + Math.exp(-z));
  return { prediction: p >= 0.5 ? 1 : 0, risk_probability: p, model: model.model };
}
