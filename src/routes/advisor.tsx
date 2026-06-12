import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useFlora } from "@/lib/store";

export const Route = createFileRoute("/advisor")({
  head: () => ({ meta: [{ title: "AI Advisor · Flora AI" }, { name: "description", content: "An oracle for your garden, fluent in chlorophyll." }] }),
  component: Advisor;
});

interface Msg { role: "user" | "ai"; text: string }

function generateReply(q: string, plants: ReturnType<typeof useFlora.getState>["plants"]): string {
  const lowest = [...plants].sort((a, b) => a.health - b.health)[0];
  const ql = q.toLowerCase();
  if (ql.includes("wilt") || ql.includes("dying") || ql.includes("sad")) {
    return `**Diagnosis:** ${lowest.name} (${lowest.species}) is your most stressed plant at ${Math.round(lowest.health)}% health.\n\n**Likely cause:** Moisture deficit combined with elevated ambient temperature.\n\n**Recommended action:** Water 150ml, then move out of direct light for 48 hours. Re-check in 24h.\n\n*Confidence: 87%*`;
  }
  if (ql.includes("water") || ql.includes("schedule")) {
    return `For your current roster, the optimal cadence is every **3–4 days** for tropical species and **6–8 days** for succulents. I've detected ${plants.filter(p => Date.now() - p.lastWatered > 36e5 * 48).length} plants overdue.\n\nWould you like me to auto-schedule?`;
  }
  if (ql.includes("compare") || ql.includes("report")) {
    return plants.map(p => `• **${p.name}** — ${Math.round(p.health)}% health, ${p.height}cm`).join("\n");
  }
  return `I'm tracking ${plants.length} organisms. Average health is **${Math.round(plants.reduce((s, p) => s + p.health, 0) / plants.length)}%**. Ask me about a specific plant, or try one of the suggested questions on the right.`;
}

function Advisor() {
  const plants = useFlora((s) => s.plants);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "I am Flora. I observe your garden in 2.2-second intervals across six sensor channels. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => { scroll.current?.scrollTo({ top: 1e9, behavior: "smooth" }); }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: generateReply(text, plants) }]);
      setTyping(false);
    }, 900);
  };

  const suggestions = [
    "Why is my mint wilting?",
    "Ideal watering schedule?",
    "Compare all my plants",
    "Generate a care report",
  ];

  return (
    <AppShell title="Flora · AI Advisor">
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        <div className="col-span-12 lg:col-span-8 glass flex flex-col">
          <div ref={scroll} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
                <div className={`max-w-[75%] p-4 rounded-2xl text-sm whitespace-pre-line ${m.role === "user" ? "bg-pulse/20 border border-border-hot" : "glass"}`}>
                  {m.role === "ai" && <div className="text-[10px] uppercase tracking-widest text-pulse mb-2">⬢ FLORA</div>}
                  <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, '<strong class="neon-text">$1</strong>') }} />
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex">
                <div className="glass p-4 rounded-2xl flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-neon animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-neon animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="w-2 h-2 rounded-full bg-neon animate-bounce" style={{ animationDelay: "240ms" }} />
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="border-t border-border p-4 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Flora anything..."
              className="flex-1 bg-input rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neon"
            />
            <button type="submit" className="btn-hero">Send →</button>
          </form>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-3">
          <div className="glass p-5">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Suggested</h3>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left text-sm p-3 rounded glass-hot hover:border-border-hot border border-border transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="glass p-5">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Insight</h3>
            <p className="text-sm">
              Your <span className="neon-text">Echo</span> is 23% drier than last week. Consider adjusting the moisture threshold.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
