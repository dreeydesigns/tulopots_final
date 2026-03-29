"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ProgressTask = {
  label: string;
  done: boolean;
};

type ProgressPhase = {
  id: string;
  label: string;
  status: "not_started" | "in_progress" | "complete";
  percent: number;
  tasks: ProgressTask[];
};

type ProgressResponse = {
  lastUpdated: string;
  phases: ProgressPhase[];
};

const REFRESH_MS = 30000;

export default function ProgressPage() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/progress", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Unable to load progress data right now.");
      }

      const json = (await response.json()) as ProgressResponse;
      setData(json);
    } catch {
      setError("Unable to fetch build progress. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProgress();
    const interval = window.setInterval(() => {
      void loadProgress();
    }, REFRESH_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadProgress]);

  const overallPercent = useMemo(() => {
    if (!data?.phases.length) {
      return 0;
    }

    const sum = data.phases.reduce((total, phase) => total + phase.percent, 0);
    return Math.round(sum / data.phases.length);
  }, [data]);

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ background: "var(--tp-bg)", color: "var(--tp-text)" }}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <header
          className="rounded-2xl border p-8"
          style={{
            background: "var(--tp-surface)",
            borderColor: "var(--tp-border)"
          }}
        >
          <p className="text-sm uppercase tracking-[0.26em]" style={{ color: "var(--tp-accent)" }}>
            TuloPots Build Progress
          </p>
          <h1 className="mt-3 text-3xl font-semibold" style={{ color: "var(--tp-heading)" }}>
            Master Execution Tracker
          </h1>
          <div className="mt-6">
            <p className="text-sm opacity-80">Overall completion</p>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full" style={{ background: "var(--tp-card)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPercent}%`, background: "var(--tp-accent)" }}
              />
            </div>
            <p className="mt-2 text-sm font-medium">{overallPercent}% complete</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm opacity-80">
            <span>
              Last updated:{" "}
              {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "Waiting for data"}
            </span>
            <button
              type="button"
              onClick={() => {
                void loadProgress();
              }}
              className="rounded-full border px-4 py-2 text-sm transition-opacity hover:opacity-90"
              style={{ borderColor: "var(--tp-border)", background: "var(--tp-card)" }}
            >
              Refresh now
            </button>
          </div>
        </header>

        {isLoading ? <p className="text-sm opacity-80">Loading progress…</p> : null}
        {error ? <p className="text-sm" style={{ color: "var(--tp-accent)" }}>{error}</p> : null}

        <section className="grid gap-5 md:grid-cols-2">
          {data?.phases.map((phase) => (
            <article
              key={phase.id}
              className="rounded-2xl border p-6"
              style={{ background: "var(--tp-surface)", borderColor: "var(--tp-border)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: "var(--tp-heading)" }}>
                    {phase.label}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] opacity-75">{phase.status.replace("_", " ")}</p>
                </div>
                <span
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{ borderColor: "var(--tp-border)", color: "var(--tp-accent)" }}
                >
                  {phase.percent}%
                </span>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--tp-card)" }}>
                <div className="h-full rounded-full" style={{ width: `${phase.percent}%`, background: "var(--tp-accent)" }} />
              </div>

              <ul className="mt-5 space-y-3 text-sm">
                {phase.tasks.map((task) => (
                  <li key={task.label} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs"
                      style={{
                        borderColor: task.done ? "var(--tp-accent)" : "var(--tp-border)",
                        color: task.done ? "var(--tp-accent)" : "var(--tp-text)"
                      }}
                    >
                      {task.done ? "✓" : "•"}
                    </span>
                    <span className="leading-6 opacity-90">{task.label}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
