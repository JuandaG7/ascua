"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowsShuffle, IconCheck, IconPlayerPlay, IconWind } from "@tabler/icons-react";
import { setState, today, useAppState } from "@/lib/store";
import {
  CATEGORY_LABEL,
  buildChallenge,
  lastSessionMinutes,
  levelInfo,
  pickCategory,
  progressToNextLevel,
  targetMinutes,
} from "@/lib/levels";
import type { Energy } from "@/lib/types";
import { CAT_STYLE, CategoryIcon } from "@/components/ui";

const ENERGIES: { value: Energy; label: string }[] = [
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
];

const ENERGY_NOTE: Record<Energy, string> = {
  bajo: "Día suave. Hoy el reto es más corto, y está bien.",
  medio: "Vamos con tu ritmo normal.",
  alto: "Buen día para estirarte un poquito más.",
};

function focusHref(c: { category: string; minutes: number; title: string }) {
  const q = new URLSearchParams({ cat: c.category, min: String(c.minutes), title: c.title });
  return `/foco?${q}`;
}

export default function Home() {
  const state = useAppState();
  const [shift, setShift] = useState(0);
  const date = today();
  const checkIn = state.checkIns.find((c) => c.date === date);
  const energy = checkIn?.energy;

  const category = pickCategory(state.sessions, date, shift);
  const minutes = targetMinutes(state.level, energy);
  const challenge = buildChallenge(category, minutes, state.plan);
  const lvl = levelInfo(state.level);
  const { good, needed } = progressToNextLevel(state);
  const last = lastSessionMinutes(state.sessions);
  const doneToday = state.sessions.some(
    (s) => s.completed && new Date(s.startedAt).toDateString() === new Date().toDateString(),
  );

  const setEnergy = (e: Energy) =>
    setState((s) => ({
      ...s,
      checkIns: [...s.checkIns.filter((c) => c.date !== date), { date, energy: e }],
    }));

  const dateLabel = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short" });
  const pendingPlan = state.plan.filter((p) => !p.done);

  return (
    <div className="fade-in">
      <p className="text-[12px] font-medium tracking-[0.02em] text-ink-soft first-letter:uppercase">{dateLabel}</p>
      <h1 className="mt-1 mb-5 font-serif text-[28px] leading-9 tracking-[-0.01em]">¿Cómo llegas hoy?</h1>

      <section className="mb-3 rounded-[28px] bg-surface-warm p-3" aria-label="Tu energía hoy">
        <div className="flex gap-2" role="radiogroup">
          {ENERGIES.map((e) => {
            const on = energy === e.value;
            return (
              <button
                key={e.value}
                role="radio"
                aria-checked={on}
                onClick={() => setEnergy(e.value)}
                className={`h-11 flex-1 rounded-full text-[14px] font-medium transition-colors duration-300 ${
                  on ? "bg-energy-tint text-on-energy-tint" : "bg-surface-warm-nested text-ink-soft"
                }`}
              >
                {e.label}
              </button>
            );
          })}
        </div>
        {energy && <p className="fade-in px-2 pt-3 pb-1 text-[13px] text-ink-soft">{ENERGY_NOTE[energy]}</p>}
      </section>

      <section className={`mb-3 rounded-[28px] p-5 ${CAT_STYLE[challenge.category]}`}>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[12px] font-medium tracking-[0.02em]">
            <CategoryIcon category={challenge.category} size={16} />
            Tu reto de hoy · {CATEGORY_LABEL[challenge.category].toLowerCase()}
          </p>
          <button
            onClick={() => setShift((s) => s + 1)}
            className="-mr-1 rounded-full p-2 opacity-80 transition-opacity hover:opacity-100"
            aria-label="Cambiar actividad"
          >
            <IconArrowsShuffle size={18} stroke={1.6} />
          </button>
        </div>
        <p className="mt-1 font-serif text-[24px] leading-8">{challenge.title}</p>
        <p className="mt-0.5 mb-4 text-[13px] opacity-90">
          {challenge.subtitle}
          {challenge.category !== "leer" && ` · ${challenge.minutes} min`}
        </p>
        {doneToday ? (
          <div className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-surface-raised/60 text-[15px] font-medium">
            <IconCheck size={18} /> Reto de hoy cumplido
          </div>
        ) : (
          <Link
            href={focusHref(challenge)}
            className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-energy text-[15px] font-semibold text-on-energy transition-colors duration-300 hover:bg-energy-hover"
          >
            <IconPlayerPlay size={18} stroke={2} aria-hidden /> Empezar
          </Link>
        )}
        {doneToday && (
          <Link href={focusHref(challenge)} className="mt-3 block text-center text-[13px] font-medium underline-offset-4 hover:underline">
            Hacer otra sesión
          </Link>
        )}
      </section>

      <Link
        href="/voz?antes=1"
        className="mb-3 flex items-center gap-3 rounded-[28px] bg-calm px-5 py-4 text-on-calm"
      >
        <IconWind size={22} stroke={1.6} aria-hidden />
        <div>
          <p className="text-[14px] font-medium">¿Mucho ruido en la cabeza?</p>
          <p className="text-[12px] opacity-90">Vacíala en 2 minutos antes de empezar</p>
        </div>
      </Link>

      <section className="mb-3 rounded-[28px] bg-surface p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[12px] font-medium tracking-[0.02em] text-ink-soft">
            Tu atención · nivel {lvl.level}
          </p>
          <p className="font-serif text-[15px]">{lvl.name}</p>
        </div>
        <div className="h-2 rounded-full bg-surface-nested" role="progressbar" aria-valuenow={good} aria-valuemax={needed}>
          <div
            className="h-2 rounded-full bg-focus transition-[width] duration-700"
            style={{ width: `${Math.max(4, (good / needed) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-[13px] text-on-focus-tint">
          {last ? `Tu última sesión: ${last} min de atención` : `Aguanta ${lvl.minutes} min para sumar a tu nivel`}
          {" · "}
          {good}/{needed} para subir
        </p>
      </section>

      {pendingPlan.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-serif text-[20px]">Tu plan</h2>
          <ul className="space-y-2">
            {pendingPlan.slice(0, 4).map((p) => (
              <li key={p.id}>
                <Link
                  href={focusHref({ category: p.category, minutes: p.minutes, title: p.title })}
                  className={`flex items-center gap-3 rounded-[20px] px-4 py-3 ${CAT_STYLE[p.category]}`}
                >
                  <CategoryIcon category={p.category} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-[16px] font-medium">{p.title}</p>
                    <p className="text-[12px] opacity-90">{[p.by, p.meta].filter(Boolean).join(" · ")}</p>
                  </div>
                  <IconPlayerPlay size={18} stroke={1.6} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
