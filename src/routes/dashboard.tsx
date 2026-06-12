import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Plant3DGrid } from "@/components/flora/Plant3DGrid";
import { RadialGauge } from "@/components/flora/RadialGauge";
import { SENSORS, useFlora, formatAgo } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Flora AI" },
      { name: "description", content: "Mission control for your living garden." },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const readings = useFlora((s) => s.readings);
  const plants = useFlora((s) => s.plants);
  const activity = useFlora((s) => s.activity);
  const waterAll = useFlora((s) => s.waterAll);
  const pushActivity = useFlora((s) => s.pushActivity);
  const [night, setNight] = useState(false);

  const avgHealth = useMemo(
    () => Math.round(plants.reduce((s, p) => s + p.health, 0) / plants.length),
    [plants],
  );

  const [displayHealth, setDisplayHealth] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = displayHealth;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 800);
      setDisplayHealth(start + (avgHealth - start) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avgHealth]);

  const exportReport = () => {
    const lines = [
      "FLORA AI — SYSTEM REPORT",
      `Generated: ${new Date().toISOString()}`,
      `Average health: ${avgHealth}%`,
      "",
      "PLANTS:",
      ...plants.map((p) => `  ${p.name} (${p.species}) — health ${p.health}% — watered ${formatAgo(p.lastWatered)}`),
      "",
      "LATEST READINGS:",
      ...SENSORS.map((s) => `  ${s.label}: ${readings[s.key].at(-1)?.toFixed(1)} ${s.unit}`),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flora-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
    pushActivity({ icon: "📄", plant: "System", text: "Report exported" });
  };

  const ringPct = displayHealth / 100;
  const R = 50;
  const C = 2 * Math.PI * R;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="text-xs text-muted-foreground tracking-widest uppercase">{new Date().toDateString()}</div>
            <h1 className="text-3xl md:text-4xl mt-1">
              {greeting()}, <span className="neon-text">Botanist</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r={R} stroke="oklch(1 0 0 / 0.06)" strokeWidth="8" fill="none" />
                <circle
                  cx="60" cy="60" r={R}
                  stroke="url(#healthGrad)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${ringPct * C} ${C}`}
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 8px var(--neon))" }}
                />
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.88 0.18 195)" />
                    <stop offset="100%" stopColor="oklch(0.88 0.24 145)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="font-mono text-2xl neon-text">{Math.round(displayHealth)}%</div>
                  <div className="text-[9px] text-muted-foreground tracking-widest">HEALTH</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 glass glass-hot relative overflow-hidden h-[440px]">
            <div className="absolute top-4 left-4 z-10">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Greenhouse</div>
              <div className="text-sm font-mono neon-text">8 organisms · live</div>
            </div>
            <div className="absolute top-4 right-4 z-10 text-[10px] font-mono text-muted-foreground">
              CIRCADIAN · DAY 247
            </div>
            <Plant3DGrid />
          </div>

          <div className="col-span-12 lg:col-span-5 grid grid-cols-3 gap-3">
            {SENSORS.map((s) => (
              <RadialGauge
                key={s.key}
                value={readings[s.key].at(-1) ?? 0}
                min={s.min}
                max={s.max}
                ideal={s.ideal}
                label={s.label}
                unit={s.unit}
              />
            ))}
          </div>
        </div>

        {/* Activity + actions */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Activity Stream</h3>
              <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-2">
                <span className="pulse-dot" />
                LIVE
              </span>
            </div>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2">
              {activity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-white/[0.03] transition"
                >
                  <span className="text-lg">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="text-neon">{a.plant}</span>{" "}
                      <span className="text-muted-foreground">{a.text}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{formatAgo(a.ts)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-3">
            <QuickAction icon="💧" label="Water All" onClick={() => { waterAll(); toast.success("Watering cycle complete"); }} />
            <QuickAction icon="🔬" label="Run Diagnostics" onClick={() => toast.success("Diagnostics complete · all systems nominal")} />
            <QuickAction icon="📄" label="Export Report" onClick={exportReport} />
            <QuickAction icon="🌱" label="Add Plant" onClick={() => toast.info("Open Plants page to add")} />
            <QuickAction
              icon={night ? "☀️" : "🌙"}
              label={night ? "Day Mode" : "Night Mode"}
              wide
              onClick={() => {
                setNight((n) => !n);
                document.documentElement.style.setProperty("--void", night ? "oklch(0.12 0.03 150)" : "oklch(0.06 0.02 150)");
                toast(night ? "Day mode" : "Night mode engaged");
              }}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function QuickAction({ icon, label, onClick, wide }: { icon: string; label: string; onClick: () => void; wide?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`glass glass-hot p-4 text-left group ${wide ? "col-span-2" : ""}`}
    >
      <div className="text-2xl mb-2 transition-transform group-hover:scale-110">{icon}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground group-hover:text-neon transition">
        {label}
      </div>
    </button>
  );
}
