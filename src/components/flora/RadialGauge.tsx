import { useEffect, useState } from "react";

interface Props {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  ideal: [number, number];
}

export function RadialGauge({ value, min, max, label, unit, ideal }: Props) {
  const [display, setDisplay] = useState(min);
  useEffect(() => {
    let raf = 0;
    const start = display;
    const t0 = performance.now();
    const animate = (t: number) => {
      const p = Math.min(1, (t - t0) / 600);
      setDisplay(start + (value - start) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const pct = Math.max(0, Math.min(1, (display - min) / (max - min)));
  const angle = -120 + pct * 240;
  const inIdeal = display >= ideal[0] && display <= ideal[1];
  const color = inIdeal ? "var(--neon)" : display < ideal[0] ? "var(--warn)" : "var(--danger)";

  const R = 42;
  const C = 2 * Math.PI * R;
  const dash = (240 / 360) * C;
  const fill = pct * dash;

  return (
    <div className="glass glass-hot p-4 flex flex-col items-center gap-2 relative overflow-hidden">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-[210deg]">
          <circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke="oklch(1 0 0 / 0.05)"
            strokeWidth="6"
            strokeDasharray={`${dash} ${C}`}
            strokeLinecap="round"
          />
          <circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${fill} ${C}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray .4s ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="font-mono text-2xl" style={{ color }}>
              {display.toFixed(display < 10 ? 1 : 0)}
            </div>
            <div className="text-[10px] text-muted-foreground">{unit}</div>
          </div>
        </div>
        <div
          className="absolute left-1/2 top-1/2 w-[2px] h-10 origin-top bg-gradient-to-b from-transparent to-current"
          style={{ transform: `translate(-50%, 0) rotate(${angle}deg)`, color }}
        />
      </div>
    </div>
  );
}
