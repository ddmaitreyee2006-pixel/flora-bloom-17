import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useFlora } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Flora AI" }, { name: "description", content: "Configure your Flora AI cockpit." }] }),
  component: Settings,
});

const THEMES = [
  { id: "midnight-forest", label: "Midnight Forest", void: "oklch(0.12 0.03 150)", neon: "oklch(0.88 0.24 145)" },
  { id: "solar-savanna", label: "Solar Savanna", void: "oklch(0.16 0.05 60)", neon: "oklch(0.92 0.22 95)" },
  { id: "deep-ocean", label: "Deep Ocean", void: "oklch(0.12 0.06 240)", neon: "oklch(0.85 0.2 200)" },
  { id: "volcanic", label: "Volcanic", void: "oklch(0.12 0.04 25)", neon: "oklch(0.75 0.25 30)" },
  { id: "arctic", label: "Arctic", void: "oklch(0.18 0.02 220)", neon: "oklch(0.92 0.1 220)" },
];

function Settings() {
  const theme = useFlora((s) => s.theme);
  const setTheme = useFlora((s) => s.setTheme);
  const [tab, setTab] = useState("profile");

  const applyTheme = (t: typeof THEMES[0]) => {
    document.documentElement.style.setProperty("--void", t.void);
    document.documentElement.style.setProperty("--neon", t.neon);
    setTheme(t.id);
    toast.success(`${t.label} applied`);
  };

  return (
    <AppShell title="Settings">
      <div className="flex gap-6 border-b border-border mb-6">
        {["profile", "appearance", "sensors", "notifications", "data"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative pb-3 text-sm uppercase tracking-widest ${tab === t ? "text-neon" : "text-muted-foreground"}`}
          >
            {t}
            {tab === t && <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-neon shadow-[0_0_8px_var(--neon)]" />}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="glass p-6 max-w-xl space-y-4">
          <Field label="Name" defaultValue="Botanist" />
          <Field label="Email" defaultValue="hello@flora.ai" />
          <Field label="Timezone" defaultValue="America/Los_Angeles" />
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">API Key</label>
            <div className="flex gap-2 mt-1">
              <input readOnly value="flora_sk_•••••••••••" className="flex-1 bg-input rounded px-3 py-2 font-mono text-sm" />
              <button
                onClick={() => { navigator.clipboard.writeText("flora_sk_test_xyz"); toast.success("Copied"); }}
                className="glass glass-hot px-4 text-xs uppercase tracking-widest"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "appearance" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Theme</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTheme(t)}
                  className={`glass glass-hot p-4 text-left ${theme === t.id ? "border-border-hot" : ""}`}
                >
                  <div className="h-16 rounded mb-3" style={{ background: `linear-gradient(135deg, ${t.void}, ${t.neon})` }} />
                  <div className="text-xs">{t.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="glass p-6 max-w-md">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Animation intensity</label>
            <input type="range" className="w-full accent-neon mt-2" defaultValue={70} />
          </div>
        </div>
      )}

      {tab === "sensors" && (
        <div className="glass p-6 max-w-2xl space-y-4">
          <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground uppercase tracking-widest">
            <div>Sensor</div><div>Offset</div><div>Poll</div>
          </div>
          {["Moisture", "Light", "Temp", "pH", "CO₂", "Nutrients"].map((s) => (
            <div key={s} className="grid grid-cols-3 gap-3 items-center">
              <div className="text-sm">{s}</div>
              <input defaultValue={0} className="bg-input rounded px-3 py-2 text-sm font-mono" />
              <select className="bg-input rounded px-3 py-2 text-sm"><option>2s</option><option>5s</option><option>30s</option></select>
            </div>
          ))}
        </div>
      )}

      {tab === "notifications" && (
        <div className="glass p-6 max-w-xl space-y-3">
          {["Moisture", "Temperature", "Light", "pH", "Nutrient"].map((l) => (
            <label key={l} className="flex items-center justify-between py-2">
              <span className="text-sm">{l} alerts</span>
              <input type="checkbox" defaultChecked className="accent-neon" />
            </label>
          ))}
        </div>
      )}

      {tab === "data" && (
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl">
          <button onClick={() => toast.success("JSON exported")} className="glass glass-hot p-6 text-center">📦<div className="text-xs mt-2 uppercase tracking-widest">Export JSON</div></button>
          <button onClick={() => toast.success("CSV exported")} className="glass glass-hot p-6 text-center">📊<div className="text-xs mt-2 uppercase tracking-widest">Export CSV</div></button>
          <button
            onClick={() => {
              if (confirm("Clear all stored data?")) { localStorage.clear(); location.reload(); }
            }}
            className="glass glass-hot p-6 text-center hover:border-danger"
          >
            🗑️<div className="text-xs mt-2 uppercase tracking-widest text-danger">Reset</div>
          </button>
        </div>
      )}
    </AppShell>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input defaultValue={defaultValue} className="w-full bg-input rounded px-3 py-2 text-sm mt-1" />
    </div>
  );
}
