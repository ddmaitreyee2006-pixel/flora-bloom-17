import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { LineChart } from "@/components/flora/LineChart";
import { SENSORS, useFlora } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/sensors")({
  head: () => ({ meta: [{ title: "Sensors · Flora AI" }, { name: "description", content: "Real-time sensor telemetry from your living garden." }] }),
  component: Sensors,
});

function Sensors() {
  const readings = useFlora((s) => s.readings);

  const exportCSV = () => {
    const headers = ["t", ...SENSORS.map((s) => s.key)].join(",");
    const len = readings.moisture.length;
    const rows = Array.from({ length: len }, (_, i) =>
      [i, ...SENSORS.map((s) => readings[s.key][i])].join(","),
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `flora-sensors-${Date.now()}.csv`;
    a.click();
    toast.success("CSV exported");
  };

  return (
    <AppShell title="Sensor Telemetry">
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">Six channels · refreshing every 2.2s · 48-point window</p>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="glass glass-hot px-4 py-2 text-xs uppercase tracking-widest">Export CSV</button>
            <button onClick={() => toast.success("Calibration started")} className="glass glass-hot px-4 py-2 text-xs uppercase tracking-widest">Calibrate</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SENSORS.map((s) => {
            const arr = readings[s.key];
            const cur = arr.at(-1) ?? 0;
            const prev = arr.at(-2) ?? cur;
            const trend = cur - prev;
            const min = Math.min(...arr);
            const max = Math.max(...arr);
            const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
            const inIdeal = cur >= s.ideal[0] && cur <= s.ideal[1];
            const color = inIdeal ? "var(--neon)" : cur < s.ideal[0] ? "var(--warn)" : "var(--danger)";

            return (
              <div key={s.key} className="glass glass-hot p-6 relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <div className="font-mono text-5xl" style={{ color }}>{cur.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">{s.unit}</div>
                      <div className="text-xs ml-2 font-mono" style={{ color: trend > 0 ? "var(--neon)" : "var(--warn)" }}>
                        {trend > 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-muted-foreground space-y-0.5">
                    <div>min {min.toFixed(1)}</div>
                    <div>max {max.toFixed(1)}</div>
                    <div>avg {avg.toFixed(1)}</div>
                  </div>
                </div>
                <LineChart data={arr} color={color} height={100} />
                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>ideal: {s.ideal[0]} – {s.ideal[1]} {s.unit}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="pulse-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                    {inIdeal ? "OPTIMAL" : "ATTENTION"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
