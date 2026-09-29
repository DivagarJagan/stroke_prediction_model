import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, StatCard, pct } from "@/components/AppShell";
import { modelData } from "@/lib/ml/predict";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Dataset Insights — Stroke Analysis System" },
      { name: "description", content: "Statistics of the 5,110-record stroke dataset: target distribution, missing values and stroke rate by age." },
      { property: "og:title", content: "Dataset Insights — Stroke Analysis System" },
      { property: "og:description", content: "Explore the stroke dataset behind the Logistic Regression model." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Insights,
});

function Insights() {
  const d = modelData.dataset;
  const target = [
    { name: "No Stroke", value: d.non_stroke_cases, color: "var(--chart-3)" },
    { name: "Stroke", value: d.stroke_cases, color: "var(--chart-2)" },
  ];
  const ages = Object.entries(d.stroke_rate_by_age).map(([k, v]) => ({ age: k, rate: +(v * 100).toFixed(2) }));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Data" title="Dataset Insights">
        Computed from stroke_data.csv during model training.
      </PageHeader>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Records" value={d.total_records.toLocaleString()} />
        <StatCard label="Total Features" value={d.feature_count} />
        <StatCard label="Stroke Cases" value={d.stroke_cases} />
        <StatCard label="Non-Stroke Cases" value={d.non_stroke_cases.toLocaleString()} />
        <StatCard label="Missing BMI Handled" value={d.missing_values_handled.bmi} hint="Median imputation" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-semibold">Target Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={target} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {target.map((t) => <Cell key={t.name} fill={t.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            {target.map((t) => (
              <div key={t.name} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ background: t.color }} />
                {t.name} · {pct(t.value / d.total_records, 1)}
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-semibold">Stroke Rate by Age Group (%)</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={ages}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="age" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" fill="var(--chart-2)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className="rounded-lg border border-border bg-card p-6 text-sm shadow-card">
        <h2 className="font-semibold">Missing Values Handled</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
          <li><strong className="text-foreground">{d.missing_values_handled.bmi}</strong> missing BMI values — filled with the training-set median.</li>
          <li><strong className="text-foreground">{d.missing_values_handled.smoking_status_unknown.toLocaleString()}</strong> "Unknown" smoking statuses — kept as their own category.</li>
          <li>The <code>id</code> column is removed before training.</li>
        </ul>
      </section>
    </div>
  );
}
