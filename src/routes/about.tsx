import { createFileRoute } from "@tanstack/react-router";
import { Disclaimer, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Stroke Analysis System" },
      { name: "description", content: "About the Stroke Analysis System: objective, Logistic Regression model, technologies and medical disclaimer." },
      { property: "og:title", content: "About — Stroke Analysis System" },
      { property: "og:description", content: "An academic machine-learning project for preliminary stroke-risk screening." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const SECTIONS = [
  ["Project", "The Stroke Analysis System is an academic machine-learning project that estimates a patient's preliminary stroke risk from routine health parameters."],
  ["Objective", "Demonstrate a complete, leak-free ML workflow — from raw dataset to a trained model served through a web application — with honest evaluation."],
  ["Machine Learning Model", "Logistic Regression (scikit-learn, max_iter=1000, balanced class weights). Numerical features are median-imputed and standardised with StandardScaler; categorical features are one-hot encoded with handle_unknown=\"ignore\". All preprocessing is fitted on the training split only (80/20, stratified). The learned coefficients are served by the prediction API, which computes predict_proba exactly."],
  ["Technologies", "Python · pandas · scikit-learn for training. React · TypeScript · TanStack Start · Tailwind CSS · Recharts for the web application."],
];

function About() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="About" title="About this project" />
      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map(([t, b]) => (
          <section key={t} className="rounded-lg border border-border bg-card p-6 shadow-card">
            <h2 className="font-semibold">{t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b}</p>
          </section>
        ))}
      </div>
      <Disclaimer />
    </div>
  );
}
