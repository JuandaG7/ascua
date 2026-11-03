"use client";

import { IconAward } from "@tabler/icons-react";
import { useAppState } from "@/lib/store";
import { CATEGORY_LABEL, LEVELS, minutesByDay, progressToNextLevel } from "@/lib/levels";
import type { AppState } from "@/lib/types";
import { DEFAULT_CATEGORIES } from "@/lib/activities";
import { CAT_STYLE, CategoryIcon, PageTitle } from "@/components/ui";

function achievements(s: AppState) {
  const done = s.sessions.filter((x) => x.completed);
  const total = s.sessions.reduce((a, x) => a + x.actualMin, 0);
  return [
    { id: "primera", label: "Primera sesión", sub: "Diste el primer paso", got: s.sessions.length > 0 },
    { id: "hora", label: "Una hora de atención", sub: "Sumando todas tus sesiones", got: total >= 60 },
    { id: "peli", label: "Película entera", sub: "Sin tocar el celular", got: done.some((x) => x.category === "ver" && x.actualMin >= 85) },
    { id: "album", label: "Álbum completo", sub: "Sin saltar canciones", got: done.some((x) => x.category === "escuchar" && x.actualMin >= 30) },
    { id: "lector", label: "Media hora leyendo", sub: "En una sola sesión", got: done.some((x) => x.category === "leer" && x.actualMin >= 30) },
    { id: "nivel3", label: "Nivel Llama", sub: "30 minutos seguidos", got: s.level >= 3 },
    { id: "obra", label: "Primera obra terminada", sub: "Un libro, peli o álbum completo", got: (s.finished ?? []).some((f) => f.status === "terminado") },
    { id: "sincel", label: "Cinco sin celular", sub: "Sesiones sin tocarlo ni una vez", got: s.sessions.filter((x) => x.phone === "nada").length >= 5 },
    { id: "crear", label: "Creaste algo", sub: "Escribir, dibujar o cocinar", got: s.sessions.some((x) => ["escribir", "dibujar", "cocinar"].includes(x.category)) },
    { id: "caminar", label: "A caminar", sub: "Una caminata sin pantalla", got: done.some((x) => x.category === "caminar") },
    { id: "diez", label: "10 horas", sub: "De atención profunda en total", got: total >= 600 },
  ];
}

export default function Progreso() {
  const state = useAppState();
  const week = minutesByDay(state.sessions);
  const weekTotal = week.reduce((a, d) => a + d.minutes, 0);
  const max = Math.max(30, ...week.map((d) => d.minutes));
  const { good, needed } = progressToNextLevel(state);
  const sessionsWeek = state.sessions.filter((s) => Date.now() - new Date(s.startedAt).getTime() < 7 * 864e5).length;

  const wants = state.profile?.wants.length ? state.profile.wants : DEFAULT_CATEGORIES;
  const used = new Set(state.sessions.map((s) => s.category));
  const helps = [...wants, ...[...used].filter((c) => !wants.includes(c))].map((c) => {
    const rated = state.sessions.filter((s) => s.category === c && s.helped !== undefined);
    const yes = rated.filter((s) => s.helped).length;
    return { c, rated: rated.length, pct: rated.length ? Math.round((yes / rated.length) * 100) : null };
  });

  const ach = achievements(state);
  const phoneAnswered = state.sessions.filter((s) => s.phone);
  const phoneFree = phoneAnswered.filter((s) => s.phone === "nada").length;
  const finishedCount = (state.finished ?? []).filter((f) => f.status === "terminado").length;

  return (
    <div className="fade-in">
      <PageTitle sub="En minutos reales, sin puntos ni rachas.">Tu progreso</PageTitle>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="rounded-[24px] bg-surface p-4">
          <p className="text-[12px] text-ink-soft">Esta semana</p>
          <p className="font-serif text-[32px] leading-10">
            {weekTotal}
            <span className="text-[15px] text-ink-soft"> min</span>
          </p>
        </div>
        <div className="rounded-[24px] bg-surface p-4">
          <p className="text-[12px] text-ink-soft">Sesiones</p>
          <p className="font-serif text-[32px] leading-10">{sessionsWeek}</p>
        </div>
      </div>

      {(phoneAnswered.length > 0 || finishedCount > 0) && (
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-[24px] bg-surface p-4">
            <p className="text-[12px] text-ink-soft">Sin tocar el celular</p>
            <p className="font-serif text-[32px] leading-10">
              {phoneAnswered.length ? Math.round((phoneFree / phoneAnswered.length) * 100) : 0}
              <span className="text-[15px] text-ink-soft">%</span>
            </p>
            <p className="text-[11px] text-ink-faint">de {phoneAnswered.length} sesiones</p>
          </div>
          <div className="rounded-[24px] bg-surface p-4">
            <p className="text-[12px] text-ink-soft">Obras terminadas</p>
            <p className="font-serif text-[32px] leading-10">{finishedCount}</p>
            <p className="text-[11px] text-ink-faint">libros, pelis y álbumes</p>
          </div>
        </div>
      )}

      <section className="mb-3 rounded-[28px] bg-surface p-5">
        <p className="mb-4 text-[12px] font-medium tracking-[0.02em] text-ink-soft">Atención profunda por día</p>
        <div className="flex items-end justify-between gap-2">
          {week.map((d, i) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end">
                <div
                  className={`w-full rounded-full transition-[height] duration-700 ${d.minutes ? "bg-focus" : "bg-surface-nested"}`}
                  style={{ height: `${Math.max(6, (d.minutes / max) * 100)}%` }}
                  title={`${d.minutes} min`}
                />
              </div>
              <span className={`text-[11px] ${i === week.length - 1 ? "font-semibold text-ink" : "text-ink-faint"}`}>{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-3 rounded-[28px] bg-surface p-5">
        <p className="mb-3 text-[12px] font-medium tracking-[0.02em] text-ink-soft">Niveles</p>
        <ol className="space-y-1.5">
          {LEVELS.map((l) => {
            const current = l.level === state.level;
            const reached = l.level <= state.level;
            return (
              <li
                key={l.level}
                className={`flex items-center justify-between rounded-full px-4 py-2 text-[14px] ${
                  current ? "bg-focus-tint text-on-focus-tint" : reached ? "text-ink" : "text-ink-faint"
                }`}
              >
                <span className="font-serif text-[16px]">
                  {l.level}. {l.name}
                </span>
                <span className="text-[12px]">
                  {current ? `${good}/${needed} · ` : ""}
                  {l.minutes} min
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mb-3 rounded-[28px] bg-surface p-5">
        <p className="mb-1 text-[12px] font-medium tracking-[0.02em] text-ink-soft">Lo que te funciona</p>
        <p className="mb-3 text-[12px] text-ink-faint">Según lo que respondes al terminar. El reto diario se ajusta con esto.</p>
        <ul className="space-y-2">
          {helps.map(({ c, rated, pct }) => (
            <li key={c} className={`flex items-center gap-3 rounded-[18px] px-4 py-2.5 ${CAT_STYLE[c]}`}>
              <CategoryIcon category={c} />
              <span className="flex-1 text-[14px] font-medium">{CATEGORY_LABEL[c]}</span>
              <span className="text-[13px]">{pct === null ? "Sin datos aún" : `Te ayudó ${pct}% · ${rated}`}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 font-serif text-[20px]">Logros</h2>
        <ul className="grid grid-cols-2 gap-3">
          {ach.map((a) => (
            <li
              key={a.id}
              className={`rounded-[24px] p-4 ${a.got ? "bg-achievement-tint text-on-achievement-tint" : "bg-surface text-ink-faint"}`}
            >
              <IconAward size={22} stroke={1.6} aria-hidden />
              <p className="mt-2 font-serif text-[16px] leading-5 font-medium">{a.label}</p>
              <p className="mt-0.5 text-[12px]">{a.sub}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
