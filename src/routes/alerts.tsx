import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useFlora, formatAgo } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [{ title: "Alerts · Flora AI" }, { name: "description", content: "Command center for plant emergencies." }] }),
  component: Alerts,
});

const tone = (level: string) =>
  level === "critical" ? "var(--danger)" : level === "high" ? "var(--warn)" : level === "medium" ? "var(--plasma)" : "var(--pulse)";

function Alerts() {
  const alerts = useFlora((s) => s.alerts);
  const resolveAlert = useFlora((s) => s.resolveAlert);
  const addAlert = useFlora((s) => s.addAlert);
  const plants = useFlora((s) => s.plants);
  const active = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);

  return (
    <AppShell title="Alerts">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{active.length} active · {resolved.length} resolved</p>
        <div className="flex gap-2">
          <button onClick={() => toast("All alerts muted")} className="glass glass-hot px-4 py-2 text-xs uppercase tracking-widest">Mute</button>
          <button
            onClick={() => {
              addAlert({ plantId: plants[0].id, sensor: "moisture", level: "critical", message: "Test critical alert fired" });
              toast.error("Test alert fired");
            }}
            className="glass glass-hot px-4 py-2 text-xs uppercase tracking-widest"
          >
            Test Alert
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Active</h3>
          {active.length === 0 && <div className="glass p-8 text-center text-muted-foreground">All quiet. The garden breathes.</div>}
          {active.map((a) => {
            const plant = plants.find((p) => p.id === a.plantId);
            const c = tone(a.level);
            return (
              <div key={a.id} className="glass p-5 relative overflow-hidden" style={{ borderColor: c }}>
                <div className="flex items-start gap-4">
                  <div className="w-1 self-stretch rounded" style={{ background: c, boxShadow: `0 0 12px ${c}` }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: c }}>{a.level}</span>
                      <span className="text-xs text-muted-foreground">· {plant?.name} · {a.sensor}</span>
                    </div>
                    <div className="text-sm mt-1">{a.message}</div>
                    <div className="font-mono text-[10px] text-muted-foreground mt-2">{formatAgo(a.createdAt)}</div>
                  </div>
                  <button
                    onClick={() => { resolveAlert(a.id); toast.success("Resolved"); }}
                    className="text-xs neon-text px-3 py-1.5 rounded hover:bg-pulse/10"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Resolved</h3>
          {resolved.map((a) => (
            <div key={a.id} className="glass p-4 opacity-60">
              <div className="text-xs text-muted-foreground line-through">{a.message}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
