import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SensorKey = "moisture" | "light" | "temp" | "ph" | "co2" | "nutrients";

export interface SensorMeta {
  key: SensorKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  ideal: [number, number];
}

export const SENSORS: SensorMeta[] = [
  { key: "moisture", label: "Moisture", unit: "%", min: 0, max: 100, ideal: [40, 70] },
  { key: "light", label: "Light", unit: "lux", min: 0, max: 1200, ideal: [400, 900] },
  { key: "temp", label: "Temp", unit: "°C", min: 0, max: 40, ideal: [18, 26] },
  { key: "ph", label: "pH", unit: "", min: 3, max: 9, ideal: [6, 7] },
  { key: "co2", label: "CO₂", unit: "ppm", min: 300, max: 1600, ideal: [400, 900] },
  { key: "nutrients", label: "Nutrients", unit: "ppm", min: 0, max: 2000, ideal: [800, 1400] },
];

export interface Plant {
  id: string;
  name: string;
  species: string;
  health: number;
  emoji: string;
  lastWatered: number;
  height: number;
}

export interface Alert {
  id: string;
  plantId: string;
  sensor: SensorKey;
  level: "critical" | "high" | "medium" | "low";
  message: string;
  createdAt: number;
  resolved: boolean;
}

export interface ActivityItem {
  id: string;
  ts: number;
  icon: string;
  plant: string;
  text: string;
}

interface Readings {
  moisture: number[];
  light: number[];
  temp: number[];
  ph: number[];
  co2: number[];
  nutrients: number[];
}

interface State {
  plants: Plant[];
  alerts: Alert[];
  activity: ActivityItem[];
  readings: Readings;
  theme: string;
  notes: Record<string, string>;
  tick: () => void;
  waterPlant: (id: string) => void;
  waterAll: () => void;
  resolveAlert: (id: string) => void;
  addAlert: (a: Omit<Alert, "id" | "createdAt" | "resolved">) => void;
  setNote: (id: string, n: string) => void;
  addPlant: (p: Omit<Plant, "id" | "health" | "lastWatered" | "height">) => void;
  removePlant: (id: string) => void;
  setTheme: (t: string) => void;
  pushActivity: (a: Omit<ActivityItem, "id" | "ts">) => void;
}

const defaultPlants: Plant[] = [
  { id: "p1", name: "Aurora", species: "Monstera Deliciosa", health: 92, emoji: "🌿", lastWatered: Date.now() - 36e5 * 8, height: 64 },
  { id: "p2", name: "Sol", species: "Sweet Basil", health: 78, emoji: "🌱", lastWatered: Date.now() - 36e5 * 22, height: 22 },
  { id: "p3", name: "Vega", species: "Snake Plant", health: 88, emoji: "🪴", lastWatered: Date.now() - 36e5 * 80, height: 48 },
  { id: "p4", name: "Nova", species: "Cherry Tomato", health: 64, emoji: "🍅", lastWatered: Date.now() - 36e5 * 14, height: 92 },
  { id: "p5", name: "Echo", species: "Peppermint", health: 41, emoji: "🌿", lastWatered: Date.now() - 36e5 * 50, height: 18 },
  { id: "p6", name: "Lyra", species: "Lavender", health: 81, emoji: "💜", lastWatered: Date.now() - 36e5 * 30, height: 36 },
  { id: "p7", name: "Orion", species: "Bird of Paradise", health: 95, emoji: "🌴", lastWatered: Date.now() - 36e5 * 12, height: 120 },
  { id: "p8", name: "Atlas", species: "Fiddle Leaf Fig", health: 70, emoji: "🌳", lastWatered: Date.now() - 36e5 * 18, height: 140 },
];

const seedHistory = (base: number, amp: number, len = 48) =>
  Array.from({ length: len }, (_, i) =>
    +(base + Math.sin(i / 6) * amp + (Math.random() - 0.5) * amp * 0.3).toFixed(1),
  );

const initialReadings: Readings = {
  moisture: seedHistory(55, 12),
  light: seedHistory(620, 280),
  temp: seedHistory(22, 3),
  ph: seedHistory(6.5, 0.4),
  co2: seedHistory(650, 180),
  nutrients: seedHistory(1100, 200),
};

const uid = () => Math.random().toString(36).slice(2, 9);

export const useFlora = create<State>()(
  persist(
    (set, get) => ({
      plants: defaultPlants,
      alerts: [
        { id: uid(), plantId: "p5", sensor: "moisture", level: "critical", message: "Echo moisture at 18% — immediate watering needed", createdAt: Date.now() - 6e5, resolved: false },
        { id: uid(), plantId: "p4", sensor: "temp", level: "high", message: "Nova greenhouse temp rising above ideal", createdAt: Date.now() - 18e5, resolved: false },
        { id: uid(), plantId: "p2", sensor: "nutrients", level: "medium", message: "Sol nutrient level depleting", createdAt: Date.now() - 36e5, resolved: false },
      ],
      activity: [
        { id: uid(), ts: Date.now() - 60_000, icon: "💧", plant: "Aurora", text: "Auto-watered 120ml" },
        { id: uid(), ts: Date.now() - 240_000, icon: "🌡️", plant: "Nova", text: "Temp spike resolved" },
        { id: uid(), ts: Date.now() - 600_000, icon: "🌿", plant: "Vega", text: "Health score increased to 88" },
      ],
      readings: initialReadings,
      theme: "midnight-forest",
      notes: {},
      tick: () => {
        const s = get();
        const next: Readings = { ...s.readings };
        (Object.keys(next) as SensorKey[]).forEach((k) => {
          const arr = next[k];
          const last = arr[arr.length - 1] ?? 0;
          const meta = SENSORS.find((m) => m.key === k)!;
          const drift = (Math.random() - 0.5) * (meta.max - meta.min) * 0.02;
          const newVal = Math.max(meta.min, Math.min(meta.max, +(last + drift).toFixed(2)));
          next[k] = [...arr.slice(-47), newVal];
        });
        // slow plant health update from moisture
        const lastMoist = next.moisture[next.moisture.length - 1];
        const plants = s.plants.map((p) => {
          const target = lastMoist > 40 ? p.health + 0.05 : p.health - 0.15;
          return { ...p, health: Math.max(10, Math.min(100, +target.toFixed(1))) };
        });
        set({ readings: next, plants });
      },
      waterPlant: (id) => {
        set((s) => ({
          plants: s.plants.map((p) =>
            p.id === id ? { ...p, lastWatered: Date.now(), health: Math.min(100, p.health + 4) } : p,
          ),
        }));
        const plant = get().plants.find((p) => p.id === id);
        get().pushActivity({ icon: "💧", plant: plant?.name ?? "", text: "Watered manually" });
      },
      waterAll: () => {
        set((s) => ({
          plants: s.plants.map((p) => ({ ...p, lastWatered: Date.now(), health: Math.min(100, p.health + 3) })),
        }));
        get().pushActivity({ icon: "💧", plant: "All plants", text: "Mass watering cycle complete" });
      },
      resolveAlert: (id) =>
        set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)) })),
      addAlert: (a) =>
        set((s) => ({
          alerts: [{ ...a, id: uid(), createdAt: Date.now(), resolved: false }, ...s.alerts],
        })),
      setNote: (id, n) => set((s) => ({ notes: { ...s.notes, [id]: n } })),
      addPlant: (p) =>
        set((s) => ({
          plants: [
            ...s.plants,
            { ...p, id: uid(), health: 80, lastWatered: Date.now(), height: 20 },
          ],
        })),
      removePlant: (id) => set((s) => ({ plants: s.plants.filter((p) => p.id !== id) })),
      setTheme: (t) => set({ theme: t }),
      pushActivity: (a) =>
        set((s) => ({
          activity: [{ ...a, id: uid(), ts: Date.now() }, ...s.activity].slice(0, 50),
        })),
    }),
    {
      name: "flora-ai-store",
      partialize: (s) => ({
        plants: s.plants,
        alerts: s.alerts,
        notes: s.notes,
        theme: s.theme,
      }),
    },
  ),
);

export const formatAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
