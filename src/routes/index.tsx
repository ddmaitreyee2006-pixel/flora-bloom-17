import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GenesisScene } from "@/components/flora/GenesisScene";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flora AI — Intelligent Plant Intelligence System" },
      { name: "description", content: "A living dashboard for the next generation of botanists. Real-time sensors, 3D plants, AI advisor." },
      { property: "og:title", content: "Flora AI" },
      { property: "og:description", content: "Intelligent Plant Intelligence System" },
    ],
  }),
  component: Genesis,
});

function Genesis() {
  const [clock, setClock] = useState("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setClock(d.toTimeString().slice(0, 8));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-void">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0">
        <GenesisScene />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-transparent to-void/80 pointer-events-none" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-neon shadow-[0_0_12px_var(--neon)]" />
            <span className="font-mono text-xs tracking-widest text-muted-foreground">
              FLORA · v2.4.1 · CONNECTED
            </span>
          </div>
          <div className="font-mono text-xs text-muted-foreground">{clock}</div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-[10px] tracking-[0.6em] text-pulse mb-6 animate-[fade-in_1s_ease-out]">
            INITIALIZING ORGANISM
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            <span className="neon-text">FLORA</span>{" "}
            <span className="bg-gradient-to-r from-plasma via-neon to-solar bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground font-light italic">
            An intelligent plant intelligence system. Your garden, alive in data — 
            sensors breathing, plants thinking, decisions made before you notice them.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4">
            <Link to="/dashboard" className="btn-hero">
              <span>Enter the System</span>
              <span className="font-mono">→</span>
            </Link>
            <div className="text-[10px] tracking-widest text-muted-foreground/70">
              8 PLANTS · 6 SENSORS · 1 ORGANISM
            </div>
          </div>
        </main>

        <footer className="flex items-end justify-between px-8 pb-8 font-mono text-[10px] tracking-widest text-muted-foreground">
          <div>
            <div>LAT 47.6062° N</div>
            <div>LON 122.3321° W</div>
          </div>
          <div className="hidden md:flex flex-col items-center gap-1">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-neon to-transparent" />
            <div>SCROLL · OR · ENTER</div>
          </div>
          <div className="text-right">
            <div>22.4°C · 64%</div>
            <div>ATMOSPHERE NOMINAL</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
