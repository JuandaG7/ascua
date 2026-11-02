"use client";

import Link from "next/link";
import { useState } from "react";
import { IconCheck, IconMessageCircle, IconPlayerPlay, IconPlus, IconX } from "@tabler/icons-react";
import { setState, useAppState } from "@/lib/store";
import { recommendedFor } from "@/lib/catalog";
import { addToPlan } from "@/lib/plan";
import { CATEGORY_LABEL, levelInfo } from "@/lib/levels";
import type { Category } from "@/lib/types";
import { CAT_STYLE, CategoryIcon, PageTitle } from "@/components/ui";

const FILTERS: (Category | "todo")[] = ["todo", "leer", "ver", "escuchar"];

export default function Biblioteca() {
  const state = useAppState();
  const [filter, setFilter] = useState<Category | "todo">("todo");
  const lvl = levelInfo(state.level);
  const items = recommendedFor(state.level).filter((i) => filter === "todo" || i.category === filter);
  const plan = state.plan.filter((p) => !p.done && (filter === "todo" || p.category === filter));
  const inPlan = (title: string) => state.plan.some((p) => p.title === title && !p.done);

  const remove = (id: string) => setState((s) => ({ ...s, plan: s.plan.filter((p) => p.id !== id) }));

  return (
    <div className="fade-in">
      <PageTitle sub={`Para tu nivel ${lvl.level} · ${lvl.name}. Enganchan, pero piden atención.`}>Biblioteca</PageTitle>

      <div className="mb-5 flex gap-2 overflow-x-auto" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-medium transition-colors duration-300 ${
              filter === f ? "bg-primary text-on-primary" : "bg-surface-nested text-ink"
            }`}
          >
            {f === "todo" ? "Todo" : CATEGORY_LABEL[f]}
          </button>
        ))}
      </div>

      {plan.length > 0 && (
        <section className="mb-7">
          <h2 className="mb-3 font-serif text-[20px]">Tu plan</h2>
          <ul className="space-y-2">
            {plan.map((p) => (
              <li key={p.id} className={`flex items-center gap-3 rounded-[20px] py-3 pr-2 pl-4 ${CAT_STYLE[p.category]}`}>
                <CategoryIcon category={p.category} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-[16px] font-medium">{p.title}</p>
                  <p className="text-[12px] opacity-90">{[p.by, p.meta].filter(Boolean).join(" · ")}</p>
                </div>
                <Link
                  href={`/foco?${new URLSearchParams({ cat: p.category, min: String(p.minutes), title: p.title })}`}
                  className="grid size-10 place-items-center rounded-full bg-surface-raised/60"
                  aria-label={`Empezar ${p.title}`}
                >
                  <IconPlayerPlay size={18} stroke={1.8} />
                </Link>
                <button
                  onClick={() => remove(p.id)}
                  className="grid size-10 place-items-center rounded-full opacity-70 hover:opacity-100"
                  aria-label={`Quitar ${p.title} del plan`}
                >
                  <IconX size={18} stroke={1.6} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mb-3 font-serif text-[20px]">Recomendado para ti</h2>
      <ul className="space-y-3">
        {items.map((i) => {
          const added = inPlan(i.title);
          return (
            <li key={i.id} className={`rounded-[24px] p-4 ${CAT_STYLE[i.category]}`}>
              <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.02em]">
                <CategoryIcon category={i.category} size={14} />
                {i.meta}
                {i.minLevel > state.level && " · un pequeño reto"}
              </p>
              <p className="mt-1 font-serif text-[19px] leading-6 font-medium">{i.title}</p>
              <p className="text-[12px] opacity-90">{i.by}</p>
              <p className="mt-2 text-[13px] leading-5 opacity-90">{i.why}</p>
              <button
                onClick={() => addToPlan(i)}
                disabled={added}
                className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-raised/60 px-4 text-[13px] font-medium"
              >
                {added ? <IconCheck size={16} /> : <IconPlus size={16} />}
                {added ? "En tu plan" : "Agregar a mi plan"}
              </button>
            </li>
          );
        })}
      </ul>

      <Link
        href="/chat"
        className="mt-6 flex items-center gap-3 rounded-[24px] bg-surface p-4"
      >
        <IconMessageCircle size={22} stroke={1.6} className="text-focus" aria-hidden />
        <div>
          <p className="text-[14px] font-medium">¿Buscas algo específico?</p>
          <p className="text-[12px] text-ink-soft">Pregúntale al chat por un libro, peli o álbum</p>
        </div>
      </Link>
    </div>
  );
}
