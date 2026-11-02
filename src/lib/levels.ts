import type { AppState, Category, Energy, PlanItem, Session } from "./types";

export const LEVELS = [
  { level: 1, minutes: 10, name: "Chispa" },
  { level: 2, minutes: 20, name: "Brasa" },
  { level: 3, minutes: 30, name: "Llama" },
  { level: 4, minutes: 45, name: "Fogata" },
  { level: 5, minutes: 60, name: "Hoguera" },
  { level: 6, minutes: 90, name: "Faro" },
] as const;

export const MAX_LEVEL = LEVELS.length;

export function levelInfo(level: number) {
  return LEVELS[Math.min(Math.max(level, 1), MAX_LEVEL) - 1];
}

export const CATEGORY_LABEL: Record<Category, string> = {
  leer: "Leer",
  ver: "Ver",
  escuchar: "Escuchar",
};

export const CATEGORY_VERB: Record<Category, string> = {
  leer: "leyendo",
  ver: "viendo",
  escuchar: "escuchando",
};

const ENERGY_FACTOR: Record<Energy, number> = { bajo: 0.5, medio: 1, alto: 1.25 };

/** Sesiones de "aguante" necesarias (de las últimas 5) para subir de nivel. */
const SESSIONS_TO_LEVEL_UP = 3;

/** Cuántas sesiones completas al nivel actual llevas, de las últimas 5 desde que llegaste a él. */
export function progressToNextLevel(state: AppState) {
  const target = levelInfo(state.level).minutes;
  const recent = sessionsAtCurrentLevel(state).slice(-5);
  const good = recent.filter((s) => s.completed && s.actualMin >= target).length;
  return { good, needed: SESSIONS_TO_LEVEL_UP };
}

function sessionsAtCurrentLevel(state: AppState): Session[] {
  // Las sesiones guardan los minutos planeados; contamos solo las que apuntaban al nivel actual o más.
  const target = levelInfo(state.level).minutes;
  return state.sessions.filter((s) => s.plannedMin >= target * 0.9);
}

/** Nunca se baja de nivel: sin culpa. Solo se sube. */
export function evaluateLevel(state: AppState): number {
  if (state.level >= MAX_LEVEL) return state.level;
  const { good, needed } = progressToNextLevel(state);
  return good >= needed ? state.level + 1 : state.level;
}

export function targetMinutes(level: number, energy: Energy | undefined) {
  const base = levelInfo(level).minutes;
  const m = base * ENERGY_FACTOR[energy ?? "medio"];
  return Math.max(5, Math.round(m / 5) * 5);
}

/** Qué tanto te ayuda cada categoría, según tus 👍 / 👎. */
export function categoryWeights(sessions: Session[]): Record<Category, number> {
  const w: Record<Category, number> = { leer: 1, ver: 1, escuchar: 1 };
  for (const s of sessions) {
    if (s.helped === true) w[s.category] += 1;
    if (s.helped === false) w[s.category] -= 0.5;
  }
  for (const c of Object.keys(w) as Category[]) w[c] = Math.max(0.3, w[c]);
  return w;
}

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

export function pickCategory(sessions: Session[], date: string, shift = 0): Category {
  const order: Category[] = ["leer", "ver", "escuchar"];
  const w = categoryWeights(sessions);
  const total = order.reduce((a, c) => a + w[c], 0);
  let r = seeded(date) * total;
  let idx = 0;
  for (; idx < order.length; idx++) {
    r -= w[order[idx]];
    if (r <= 0) break;
  }
  return order[(Math.min(idx, 2) + shift) % order.length];
}

export interface Challenge {
  category: Category;
  title: string;
  subtitle: string;
  minutes: number;
  planItem?: PlanItem;
}

export function buildChallenge(category: Category, minutes: number, plan: PlanItem[]): Challenge {
  const item = plan.find((p) => p.category === category && !p.done);
  const sub = `Sin celular · unos ${minutes} min`;
  if (category === "leer") {
    const pages = Math.max(3, Math.round(minutes / 1.5));
    return {
      category,
      minutes,
      planItem: item,
      title: item ? `${pages} páginas de ${item.title}` : `Lee ${pages} páginas`,
      subtitle: sub,
    };
  }
  if (category === "ver") {
    const what =
      minutes < 25 ? "un episodio corto" : minutes < 60 ? "un episodio completo" : "una película entera";
    return {
      category,
      minutes: item && minutes >= 60 ? Math.max(minutes, item.minutes) : minutes,
      planItem: minutes >= 60 ? item : undefined,
      title: minutes >= 60 && item ? `Mira ${item.title}` : `Mira ${what}`,
      subtitle: "Sin tocar el celular",
    };
  }
  const what =
    minutes < 15 ? "3 canciones seguidas" : minutes < 35 ? "medio álbum" : "un álbum completo";
  return {
    category,
    minutes,
    planItem: minutes >= 35 ? item : undefined,
    title: minutes >= 35 && item ? `Escucha ${item.title}` : `Escucha ${what}`,
    subtitle: "Sin saltar canciones",
  };
}

export function minutesByDay(sessions: Session[], days = 7) {
  const out: { date: string; label: string; minutes: number }[] = [];
  const names = ["D", "L", "M", "M", "J", "V", "S"];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const minutes = sessions
      .filter((s) => new Date(s.startedAt).toDateString() === key)
      .reduce((a, s) => a + s.actualMin, 0);
    out.push({ date: key, label: names[d.getDay()], minutes });
  }
  return out;
}

export function lastSessionMinutes(sessions: Session[]) {
  const last = [...sessions].reverse().find((s) => s.actualMin > 0);
  return last?.actualMin;
}
