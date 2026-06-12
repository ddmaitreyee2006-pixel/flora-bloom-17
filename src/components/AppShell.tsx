import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useFlora } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "◐" },
  { to: "/plants", label: "Plants", icon: "✦" },
  { to: "/sensors", label: "Sensors", icon: "≋" },
  { to: "/analytics", label: "Analytics", icon: "◢" },
  { to: "/automation", label: "Automation", icon: "⌬" },
  { to: "/camera", label: "Camera", icon: "◉" },
  { to: "/alerts", label: "Alerts", icon: "▲" },
  { to: "/advisor", label: "AI Advisor", icon: "✺" },
  { to: "/settings", label: "Settings", icon: "⚙" },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const tick = useFlora((s) => s.tick);
  const activeAlerts = useFlora((s) => s.alerts.filter((a) => !a.resolved).length);

  useEffect(() => {
    const id = setInterval(tick, 2200);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          "sticky top-0 h-screen shrink-0 border-r border-border bg-deep/60 backdrop-blur-xl transition-[width] duration-300 flex flex-col",
          expanded ? "w-60" : "w-[72px]",
        )}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <Link to="/" className="flex items-center gap-3 px-5 py-6 group">
          <div className="relative w-8 h-8 shrink-0">
            <div className="absolute inset-0 rounded-full bg-pulse/30 blur-md breathe" />
            <svg viewBox="0 0 32 32" className="relative w-8 h-8">
              <path
                d="M16 28 C 6 22, 6 10, 16 4 C 26 10, 26 22, 16 28 Z"
                fill="none"
                stroke="oklch(0.88 0.24 145)"
                strokeWidth="1.5"
              />
              <path d="M16 28 L 16 4" stroke="oklch(0.88 0.24 145)" strokeWidth="1" opacity=".5" />
            </svg>
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <div className="text-sm font-bold tracking-[0.2em] neon-text">FLORA</div>
              <div className="text-[10px] text-muted-foreground tracking-widest">AI · v2.4.1</div>
            </div>
          )}
        </Link>

        <nav className="flex-1 px-2 space-y-1">
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            const isAlert = item.to === "/alerts";
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all",
                  active
                    ? "text-neon bg-pulse/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[2px] bg-neon shadow-[0_0_12px_var(--neon)] rounded-r" />
                )}
                <span className="text-base w-5 text-center">{item.icon}</span>
                {expanded && <span className="truncate">{item.label}</span>}
                {isAlert && activeAlerts > 0 && expanded && (
                  <span className="ml-auto rounded-full bg-danger/20 text-danger text-[10px] px-2 py-0.5 font-mono">
                    {activeAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pulse to-plasma grid place-items-center text-xs font-bold text-void">
            B
          </div>
          {expanded && (
            <div className="text-xs">
              <div className="flex items-center gap-1.5">
                <span className="pulse-dot" />
                <span>Online</span>
              </div>
              <div className="text-muted-foreground">Botanist</div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {title && (
          <div className="px-8 py-5 border-b border-border flex items-center justify-between">
            <h1 className="text-2xl">{title}</h1>
            <div className="font-mono text-xs text-muted-foreground flex items-center gap-2">
              <span className="pulse-dot" />
              SYSTEM LIVE
            </div>
          </div>
        )}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
