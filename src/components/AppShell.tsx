import { Link } from "@tanstack/react-router";
import { Activity, BarChart3, BriefcaseMedical, Database, Info, LayoutDashboard, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/analysis", label: "Analyze", icon: Activity },
  { to: "/services", label: "Services", icon: BriefcaseMedical },
  { to: "/performance", label: "Accuracy", icon: BarChart3 },
  { to: "/insights", label: "Insights", icon: Database },
  { to: "/about", label: "About", icon: Info },
] as const;

function NavLinks({ onNav }: { onNav?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNav}
          activeOptions={{ exact: true }}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          activeProps={{ className: "!bg-sidebar-primary !text-sidebar-primary-foreground" }}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <img src="/stroke-logo.svg" alt="StrokeCare AI logo" className="h-9 w-9 shrink-0 rounded-md bg-white object-cover" />
      <div className="min-w-0 leading-tight">
        <div className="truncate font-display text-sm font-semibold">StrokeCare AI</div>
        <div className="truncate text-xs text-sidebar-foreground/60">Clinical risk workspace</div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground lg:flex">
        <Brand />
        <div className="mt-8 flex-1">
          <NavLinks />
        </div>
        <p className="text-xs leading-relaxed text-sidebar-foreground/55">
          Educational tool only. Not a medical diagnosis.
        </p>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <Brand />
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 hover:bg-sidebar-accent"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {open && (
        <div className="sticky top-[61px] z-20 border-b border-sidebar-border bg-sidebar p-3 lg:hidden">
          <NavLinks onNav={() => setOpen(false)} />
        </div>
      )}

      <div className="lg:pl-64">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        <footer className="mx-auto max-w-7xl border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-10">
          Stroke Analysis System · Logistic Regression · Academic ML project · For educational
          purposes only — not a substitute for professional medical advice.
        </footer>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 border-b border-border pb-6">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</div>
      <h1 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
      {children && <p className="mt-3 max-w-2xl text-muted-foreground">{children}</p>}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 font-mono text-3xl font-semibold tabular-nums text-card-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Disclaimer() {
  return (
    <div role="note" className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
      <strong className="font-semibold">Medical disclaimer.</strong> This system provides a
      model-based preliminary risk estimate for educational purposes only. It does not diagnose
      stroke and must not replace consultation with a qualified healthcare professional. If you
      suspect a stroke, seek emergency medical care immediately.
    </div>
  );
}

export const pct = (v: number, d = 2) => `${(v * 100).toFixed(d)}%`;
