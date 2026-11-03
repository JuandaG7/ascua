"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IconCheck,
  IconCircleCheck,
  IconKey,
  IconMessageCircle,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import { setState, useAppState } from "@/lib/store";
import { isFinished, matchReason, recommendedFor, workKey } from "@/lib/catalog";
import { addToPlan } from "@/lib/plan";
import { CATEGORY_LABEL, levelInfo } from "@/lib/levels";
import { DEFAULT_CATEGORIES, WORK_CATEGORIES, isWork } from "@/lib/activities";
import { generateAiRecs } from "@/lib/airecs";
import { MissingKeyError } from "@/lib/chat";
import { focusHref } from "@/lib/focus";
import { phoneLabel, ratingLabel, removeFinished } from "@/lib/works";
import type { Category, WorkCategory } from "@/lib/types";
import { CAT_STYLE, CategoryIcon, PageTitle } from "@/components/ui";
import FinishSheet, { type FinishTarget } from "@/components/FinishSheet";

const DONE_LABEL: Record<WorkCategory, string> = { leer: "Ya lo leí", ver: "Ya la vi", escuchar: "Ya lo escuché" };

function CardActions({
  item,
  inPlan,
  onFinish,
}: {
  item: { category: Category; title: string; by?: string; meta?: string; minutes: number };
  inPlan: boolean;
  onFinish: (t: FinishTarget) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        onClick={() => addToPlan(item)}
        disabled={inPlan}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-raised/60 px-4 text-[13px] font-medium"
      >
        {inPlan ? <IconCheck size={16} /> : <IconPlus size={16} />}
        {inPlan ? "En tu plan" : "Agregar a mi plan"}
      </button>
      {isWork(item.category) && (
        <button
          onClick={() => onFinish({ category: item.category as WorkCategory, title: item.title, by: item.by })}
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium underline-offset-4 hover:underline"
        >
          <IconCircleCheck size={16} stroke={1.6} />
          {DONE_LABEL[item.category as WorkCategory]}
        </button>
      )}
    </div>
  );
}

export default function Biblioteca() {
  const state = useAppState();
  const [filter, setFilter] = useState<Category | "todo">("todo");
  const [finishing, setFinishing] = useState<FinishTarget | null>(null);
  const [aiState, setAiState] = useState<"idle" | "loading" | "nokey">("idle");
  const [aiError, setAiError] = useState("");

  const lvl = levelInfo(state.level);
  const wants = state.profile?.wants.length ? state.profile.wants : DEFAULT_CATEGORIES;
  const FILTERS: (Category | "todo")[] = ["todo", ...wants];
  const show = (c: Category) => filter === "todo" || c === filter;
  const wantsWorks = wants.some(isWork);

  const items = recommendedFor(state.level, state.profile, state.finished).filter((i) => show(i.category));
  const plan = state.plan.filter((p) => !p.done && show(p.category));
  const aiRecs = (state.aiRecs?.items ?? []).filter((r) => show(r.category) && !isFinished(r.title, state.finished));
  const finished = (state.finished ?? []).filter((f) => show(f.category));
  const inPlan = (title: string) => state.plan.some((p) => workKey(p.title) === workKey(title) && !p.done);

  const removePlan = (id: string) => setState((s) => ({ ...s, plan: s.plan.filter((p) => p.id !== id) }));

  const askClaude = async () => {
    setAiError("");
    setAiState("loading");
    try {
      await generateAiRecs();
      setAiState("idle");
    } catch (e) {
      if (e instanceof MissingKeyError) setAiState("nokey");
      else {
        setAiState("idle");
        setAiError(e instanceof Error ? e.message : "Algo salió mal.");
      }
    }
  };

  const forget = (key: string, title: string) => {
    if (window.confirm(`¿Quitar "${title}" de lo que ya terminaste?`)) removeFinished(key);
  };

  return (
    <div className="fade-in">
      <PageTitle sub={`Para tu nivel ${lvl.level} · ${lvl.name}. Enganchan, pero piden atención.`}>Biblioteca</PageTitle>

      <div className="no-scrollbar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5" role="tablist">
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
                  <p className="text-[12px] opacity-90">{[p.by !== "Idea" && p.by, p.meta].filter(Boolean).join(" · ")}</p>
                </div>
                <Link
                  href={focusHref({ category: p.category, minutes: p.minutes, title: p.title, work: p.title, by: p.by })}
                  className="grid size-10 place-items-center rounded-full bg-surface-raised/60"
                  aria-label={`Empezar ${p.title}`}
                >
                  <IconPlayerPlay size={18} stroke={1.8} />
                </Link>
                {isWork(p.category) ? (
                  <button
                    onClick={() => setFinishing({ category: p.category as WorkCategory, title: p.title, by: p.by })}
                    className="grid size-10 place-items-center rounded-full opacity-80 hover:opacity-100"
                    aria-label={`Marcar ${p.title} como terminado`}
                  >
                    <IconCircleCheck size={19} stroke={1.6} />
                  </button>
                ) : (
                  <button
                    onClick={() => removePlan(p.id)}
                    className="grid size-10 place-items-center rounded-full opacity-70 hover:opacity-100"
                    aria-label={`Quitar ${p.title} del plan`}
                  >
                    <IconX size={18} stroke={1.6} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {wantsWorks && (filter === "todo" || isWork(filter)) && (
        <section className="mb-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-serif text-[20px]">Según tus favoritos</h2>
            {state.aiRecs && aiState !== "loading" && (
              <button onClick={askClaude} className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-soft">
                <IconRefresh size={15} aria-hidden /> Otras
              </button>
            )}
          </div>

          {!state.aiRecs && aiState !== "loading" && (
            <button onClick={askClaude} className="flex w-full items-center gap-3 rounded-[24px] bg-surface p-4 text-left">
              <IconSparkles size={22} stroke={1.6} className="shrink-0 text-focus" aria-hidden />
              <span>
                <span className="block text-[14px] font-medium">Pedirle recomendaciones a Claude</span>
                <span className="block text-[12px] leading-5 text-ink-soft">
                  Con tus favoritos, lo que ya terminaste y lo que te pareció. Tarda unos segundos.
                </span>
              </span>
            </button>
          )}

          {aiState === "loading" && (
            <div className="rounded-[24px] bg-surface p-5 text-center">
              <IconSparkles size={22} stroke={1.6} className="breathe mx-auto text-focus" aria-hidden />
              <p className="mt-2 text-[13px] text-ink-soft">Buscando cosas que te van a gustar…</p>
            </div>
          )}

          {aiState === "nokey" && (
            <Link href="/ajustes" className="mt-2 flex items-center gap-3 rounded-[20px] bg-surface-warm px-4 py-3 text-on-energy-tint">
              <IconKey size={20} stroke={1.6} aria-hidden />
              <span className="text-[13px]">
                Para esto necesitas tu API key de Anthropic en <span className="font-semibold underline">Ajustes</span>.
              </span>
            </Link>
          )}
          {aiError && <p className="mt-2 rounded-[16px] bg-surface-warm px-4 py-3 text-[13px] text-on-energy-tint">{aiError}</p>}

          {aiState !== "loading" && aiRecs.length > 0 && (
            <ul className="space-y-3">
              {aiRecs.map((r) => (
                <li key={workKey(r.title)} className={`rounded-[24px] p-4 ${CAT_STYLE[r.category]}`}>
                  <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.02em]">
                    <CategoryIcon category={r.category} size={14} />
                    {r.meta}
                  </p>
                  <p className="mt-1 font-serif text-[19px] leading-6 font-medium">{r.title}</p>
                  <p className="text-[12px] opacity-90">{r.by}</p>
                  <p className="mt-2 text-[13px] leading-5 opacity-90">{r.why}</p>
                  <CardActions item={r} inPlan={inPlan(r.title)} onFinish={setFinishing} />
                </li>
              ))}
            </ul>
          )}
          {state.aiRecs && aiState !== "loading" && aiRecs.length === 0 && (
            <p className="text-[13px] text-ink-soft">Ya terminaste todas las de esta tanda. Pide otras.</p>
          )}
        </section>
      )}

      <h2 className="mb-3 font-serif text-[20px]">Recomendado para tu nivel</h2>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.id} className={`rounded-[24px] p-4 ${CAT_STYLE[i.category]}`}>
            <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.02em]">
              <CategoryIcon category={i.category} size={14} />
              {i.by === "Idea" ? `Idea · ${i.meta}` : i.meta}
              {i.minLevel > state.level && " · un pequeño reto"}
            </p>
            <p className="mt-1 font-serif text-[19px] leading-6 font-medium">{i.title}</p>
            {i.by !== "Idea" && <p className="text-[12px] opacity-90">{i.by}</p>}
            <p className="mt-2 text-[13px] leading-5 opacity-90">{i.why}</p>
            {matchReason(i, state.profile) && <p className="mt-2 text-[12px] font-medium">{matchReason(i, state.profile)}</p>}
            <CardActions item={i} inPlan={inPlan(i.title)} onFinish={setFinishing} />
          </li>
        ))}
      </ul>

      {finished.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-1 font-serif text-[20px]">Lo que ya terminaste</h2>
          <p className="mb-3 text-[13px] text-ink-soft">No te lo volvemos a recomendar, y tu opinión afina lo que te sugerimos.</p>
          <ul className="space-y-2">
            {finished.map((f) => (
              <li key={f.key} className="flex items-center gap-3 rounded-[20px] bg-surface py-3 pr-2 pl-4">
                <span className="text-ink-soft">
                  <CategoryIcon category={f.category} />
                </span>
                <button
                  onClick={() => setFinishing({ category: f.category, title: f.title, by: f.by, initial: f })}
                  className="min-w-0 flex-1 text-left"
                  aria-label={`Editar tu opinión sobre ${f.title}`}
                >
                  <p className="truncate font-serif text-[16px] font-medium">{f.title}</p>
                  <p className="text-[12px] text-ink-soft">
                    {[
                      f.status === "dejado" ? "Lo dejaste" : "Terminado",
                      ratingLabel(f.rating),
                      f.phone && `Celular: ${phoneLabel(f.phone)?.toLowerCase()}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </button>
                <button
                  onClick={() => forget(f.key, f.title)}
                  className="grid size-10 place-items-center rounded-full text-ink-faint"
                  aria-label={`Quitar ${f.title} de lo terminado`}
                >
                  <IconX size={18} stroke={1.6} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {WORK_CATEGORIES.some((c) => wants.includes(c)) && (
        <Link href="/chat" className="mt-6 flex items-center gap-3 rounded-[24px] bg-surface p-4">
          <IconMessageCircle size={22} stroke={1.6} className="text-focus" aria-hidden />
          <div>
            <p className="text-[14px] font-medium">¿Buscas algo específico?</p>
            <p className="text-[12px] text-ink-soft">Pregúntale al chat por un libro, peli o álbum</p>
          </div>
        </Link>
      )}

      <FinishSheet target={finishing} onClose={() => setFinishing(null)} />
    </div>
  );
}
