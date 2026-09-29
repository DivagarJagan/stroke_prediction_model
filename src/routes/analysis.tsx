import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, Loader2, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Disclaimer, PageHeader, pct } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useHistory } from "@/lib/history";
import type { PatientInput, PredictionResult } from "@/lib/ml/predict";
import { patientSchema, predict } from "@/lib/prediction.functions";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Patient Analysis — Stroke Analysis System" },
      { name: "description", content: "Enter patient health information to get a preliminary Logistic Regression stroke-risk estimate." },
      { property: "og:title", content: "Patient Analysis — Stroke Analysis System" },
      { property: "og:description", content: "Model-based preliminary stroke-risk estimate from ten patient parameters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Analysis,
});

type Form = Record<keyof PatientInput, string>;
const EMPTY: Form = {
  gender: "", age: "", hypertension: "", heart_disease: "", ever_married: "",
  work_type: "", Residence_type: "", avg_glucose_level: "", bmi: "", smoking_status: "",
};

const LABELS: Record<string, string> = {
  Govt_job: "Government Job", Never_worked: "Never Worked", Private: "Private",
  "Self-employed": "Self-employed", children: "Child", Unknown: "Unknown",
  "formerly smoked": "Formerly Smoked", "never smoked": "Never Smoked", smokes: "Currently Smokes",
};
const label = (v: string) => LABELS[v] ?? v;

const SELECTS: { key: keyof Form; title: string; options: [string, string][] }[] = [
  { key: "gender", title: "Gender", options: [["Male", "Male"], ["Female", "Female"], ["Other", "Other"]] },
  { key: "hypertension", title: "Hypertension", options: [["0", "No"], ["1", "Yes"]] },
  { key: "heart_disease", title: "Heart Disease", options: [["0", "No"], ["1", "Yes"]] },
  { key: "ever_married", title: "Ever Married", options: [["Yes", "Yes"], ["No", "No"]] },
  { key: "work_type", title: "Work Type", options: ["Private", "Self-employed", "Govt_job", "children", "Never_worked"].map((v) => [v, label(v)]) },
  { key: "Residence_type", title: "Residence Type", options: [["Urban", "Urban"], ["Rural", "Rural"]] },
  { key: "smoking_status", title: "Smoking Status", options: ["never smoked", "formerly smoked", "smokes", "Unknown"].map((v) => [v, label(v)]) },
];

const inputCls =
  "mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25 aria-[invalid=true]:border-destructive";

function Analysis() {
  const predictFn = useServerFn(predict);
  const { items, add, clear } = useHistory();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ input: PatientInput; out: PredictionResult } | null>(null);

  const set = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const req: Record<string, string> = {};
    (Object.keys(EMPTY) as (keyof Form)[]).forEach((k) => {
      if (k !== "bmi" && form[k].trim() === "") req[k] = "This field is required.";
    });
    const candidate = {
      ...form,
      age: Number(form.age),
      avg_glucose_level: Number(form.avg_glucose_level),
      bmi: form.bmi.trim() === "" ? null : Number(form.bmi),
      hypertension: Number(form.hypertension),
      heart_disease: Number(form.heart_disease),
    };
    const parsed = patientSchema.safeParse(candidate);
    if (!parsed.success) parsed.error.issues.forEach((i) => { const k = String(i.path[0]); if (!req[k]) req[k] = i.message; });
    if (Object.keys(req).length) {
      setErrors(req);
      toast.error("Please correct the highlighted fields.");
      return;
    }
    setLoading(true);
    try {
      const input = parsed.data! as PatientInput;
      const out = await predictFn({ data: input });
      setResult({ input, out });
      add({
        timestamp: new Date().toISOString(), age: input.age, gender: input.gender,
        glucose: input.avg_glucose_level, bmi: input.bmi, prediction: out.prediction, risk: out.risk_probability,
      });
      toast.success("Prediction generated successfully.");
      setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      toast.error("The prediction service is currently unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Patient Analysis" title="Patient Health Information">
        Complete all fields. BMI may be left empty — it will be filled with the training-set median,
        exactly as during model training.
      </PageHeader>

       <form onSubmit={onSubmit} noValidate className="rounded-lg border border-border bg-card p-5 shadow-card sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Field id="age" title="Age (years)" error={errors["age"]}>
            <input id="age" type="number" inputMode="decimal" min={0} max={120} step="any" value={form.age} onChange={(e) => set("age", e.target.value)} aria-invalid={!!errors["age"]} className={inputCls} placeholder="e.g. 45" />
          </Field>
          <Field id="avg_glucose_level" title="Average Glucose Level (mg/dL)" error={errors["avg_glucose_level"]}>
            <input id="avg_glucose_level" type="number" inputMode="decimal" min={0} step="any" value={form.avg_glucose_level} onChange={(e) => set("avg_glucose_level", e.target.value)} aria-invalid={!!errors["avg_glucose_level"]} className={inputCls} placeholder="e.g. 105.5" />
          </Field>
          <Field id="bmi" title="BMI (optional)" error={errors["bmi"]}>
            <input id="bmi" type="number" inputMode="decimal" min={0} max={70} step="any" value={form.bmi} onChange={(e) => set("bmi", e.target.value)} aria-invalid={!!errors["bmi"]} className={inputCls} placeholder="e.g. 27.4" />
          </Field>
          {SELECTS.map((s) => (
            <Field key={s.key} id={s.key} title={s.title} error={errors[s.key]}>
              <select id={s.key} value={form[s.key]} onChange={(e) => set(s.key, e.target.value)} aria-invalid={!!errors[s.key]} className={inputCls}>
                <option value="">Select…</option>
                {s.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
          ))}
        </div>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
           <Button type="button" variant="outline" size="lg" onClick={() => { setForm(EMPTY); setErrors({}); }}>
            Reset
           </Button>
           <Button type="submit" disabled={loading} size="lg">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <><Search className="h-4 w-4" /> Predict Stroke Risk</>}
           </Button>
        </div>
      </form>

      {result && <Result input={result.input} out={result.out} />}

      <History items={items} clear={clear} />
      <Disclaimer />
    </div>
  );
}

function Field({ id, title, error, children }: { id: string; title: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-foreground">{title}</label>
      {children}
      {error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Gauge({ value, high }: { value: number; high: boolean }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90" role="img" aria-label={`Estimated risk ${pct(value)}`}>
      <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-muted" />
      <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value)}
        className={high ? "stroke-destructive" : "stroke-success"} style={{ transition: "stroke-dashoffset 700ms ease" }} />
    </svg>
  );
}

function Result({ input, out }: { input: PatientInput; out: PredictionResult }) {
  const high = out.prediction === 1;
  const rows: [string, string][] = [
    ["Age", String(input.age)], ["Gender", input.gender],
    ["Hypertension", input.hypertension ? "Yes" : "No"], ["Heart Disease", input.heart_disease ? "Yes" : "No"],
    ["BMI", input.bmi === null ? "Not provided (median used)" : String(input.bmi)],
    ["Glucose Level", `${input.avg_glucose_level} mg/dL`], ["Smoking Status", label(input.smoking_status)],
    ["Work Type", label(input.work_type)], ["Residence Type", input.Residence_type], ["Ever Married", input.ever_married],
  ];
  return (
    <section id="result" aria-live="polite" className="grid gap-4 lg:grid-cols-5">
       <div className={`rounded-lg border p-6 shadow-card lg:col-span-2 ${high ? "border-destructive/40 bg-destructive/5" : "border-success/40 bg-success/5"}`}>
        <div className={`flex items-center gap-2 font-semibold ${high ? "text-destructive" : "text-success"}`}>
          {high ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          {high ? "Higher Predicted Stroke Risk" : "Lower Predicted Stroke Risk"}
        </div>
        <div className="relative mx-auto mt-6 grid h-40 w-40 place-items-center">
          <div className="absolute inset-0"><Gauge value={out.risk_probability} high={high} /></div>
          <div className="text-center">
            <div className="font-mono text-3xl font-semibold tabular-nums">{pct(out.risk_probability)}</div>
            <div className="text-xs text-muted-foreground">Estimated risk</div>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">Model-based preliminary risk estimate — not a diagnosis.</p>
      </div>
       <div className="rounded-lg border border-border bg-card p-6 shadow-card lg:col-span-3">
        <h2 className="font-semibold">Model Result</h2>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-muted-foreground">Prediction</dt><dd className="font-medium">{high ? "Higher Risk (1)" : "Lower Risk (0)"}</dd></div>
          <div><dt className="text-muted-foreground">Risk Probability</dt><dd className="font-mono font-medium">{pct(out.risk_probability)}</dd></div>
          <div><dt className="text-muted-foreground">Model Used</dt><dd className="font-medium">{out.model}</dd></div>
        </dl>
        <h2 className="mt-6 font-semibold">Patient Input Summary</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          {rows.map(([k, v]) => (
            <div key={k} className="min-w-0"><dt className="text-muted-foreground">{k}</dt><dd className="truncate font-medium">{v}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function History({ items, clear }: { items: ReturnType<typeof useHistory>["items"]; clear: () => void }) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-card">
      <div className="flex items-center justify-between gap-4 border-b border-border p-5">
        <div className="min-w-0">
          <h2 className="font-semibold">Prediction History</h2>
          <p className="text-xs text-muted-foreground">Stored in this browser session only.</p>
        </div>
        {items.length > 0 && (
          <Button onClick={clear} variant="outline" size="sm">
            <Trash2 className="h-4 w-4" /> Clear History
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">No predictions yet. Submit the form above to see your history here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>{["Time", "Age", "Gender", "Glucose", "BMI", "Result", "Risk"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.timestamp} className="border-t border-border">
                  <td className="px-5 py-3 font-mono">{new Date(i.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-5 py-3">{i.age}</td>
                  <td className="px-5 py-3">{i.gender}</td>
                  <td className="px-5 py-3">{i.glucose}</td>
                  <td className="px-5 py-3">{i.bmi ?? "—"}</td>
                  <td className={`px-5 py-3 font-medium ${i.prediction ? "text-destructive" : "text-success"}`}>{i.prediction ? "Higher Risk" : "Lower Risk"}</td>
                  <td className="px-5 py-3 font-mono">{pct(i.risk, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
