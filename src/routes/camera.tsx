import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useFlora } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/camera")({
  head: () => ({ meta: [{ title: "Camera · Flora AI" }, { name: "description", content: "Visual telemetry from the greenhouse cameras." }] }),
  component: Camera,
});

function FakeCam({ id, label, night }: { id: number; label: string; night: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    let t = 0;
    const draw = () => {
      const c = ref.current;
      if (!c) return;
      const ctx = c.getContext("2d")!;
      const w = c.width, h = c.height;
      ctx.fillStyle = night ? "#021a08" : "#031808";
      ctx.fillRect(0, 0, w, h);
      // ground
      ctx.fillStyle = "#020a04";
      ctx.fillRect(0, h * 0.75, w, h * 0.25);
      // simulated plant silhouettes
      for (let i = 0; i < 5; i++) {
        const x = (i + 0.5) * (w / 5) + Math.sin(t / 50 + i) * 6;
        const ph = 40 + ((id + i) % 3) * 30;
        ctx.fillStyle = `oklch(0.35 0.12 150)`;
        ctx.beginPath();
        ctx.ellipse(x, h * 0.75, 18, ph, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = `oklch(0.6 0.2 145 / 0.6)`;
        for (let k = 0; k < 5; k++) {
          ctx.beginPath();
          ctx.ellipse(x + Math.cos(k + i) * 14, h * 0.75 - 10 - k * 12, 12, 6, k, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // scanline
      const sy = (t * 1.4) % h;
      const grad = ctx.createLinearGradient(0, sy - 20, 0, sy + 20);
      grad.addColorStop(0, "rgba(57,255,133,0)");
      grad.addColorStop(0.5, "rgba(57,255,133,0.2)");
      grad.addColorStop(1, "rgba(57,255,133,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, sy - 20, w, 40);
      // grain
      const img = ctx.getImageData(0, 0, w, h);
      for (let i = 0; i < img.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 20;
        img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
      }
      ctx.putImageData(img, 0, 0);
      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [id, night]);

  return (
    <div className="glass glass-hot p-3 relative overflow-hidden">
      <canvas ref={ref} width={400} height={240} className="w-full rounded" style={{ filter: night ? "saturate(0.4) hue-rotate(40deg) brightness(1.2)" : "none" }} />
      <div className="absolute top-5 left-5 flex items-center gap-2 font-mono text-[10px]">
        <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
        <span className="text-danger">REC</span>
        <span className="text-muted-foreground">· {label}</span>
      </div>
      <div className="absolute top-5 right-5 font-mono text-[10px] text-muted-foreground">
        {new Date().toTimeString().slice(0, 8)}
      </div>
    </div>
  );
}

function Camera() {
  const plants = useFlora((s) => s.plants.slice(0, 4));
  const [night, setNight] = useState(false);
  const [scans, setScans] = useState<string[]>([
    "Leaf color: Healthy green ✓",
    "Pest detection: None found ✓",
  ]);

  useEffect(() => {
    const id = setInterval(() => {
      const msgs = [
        "Wilting indicator: 2% ✓",
        "Chlorophyll density: optimal ✓",
        "Soil surface: hydrated ✓",
        "Movement detected: minor ✓",
        "Leaf temperature: 22.1°C ✓",
      ];
      setScans((s) => [msgs[Math.floor(Math.random() * msgs.length)], ...s].slice(0, 10));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <AppShell title="Camera Feeds">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {plants.map((p, i) => (
            <FakeCam key={p.id} id={i} label={p.name} night={night} />
          ))}
        </div>
        <aside className="col-span-12 lg:col-span-4 space-y-4">
          <div className="glass p-5">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Vision AI</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {scans.map((s, i) => (
                <div key={i} className="font-mono text-xs text-pulse">[{i.toString().padStart(2, "0")}] {s}</div>
              ))}
            </div>
          </div>
          <div className="glass p-5 space-y-3">
            <button onClick={() => toast.success("Screenshot saved")} className="w-full glass glass-hot py-2 text-xs uppercase tracking-widest">Screenshot</button>
            <button onClick={() => setNight((n) => !n)} className="w-full glass glass-hot py-2 text-xs uppercase tracking-widest">
              {night ? "Disable" : "Enable"} Night Vision
            </button>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Motion sensitivity</label>
              <input type="range" className="w-full accent-neon" defaultValue={60} />
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
