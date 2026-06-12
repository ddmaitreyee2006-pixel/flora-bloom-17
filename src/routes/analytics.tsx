import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { LineChart } from "@/components/flora/LineChart";
import { SENSORS, useFlora } from "@/lib/store";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Flora AI" }, { name: "description", content: "Patterns, correlations, and forecasts across your garden." }] }),
  component: Analytics,
});

function Analytics() {
  const readings = useFlora((s) => s.readings);
  const plants = useFlora((s) => s.plants);
  const avg = Math.round(plants.reduce((a, b) => a + b.health, 0) / plants.length);

  const kpis = [
    { label: "Water this month", value: "12.4 L", delta: "+8%" },
    { label: "Avg health", value: `${avg}%`, delta: "+2.1%" },
    { label: "Growth vs last mo", value: "+14%", delta: "▲" },
    { label: "Alerts resolved", value: "23/26", delta: "88%" },
  ];

  // heatmap
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 12 }, (_, i) => i * 2);
  const cell = (d: number, h: number) => {
    const v = (Math.sin(d * 0.7) + Math.cos(h * 0.4) + Math.sin((d + h) * 0.2)) / 3;
    return (v + 1) / 2;
  };

  return (
    <AppShell title="Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="glass glass-hot p-5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.label}</div>
              <div className="font-mono text-3xl mt-2 neon-text">{k.value}</div>
              <div className="text-xs text-pulse mt-1">{k.delta}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 glass p-6">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">7-Day Heatmap · Moisture</h3>
            <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${hours.length}, 1fr)` }}>
              <div />
              {hours.map((h) => (
                <div key={h} className="text-[10px] font-mono text-muted-foreground text-center">{h.toString().padStart(2, "0")}</div>
              ))}
              {days.map((d, di) => (
                <>
                  <div key={d} className="text-[10px] font-mono text-muted-foreground pr-2 self-center">{d}</div>
                  {hours.map((h) => {
                    const v = cell(di, h / 2);
                    return (
                      <div
                        key={`${d}-${h}`}
                        title={`${d} ${h}:00 · ${(v * 100).toFixed(0)}%`}
                        className="aspect-square rounded transition hover:scale-110"
                        style={{ background: `oklch(${0.2 + v * 0.6} ${0.05 + v * 0.18} 150)`, boxShadow: v > 0.7 ? "0 0 8px var(--neon)" : "none" }}
                      />
                    );
                  })}
                </>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 glass p-6 space-y-4">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Forecast · 7 days</h3>
            {["Water Nova", "Fertilize Sol", "Prune Atlas", "Inspect Echo", "Repot Lyra", "Check Vega", "Harvest Sol"].map((t, i) => (
              <div key={t} className="flex items-center gap-3 p-2 rounded hover:bg-white/5">
                <div className="font-mono text-xs text-muted-foreground w-8">D{i + 1}</div>
                <div className="text-sm flex-1">{t}</div>
                <div className="text-xs text-pulse">{["💧", "🌿", "✂️", "🔍", "🪴", "✓", "🍃"][i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SENSORS.slice(0, 3).map((s) => (
            <div key={s.key} className="glass p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{s.label} trend</div>
              <LineChart data={readings[s.key]} color="var(--plasma)" height={70} />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
