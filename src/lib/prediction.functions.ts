import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CATEGORIES, predictStroke } from "./ml/predict";

const oneOf = (key: string) =>
  z.string().refine((v) => (CATEGORIES[key] ?? []).includes(v), `Invalid ${key}`);

export const patientSchema = z.object({
  gender: oneOf("gender"),
  age: z.number().min(0, "Age must be between 0 and 120.").max(120, "Age must be between 0 and 120."),
  hypertension: z.union([z.literal(0), z.literal(1)]),
  heart_disease: z.union([z.literal(0), z.literal(1)]),
  ever_married: oneOf("ever_married"),
  work_type: oneOf("work_type"),
  Residence_type: oneOf("Residence_type"),
  avg_glucose_level: z.number().min(0, "Glucose level must be greater than or equal to 0.").max(500),
  bmi: z.number().min(0, "BMI must be between 0 and 70.").max(70, "BMI must be between 0 and 70.").nullable(),
  smoking_status: oneOf("smoking_status"),
});

// POST /predict equivalent
export const predict = createServerFn({ method: "POST" })
  .validator((data) => patientSchema.parse(data))
  .handler(async ({ data }) => predictStroke(data));
