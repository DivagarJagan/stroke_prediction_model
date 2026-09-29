import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, AlertTriangle, ArrowRight, BarChart3, CheckCircle2, Database, HeartPulse } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Disclaimer, PageHeader, pct } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { modelData } from "@/lib/ml/predict";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Stroke Analysis System" },
      { name: "description", content: "AI-based preliminary stroke risk analysis dashboard with dataset and Logistic Regression model statistics." },
      { property: "og:title", content: "Dashboard — Stroke Analysis System" },
      { property: "og:description", content: "Preliminary stroke-risk analysis powered by a trained Logistic Regression model." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const d = modelData.dataset;
  const m = modelData.metrics;
  const distribution = [
    { name: "Healthy records", value: d.non_stroke_cases, color: "var(--chart-3)" },
    { name: "Stroke records", value: d.stroke_cases, color: "var(--chart-2)" },
  ];
  const ageRisk = Object.entries(d.stroke_rate_by_age).map(([age, rate]) => ({ age, risk: +(rate * 100).toFixed(1) }));
  return (
    <div className="space-y-8">
      <section className="border-b border-border pb-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">AI-assisted clinical screening</div>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold text-foreground sm:text-5xl">Stroke risk intelligence, made clear.</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">Analyze routine patient health parameters and review a transparent preliminary risk estimate powered by Logistic Regression.</p>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/analysis">Start patient analysis <ArrowRight aria-hidden /></Link>
          </Button>
        </div>
      </section>

      <section aria-label="Health and model KPIs" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={CheckCircle2} label="Healthy records" value={d.non_stroke_cases.toLocaleString()} note={`${pct(d.non_stroke_cases / d.total_records, 1)} of dataset`} tone="healthy" />
        <Kpi icon={AlertTriangle} label="Danger records" value={d.stroke_cases.toLocaleString()} note={`${pct(d.stroke_cases / d.total_records, 1)} of dataset`} tone="danger" />
        <Kpi icon={BarChart3} label="Model accuracy" value={pct(m.accuracy, 1)} note={`${m.test_size.toLocaleString()} test records`} tone="primary" />
        <Kpi icon={HeartPulse} label="Stroke recall" value={pct(m.recall, 1)} note="Detected positive cases" tone="primary" />
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <article className="rounded-lg border border-border bg-card p-6 shadow-card xl:col-span-2">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Dataset status</p><h2 className="mt-1 font-display text-xl font-semibold">Clinical record mix</h2></div><Database className="h-5 w-5 text-muted-foreground" /></div>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>{distribution.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <div className="flex flex-wrap justify-center gap-5 text-xs">{distribution.map((item) => <span key={item.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />{item.name}</span>)}</div>
        </article>
        <article className="rounded-lg border border-border bg-card p-6 shadow-card xl:col-span-3">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Risk trend</p><h2 className="mt-1 font-display text-xl font-semibold">Stroke rate by age group</h2></div><Activity className="h-5 w-5 text-muted-foreground" /></div>
          <div className="mt-5 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={ageRisk}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="age" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} unit="%" /><Tooltip formatter={(value) => `${value}%`} /><Bar dataKey="risk" fill="var(--chart-1)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickLink to="/analysis" icon={Activity} title="Analyze a patient" text="Enter ten health factors and calculate a preliminary risk estimate." />
        <QuickLink to="/performance" icon={BarChart3} title="Review accuracy" text="Inspect recall, precision, F1, ROC AUC, and prediction outcomes." />
        <QuickLink to="/services" icon={Database} title="Explore services" text="See every analysis and reporting capability in this workspace." />
      </section>
      <Disclaimer />
    </div>
  );
}

function Kpi({ icon: Icon, label, value, note, tone }: { icon: typeof Activity; label: string; value: string; note: string; tone: "healthy" | "danger" | "primary" }) {
  const classes = tone === "healthy" ? "border-success/35 bg-success/5 text-success" : tone === "danger" ? "border-destructive/35 bg-destructive/5 text-destructive" : "border-primary/25 bg-card text-primary";
  return <article className={`rounded-lg border p-5 shadow-card ${classes}`}><div className="flex items-center justify-between"><span className="text-sm font-medium text-foreground">{label}</span><Icon className="h-5 w-5" aria-hidden /></div><div className="mt-5 font-mono text-3xl font-semibold tabular-nums text-foreground">{value}</div><p className="mt-1 text-xs text-muted-foreground">{note}</p></article>;
}

function QuickLink({ to, icon: Icon, title, text }: { to: "/analysis" | "/performance" | "/services"; icon: typeof Activity; title: string; text: string }) {
  return <Link to={to} className="group rounded-lg border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/50"><Icon className="h-5 w-5 text-primary" /><div className="mt-4 flex items-center justify-between gap-3"><h2 className="font-semibold">{title}</h2><ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" /></div><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></Link>;
}
