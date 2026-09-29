import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, StatCard, pct } from "@/components/AppShell";
import { modelData } from "@/lib/ml/predict";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Model Performance — Stroke Analysis System" },
      { name: "description", content: "Accuracy, precision, recall, F1 score and confusion matrix of the Logistic Regression stroke model." },
      { property: "og:title", content: "Model Performance — Stroke Analysis System" },
      { property: "og:description", content: "Held-out test metrics for the Logistic Regression stroke-risk model." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Performance,
});

function Performance() {
  const m = modelData.metrics;
  const cm = m.confusion_matrix;
  const cells = [
    { l: "True Negative", v: cm.tn, good: true }, { l: "False Positive", v: cm.fp, good: false },
    { l: "False Negative", v: cm.fn, good: false }, { l: "True Positive", v: cm.tp, good: true },
  ];
  const scores = [
    { metric: "Accuracy", score: +(m.accuracy * 100).toFixed(1) },
    { metric: "Precision", score: +(m.precision * 100).toFixed(1) },
    { metric: "Recall", score: +(m.recall * 100).toFixed(1) },
    { metric: "F1", score: +(m.f1_score * 100).toFixed(1) },
    { metric: "ROC AUC", score: +(m.roc_auc * 100).toFixed(1) },
  ];
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Accuracy" title="Model performance">
        These metrics are calculated from the held-out test dataset ({m.test_size.toLocaleString()} records, 20% stratified split).
        They demonstrate model performance for this dataset and do not represent clinical validation.
      </PageHeader>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Accuracy" value={pct(m.accuracy)} />
        <StatCard label="Precision" value={pct(m.precision)} />
        <StatCard label="Recall" value={pct(m.recall)} />
        <StatCard label="F1 Score" value={pct(m.f1_score)} />
        <StatCard label="ROC AUC" value={m.roc_auc.toFixed(3)} />
      </div>
      <section className="rounded-lg border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Held-out evaluation</p><h2 className="mt-1 font-display text-xl font-semibold">Metric comparison</h2></div><span className="text-xs text-muted-foreground">Scores shown as percentages</span></div>
        <div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={scores} layout="vertical" margin={{ left: 8 }}><CartesianGrid horizontal={false} stroke="var(--border)" /><XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} unit="%" fontSize={12} /><YAxis type="category" dataKey="metric" width={72} tickLine={false} axisLine={false} fontSize={12} /><Tooltip formatter={(value) => `${value}%`} /><Bar dataKey="score" fill="var(--chart-1)" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></div>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-semibold">Confusion Matrix</h2>
          <div className="mt-4 grid grid-cols-[auto_1fr_1fr] gap-2 text-sm">
            <div />
            <div className="text-center text-xs text-muted-foreground">Predicted: No Stroke</div>
            <div className="text-center text-xs text-muted-foreground">Predicted: Stroke</div>
            {[0, 1].map((row) => (
              <Fragment key={row}>
                <div className="self-center pr-2 text-xs text-muted-foreground">Actual: {row ? "Stroke" : "No Stroke"}</div>
                {cells.slice(row * 2, row * 2 + 2).map((c) => (
                  <div key={c.l} className={`rounded-md border p-4 text-center ${c.good ? "border-success/30 bg-success/10 text-success" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
                    <div className="font-mono text-2xl font-semibold tabular-nums">{c.v}</div>
                    <div className="text-xs text-muted-foreground">{c.l}</div>
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </section>
         <section className="rounded-lg border border-border bg-card p-6 text-sm leading-relaxed shadow-card">
          <h2 className="font-semibold">How to read these numbers</h2>
          <p className="mt-3 text-muted-foreground">
            Only about 5% of records are stroke cases. The model is trained with balanced class weights so it
            prioritises <strong className="text-foreground">recall</strong> — catching true stroke cases — at the cost of more false alarms,
            which lowers precision and accuracy. For a screening tool this trade-off is preferred over a model
            that simply predicts "no stroke" for everyone (which would score ~95% accuracy but 0% recall).
          </p>
          <p className="mt-3 text-muted-foreground">
            Pipeline: median imputation → StandardScaler (numerical) + OneHotEncoder (categorical) → LogisticRegression(max_iter=1000).
            All preprocessing is fitted on the {m.train_size.toLocaleString()} training records only.
          </p>
        </section>
      </div>
    </div>
  );
}
