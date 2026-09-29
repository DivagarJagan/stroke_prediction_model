import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, BarChart3, Database, HeartPulse, ShieldCheck } from "lucide-react";
import { Disclaimer, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Stroke Analysis System" },
      { name: "description", content: "Explore patient risk analysis, model accuracy reporting, and dataset insight services." },
      { property: "og:title", content: "Services — Stroke Analysis System" },
      { property: "og:description", content: "Patient analysis and transparent machine-learning evaluation in one clinical dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Services,
});

const SERVICES = [
  {
    icon: Activity,
    title: "Patient Risk Analysis",
    text: "Enter ten routine health factors to receive a preliminary model-based stroke-risk estimate.",
    to: "/analysis" as const,
    action: "Start analysis",
  },
  {
    icon: BarChart3,
    title: "Accuracy Evaluation",
    text: "Review accuracy, recall, precision, F1 score, ROC AUC, and the full confusion matrix.",
    to: "/performance" as const,
    action: "View accuracy",
  },
  {
    icon: Database,
    title: "Dataset Insights",
    text: "Explore case distribution, age-group trends, and the missing values handled during training.",
    to: "/insights" as const,
    action: "Explore insights",
  },
];

function Services() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Clinical workspace" title="Analysis services">
        A focused set of tools for preliminary stroke-risk screening and transparent model review.
      </PageHeader>

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Available services">
        {SERVICES.map(({ icon: Icon, title, text, to, action }, index) => (
          <article key={title} className="flex min-h-64 flex-col rounded-lg border border-border bg-card p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <span className="font-mono text-xs font-semibold text-muted-foreground">0{index + 1}</span>
            </div>
            <h2 className="mt-6 font-display text-xl font-semibold text-card-foreground">{title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
            <Button asChild variant="outline" className="mt-6 w-full justify-between">
              <Link to={to}>{action}<ArrowRight aria-hidden /></Link>
            </Button>
          </article>
        ))}
      </section>

      <section className="grid gap-4 border-y border-border py-6 sm:grid-cols-3">
        <div className="flex gap-3"><HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h2 className="text-sm font-semibold">Fast assessment</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Results are calculated in seconds after all fields are validated.</p></div></div>
        <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" /><div><h2 className="text-sm font-semibold">Transparent output</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Every result includes its probability and the model used.</p></div></div>
        <div className="flex gap-3"><Database className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><h2 className="text-sm font-semibold">Evidence visible</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Training statistics and test performance remain available for review.</p></div></div>
      </section>
      <Disclaimer />
    </div>
  );
}