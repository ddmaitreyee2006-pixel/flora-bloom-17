import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/automation")({
  head: () => ({ meta: [{ title: "Automation · Flora AI" }, { name: "description", content: "Rules and schedules that keep your garden alive." }] }),
  component: Automation,
});

interface Rule {
  id: string;
  trigger: string;
  action: string;
  enabled: boolean;
  runs: number;
}

function Automation() {
  const [rules, setRules] = useState<Rule[]>([
    { id: "1", trigger: "Moisture < 30%", action: "Water plant 100ml", enabled: true, runs: 42 },
    { id: "2", trigger: "Temp > 28°C", action: "Open ventilation", enabled: true, runs: 18 },
    { id: "3", trigger: "Light < 200 lux for 2h", action: "Enable grow lamp", enabled: false, runs: 6 },
    { id: "4", trigger: "pH outside 6.0–7.0", action: "Notify owner", enabled: true, runs: 3 },
    { id: "5", trigger: "Sunset", action: "Reduce all flow rates 50%", enabled: true, runs: 247 },
  ]);

  const toggle = (id: string) =>
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  return (
    <AppShell title="Automation">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Rule Library</h3>
          {rules.map((r) => (
            <div key={r.id} className="glass glass-hot p-4 flex items-center gap-4">
              <button
                onClick={() => toggle(r.id)}
                className={`relative w-11 h-6 rounded-full transition ${r.enabled ? "bg-neon/30" : "bg-white/10"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition ${r.enabled ? "left-5 bg-neon shadow-[0_0_8px_var(--neon)]" : "left-0.5 bg-muted-foreground"}`}
                />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="text-muted-foreground">WHEN</span> {r.trigger}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">DO</span> <span className="neon-text">{r.action}</span>
                </div>
              </div>
              <div className="text-right font-mono text-[10px] text-muted-foreground">
                <div>{r.runs}×</div>
                <div>fired</div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-12 lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Weekly Schedule</h3>
            <button onClick={() => toast.success("Schedule synced")} className="text-xs neon-text">Sync</button>
          </div>
          <div className="glass p-4">
            <div className="grid grid-cols-8 gap-1 text-[10px] font-mono text-muted-foreground">
              <div />
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="text-center">{d}</div>
              ))}
              {["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"].map((t, ti) => (
                <Fragment key={t}>
                  <div className="self-center">{t}</div>
                  {Array.from({ length: 7 }).map((_, di) => {
                    const active = (ti + di) % 3 === 0;
                    return (
                      <button
                        key={`${ti}-${di}`}
                        onClick={() => toast(`Toggled ${t} ${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][di]}`)}
                        className={`aspect-square rounded transition hover:scale-110 ${active ? "bg-neon/30 border border-border-hot" : "bg-white/5 hover:bg-white/10"}`}
                      />
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>

          <div className="glass p-6">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Add Rule</h3>
            <div className="grid grid-cols-3 gap-2">
              <select className="bg-input rounded px-3 py-2 text-sm">
                <option>Moisture</option><option>Temp</option><option>Light</option><option>pH</option>
              </select>
              <select className="bg-input rounded px-3 py-2 text-sm">
                <option>{"<"}</option><option>{">"}</option><option>=</option>
              </select>
              <input className="bg-input rounded px-3 py-2 text-sm font-mono" defaultValue="30" />
            </div>
            <button
              onClick={() => {
                const r: Rule = { id: Math.random().toString(36).slice(2), trigger: "Custom rule", action: "Notify", enabled: true, runs: 0 };
                setRules((rs) => [r, ...rs]);
                toast.success("Rule added");
              }}
              className="mt-4 btn-hero w-full"
            >
              Create Rule
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
