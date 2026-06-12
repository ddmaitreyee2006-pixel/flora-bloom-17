import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useFlora, formatAgo } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/plants")({
  head: () => ({ meta: [{ title: "Plants · Flora AI" }, { name: "description", content: "Profiles, vitals, and care actions for every plant in your garden." }] }),
  component: Plants,
});

function Plants() {
  const plants = useFlora((s) => s.plants);
  const waterPlant = useFlora((s) => s.waterPlant);
  const removePlant = useFlora((s) => s.removePlant);
  const addPlant = useFlora((s) => s.addPlant);
  const notes = useFlora((s) => s.notes);
  const setNote = useFlora((s) => s.setNote);
  const [activeId, setActiveId] = useState(plants[0]?.id);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", species: "", emoji: "🌱" });

  const active = plants.find((p) => p.id === activeId) ?? plants[0];

  return (
    <AppShell>
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Roster · {plants.length}</h3>
            <button onClick={() => setAdding(true)} className="text-xs neon-text">+ Add</button>
          </div>
          {plants.map((p) => {
            const isActive = p.id === active?.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`glass w-full text-left p-4 flex items-center gap-4 transition ${isActive ? "border-border-hot" : "glass-hot"}`}
              >
                <div className="text-3xl">{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">{p.name}</div>
                    <span className="font-mono text-xs neon-text">{Math.round(p.health)}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{p.species}</div>
                  <div className="mt-2 h-1 rounded bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${p.health}%`,
                        background: p.health > 70 ? "var(--neon)" : p.health > 40 ? "var(--warn)" : "var(--danger)",
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}

          {adding && (
            <div className="glass p-4 space-y-2">
              <input
                placeholder="Name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full bg-input rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Species"
                value={draft.species}
                onChange={(e) => setDraft({ ...draft, species: e.target.value })}
                className="w-full bg-input rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Emoji"
                value={draft.emoji}
                onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
                className="w-full bg-input rounded px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button onClick={() => setAdding(false)} className="flex-1 py-2 rounded text-xs text-muted-foreground hover:bg-white/5">Cancel</button>
                <button
                  onClick={() => {
                    if (!draft.name) return;
                    addPlant(draft);
                    setAdding(false);
                    setDraft({ name: "", species: "", emoji: "🌱" });
                    toast.success(`${draft.name} added`);
                  }}
                  className="flex-1 py-2 rounded bg-neon text-void text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </aside>

        {active && (
          <section className="col-span-12 lg:col-span-8 space-y-4">
            <div className="glass p-8 relative overflow-hidden">
              <div className="flex items-start gap-6">
                <div className="text-7xl">{active.emoji}</div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{active.species}</div>
                  <h2 className="text-4xl mt-1">{active.name}</h2>
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <Stat label="Health" value={`${Math.round(active.health)}%`} />
                    <Stat label="Height" value={`${active.height} cm`} />
                    <Stat label="Watered" value={formatAgo(active.lastWatered)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Action icon="💧" label="Water" onClick={() => { waterPlant(active.id); toast.success(`${active.name} watered`); }} />
              <Action icon="🌿" label="Fertilize" onClick={() => toast.success("Fertilizer applied")} />
              <Action icon="✂️" label="Prune" onClick={() => toast.success("Pruning logged")} />
              <Action icon="🔔" label="Alert" onClick={() => toast("Alert threshold panel — coming soon")} />
              <Action icon="🗑️" label="Remove" danger onClick={() => {
                if (confirm(`Remove ${active.name}?`)) {
                  removePlant(active.id);
                  toast.success(`${active.name} removed`);
                  setActiveId(plants[0]?.id);
                }
              }} />
            </div>

            <div className="glass p-6">
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Notes</h3>
              <textarea
                value={notes[active.id] ?? ""}
                onChange={(e) => setNote(active.id, e.target.value)}
                placeholder="What did you observe today?"
                className="w-full min-h-[120px] bg-transparent text-sm resize-none focus:outline-none"
              />
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-mono text-lg neon-text">{value}</div>
    </div>
  );
}

function Action({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`glass glass-hot p-4 text-center group ${danger ? "hover:border-danger" : ""}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-[10px] uppercase tracking-widest ${danger ? "text-danger" : "text-muted-foreground group-hover:text-neon"} transition`}>{label}</div>
    </button>
  );
}
