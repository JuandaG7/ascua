"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconArrowLeft, IconCheck, IconPlus, IconX } from "@tabler/icons-react";
import { getState, setState } from "@/lib/store";
import {
  ATTENTION_OPTIONS,
  DISTRACTOR_OPTIONS,
  FAVORITE_PROMPTS,
  GOAL_OPTIONS,
  MUSIC_LIKES,
  STORY_LIKES,
  TIME_OPTIONS,
  WANT_OPTIONS,
  startingLevel,
} from "@/lib/profile";
import { levelInfo } from "@/lib/levels";
import { GROUPS } from "@/lib/activities";
import type { Category, Profile, WorkCategory } from "@/lib/types";

type Draft = Omit<Profile, "completedAt" | "attention"> & { attention?: Profile["attention"] };

const STEPS = ["intro", "atencion", "quiere", "gustos", "favoritos", "tiempo", "distrae", "meta", "listo"] as const;

function Option({
  selected,
  onClick,
  label,
  sub,
  multi,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center gap-3 rounded-[22px] px-5 py-3 text-left transition-colors duration-300 ${
        selected ? "bg-primary text-on-primary" : "bg-surface text-ink"
      }`}
    >
      <span className="flex-1">
        <span className="block text-[15px] font-medium">{label}</span>
        {sub && <span className={`block text-[13px] ${selected ? "opacity-80" : "text-ink-soft"}`}>{sub}</span>}
      </span>
      {selected && <IconCheck size={18} stroke={2} aria-hidden />}
    </button>
  );
}

function Chip({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={`h-11 rounded-full px-4 text-[14px] font-medium transition-colors duration-300 ${
        selected ? "bg-primary text-on-primary" : "bg-surface text-ink"
      }`}
    >
      {label}
    </button>
  );
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

const MAX_FAVORITES = 5;

/** Campo para escribir favoritos uno por uno; se muestran como etiquetas que se pueden quitar. */
function FavoriteInput({
  label,
  placeholder,
  items,
  onChange,
  onPending,
}: {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  onPending: (text: string) => void; // lo escrito sin tocar +, para no perderlo al seguir
}) {
  const [text, setTextState] = useState("");
  const setText = (t: string) => {
    setTextState(t);
    onPending(t);
  };
  const add = () => {
    const t = text.trim();
    if (!t || items.length >= MAX_FAVORITES || items.some((i) => i.toLowerCase() === t.toLowerCase())) return setText("");
    onChange([...items, t]);
    setText("");
  };
  const id = `fav-${label}`;
  return (
    <div className="mb-6">
      <label htmlFor={id} className="mb-2 block text-[13px] font-medium text-ink-soft">
        {label}
      </label>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="flex gap-2"
      >
        <input
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={add}
          placeholder={items.length >= MAX_FAVORITES ? "Máximo 5" : placeholder}
          disabled={items.length >= MAX_FAVORITES}
          autoComplete="off"
          className="h-11 min-w-0 flex-1 rounded-full bg-surface-raised px-4 text-[15px] outline-none ring-1 ring-line placeholder:text-ink-faint focus:ring-2 focus:ring-focus"
        />
        <button
          type="submit"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-nested text-ink"
          aria-label={`Agregar a ${label.toLowerCase()}`}
        >
          <IconPlus size={18} />
        </button>
      </form>
      {items.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {items.map((i) => (
            <li key={i} className="flex h-9 items-center gap-1 rounded-full bg-primary pr-1 pl-4 text-[13px] font-medium text-on-primary">
              {i}
              <button
                type="button"
                onClick={() => onChange(items.filter((x) => x !== i))}
                className="grid size-7 place-items-center rounded-full"
                aria-label={`Quitar ${i}`}
              >
                <IconX size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Bienvenida() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [d, setD] = useState<Draft>({ wants: [], likes: [], distractors: [] });

  // Si vuelves a responder desde Ajustes, parte de tus respuestas anteriores.
  useEffect(() => {
    const s = getState();
    if (s.name) setName(s.name);
    if (s.profile) setD({ ...s.profile });
  }, []);

  const id = STEPS[step];
  const update = (patch: Partial<Draft> | ((x: Draft) => Partial<Draft>)) => {
    setError("");
    setD((x) => ({ ...x, ...(typeof patch === "function" ? patch(x) : patch) }));
  };

  const showStories = d.wants.includes("leer") || d.wants.includes("ver");
  const showMusic = d.wants.includes("escuchar");
  const favoritePrompts = FAVORITE_PROMPTS.filter((f) => d.wants.includes(f.category));
  // Sin obras elegidas no tiene sentido preguntar gustos ni favoritos.
  const skips = (i: number) =>
    (STEPS[i] === "gustos" && !showStories && !showMusic) || (STEPS[i] === "favoritos" && favoritePrompts.length === 0);

  const go = (dir: 1 | -1) => {
    setError("");
    setStep((s) => {
      let n = s + dir;
      while (n > 0 && n < STEPS.length - 1 && skips(n)) n += dir;
      return Math.max(0, Math.min(STEPS.length - 1, n));
    });
    window.scrollTo({ top: 0 });
  };

  const next = () => {
    if (id === "atencion" && !d.attention) return setError("Elige una opción para seguir.");
    if (id === "quiere" && d.wants.length === 0) return setError("Elige al menos una.");
    if (id === "listo") return finish();
    if (id === "favoritos") commitPending();
    go(1);
  };

  const back = () => go(-1);

  const setFavorites = (c: WorkCategory, items: string[]) =>
    update((x) => ({ favorites: { ...x.favorites, [c]: items } }));

  const pending = useRef<Partial<Record<WorkCategory, string>>>({});
  const commitPending = () => {
    const entries = Object.entries(pending.current) as [WorkCategory, string][];
    pending.current = {};
    update((x) => {
      const favorites = { ...x.favorites };
      for (const [c, t] of entries) {
        const list = favorites[c] ?? [];
        const v = t.trim();
        if (v && list.length < MAX_FAVORITES && !list.some((i) => i.toLowerCase() === v.toLowerCase())) favorites[c] = [...list, v];
      }
      return { favorites };
    });
  };

  const start = startingLevel(d.attention ?? "menos5");

  const finish = () => {
    const profile: Profile = { ...d, attention: d.attention ?? "menos5", completedAt: new Date().toISOString() };
    setState((s) => ({
      ...s,
      profile,
      name: name.trim() || s.name,
      // Si ya tenías progreso, no te bajamos de nivel.
      level: s.sessions.length ? Math.max(s.level, start) : start,
    }));
    router.replace("/");
  };

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col px-5"
      style={{
        paddingTop: "max(1.25rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={back}
          className={`-ml-2 rounded-full p-2 text-ink-soft ${step === 0 ? "invisible" : ""}`}
          aria-label="Atrás"
        >
          <IconArrowLeft size={20} />
        </button>
        <div className="h-1.5 flex-1 rounded-full bg-surface-nested" role="progressbar" aria-valuenow={step} aria-valuemax={STEPS.length - 1}>
          <div
            className="h-1.5 rounded-full bg-focus transition-[width] duration-500"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
        <span className="w-9" />
      </div>

      <div key={id} className="fade-in flex-1">
        {id === "intro" && (
          <div className="pt-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- sitio estático, la imagen ya está optimizada */}
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icons/icon-192.png`} alt="" className="mb-6 size-20 rounded-[22px]" />
            <h1 className="font-serif text-[34px] leading-10 tracking-[-0.01em]">Te damos la bienvenida a Ascua</h1>
            <p className="mt-3 text-[16px] leading-7 text-ink-soft">
              Una brasa pequeña que no se apaga: así se recupera la atención, poco a poco. Antes de empezar, unas preguntas rápidas para que
              los retos y las recomendaciones sean para ti.
            </p>
            <label htmlFor="name" className="mt-8 mb-2 block text-[13px] font-medium text-ink-soft">
              ¿Cómo te llamas? (opcional)
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="given-name"
              className="h-12 w-full rounded-full bg-surface-raised px-5 text-[16px] outline-none ring-1 ring-line focus:ring-2 focus:ring-focus"
            />
          </div>
        )}

        {id === "atencion" && (
          <Question title="Hoy, ¿cuánto puedes concentrarte en algo sin mirar el celular?" sub="Con honestidad: empezamos donde estás hoy, no donde quisieras estar.">
            <div className="space-y-2" role="radiogroup">
              {ATTENTION_OPTIONS.map((o) => (
                <Option key={o.value} label={o.label} selected={d.attention === o.value} onClick={() => update({ attention: o.value })} />
              ))}
            </div>
          </Question>
        )}

        {id === "quiere" && (
          <Question title="¿Qué te gustaría hacer más?" sub="Puedes elegir varias. Solo te propondremos retos de estas.">
            {GROUPS.map((g) => (
              <div key={g.id} className="mb-5">
                <p className="mb-2 text-[13px] font-medium text-ink-soft">{g.label}</p>
                <div className="space-y-2">
                  {WANT_OPTIONS.filter((o) => o.group === g.id).map((o) => (
                    <Option
                      key={o.value}
                      multi
                      label={o.label}
                      sub={o.sub}
                      selected={d.wants.includes(o.value)}
                      onClick={() => update((x) => ({ wants: toggle<Category>(x.wants, o.value) }))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </Question>
        )}

        {id === "gustos" && (
          <Question title="¿Qué te gusta?" sub="Elige todo lo que te llame. Con esto ordenamos tus recomendaciones.">
            {showStories && (
              <>
                <p className="mb-2 text-[13px] font-medium text-ink-soft">Historias (libros y películas)</p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {STORY_LIKES.map((o) => (
                    <Chip key={o.value} label={o.label} selected={d.likes.includes(o.value)} onClick={() => update((x) => ({ likes: toggle(x.likes, o.value) }))} />
                  ))}
                </div>
              </>
            )}
            {showMusic && (
              <>
                <p className="mb-2 text-[13px] font-medium text-ink-soft">Música</p>
                <div className="flex flex-wrap gap-2">
                  {MUSIC_LIKES.map((o) => (
                    <Chip key={o.value} label={o.label} selected={d.likes.includes(o.value)} onClick={() => update((x) => ({ likes: toggle(x.likes, o.value) }))} />
                  ))}
                </div>
              </>
            )}
          </Question>
        )}

        {id === "favoritos" && (
          <Question
            title="¿Cuáles son tus favoritos?"
            sub="Escribe uno y toca +. Con esto sabemos qué recomendarte y el chat entiende tu gusto."
          >
            {favoritePrompts.map((f) => (
              <FavoriteInput
                key={f.category}
                label={f.label}
                placeholder={f.placeholder}
                items={d.favorites?.[f.category] ?? []}
                onChange={(items) => setFavorites(f.category, items)}
                onPending={(t) => (pending.current[f.category] = t)}
              />
            ))}
          </Question>
        )}

        {id === "tiempo" && (
          <Question title="¿Cuándo tienes más tiempo para ti?">
            <div className="space-y-2" role="radiogroup">
              {TIME_OPTIONS.map((o) => (
                <Option key={o.value} label={o.label} selected={d.time === o.value} onClick={() => update({ time: o.value })} />
              ))}
            </div>
          </Question>
        )}

        {id === "distrae" && (
          <Question title="¿Qué es lo que más te roba la atención?" sub="Puedes elegir varias. Te daremos consejos para eso en el modo foco.">
            <div className="space-y-2">
              {DISTRACTOR_OPTIONS.map((o) => (
                <Option
                  key={o.value}
                  multi
                  label={o.label}
                  selected={d.distractors.includes(o.value)}
                  onClick={() => update((x) => ({ distractors: toggle(x.distractors, o.value) }))}
                />
              ))}
            </div>
          </Question>
        )}

        {id === "meta" && (
          <Question title="¿Qué es lo que más quieres lograr?">
            <div className="space-y-2" role="radiogroup">
              {GOAL_OPTIONS.map((o) => (
                <Option key={o.value} label={o.label} selected={d.goal === o.value} onClick={() => update({ goal: o.value })} />
              ))}
            </div>
          </Question>
        )}

        {id === "listo" && (
          <div className="pt-4">
            <h1 className="font-serif text-[30px] leading-9">{name.trim() ? `Listo, ${name.trim()}` : "Listo"}</h1>
            <p className="mt-2 text-[15px] leading-6 text-ink-soft">Este es tu punto de partida.</p>
            <div className="glow mt-6 rounded-[28px] bg-achievement-tint p-5 text-on-achievement-tint">
              <p className="text-[12px] font-medium tracking-[0.02em]">Empiezas en</p>
              <p className="font-serif text-[26px] leading-8">
                Nivel {start} · {levelInfo(start).name}
              </p>
              <p className="mt-1 text-[14px]">Sesiones de unos {levelInfo(start).minutes} minutos.</p>
            </div>
            <ul className="mt-5 space-y-3 text-[14px] leading-6 text-ink-soft">
              <li>
                <span className="font-medium text-ink">Empezamos en un punto cómodo</span> para que los primeros retos te salgan bien.
                Con 3 sesiones completas subes de nivel.
              </li>
              <li>
                <span className="font-medium text-ink">Tus recomendaciones</span> ya están ordenadas por lo que te gusta.
              </li>
              <li>
                <span className="font-medium text-ink">El chat te conoce:</span> sabe tus gustos, tu meta y qué te distrae.
              </li>
            </ul>
          </div>
        )}
      </div>

      {error && <p className="mb-3 text-[13px] text-on-energy-tint" role="alert">{error}</p>}

      <button
        onClick={next}
        className={`mt-6 h-[52px] w-full rounded-full text-[15px] font-semibold transition-colors duration-300 ${
          id === "listo" ? "bg-energy text-on-energy hover:bg-energy-hover" : "bg-primary text-on-primary hover:bg-primary-hover"
        }`}
      >
        {id === "intro" ? "Empezar" : id === "listo" ? "Ir a mi primer reto" : "Seguir"}
      </button>
      {["gustos", "favoritos", "tiempo", "distrae", "meta"].includes(id) && (
        <button onClick={() => go(1)} className="mt-2 h-10 text-[13px] text-ink-faint">
          Saltar esta pregunta
        </button>
      )}
    </main>
  );
}

function Question({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <>
      <h1 className="font-serif text-[26px] leading-8 tracking-[-0.01em]">{title}</h1>
      {sub && <p className="mt-2 text-[14px] leading-6 text-ink-soft">{sub}</p>}
      <div className="mt-6">{children}</div>
    </>
  );
}
