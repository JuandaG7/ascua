"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { IconArrowLeft, IconMinus, IconPlayerPause, IconPlayerPlay, IconPlus } from "@tabler/icons-react";
import { getState, setState, uid } from "@/lib/store";
import { CATEGORY_VERB, evaluateLevel, levelInfo } from "@/lib/levels";
import { focusTip } from "@/lib/profile";
import { ACTIVITIES, isWork } from "@/lib/activities";
import { PHONE_OPTIONS, RATING_OPTIONS, saveFinished } from "@/lib/works";
import type { Category, FinishedWork, PhoneUse, Rating } from "@/lib/types";

type Phase = "listo" | "corriendo" | "terminado";

/** Una pregunta con respuestas en píldoras; la elegida queda marcada. */
function Ask<T extends string>({
  q,
  options,
  value,
  onPick,
}: {
  q: string;
  options: { value: T; label: string }[];
  value?: T;
  onPick: (v: T) => void;
}) {
  return (
    <div className="fade-in mb-5">
      <p className="mb-2 text-[14px] text-zen-soft">{q}</p>
      <div className="flex gap-2" role="radiogroup" aria-label={q}>
        {options.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onPick(o.value)}
            className={`h-12 flex-1 rounded-full px-2 text-[13px] font-medium transition-colors duration-300 ${
              value === o.value ? "bg-zen-ink text-zen" : "bg-zen-raised text-zen-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const HELPED = [
  { value: "no", label: "No mucho" },
  { value: "si", label: "Sí" },
] as const;

const STATUS = [
  { value: "sigo", label: "Todavía no" },
  { value: "terminado", label: "Sí, lo terminé" },
  { value: "dejado", label: "Lo dejé" },
] as const;

function chime() {
  try {
    const ctx = new AudioContext();
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.35;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 1.7);
    });
  } catch {
    // Sin audio disponible.
  }
  navigator.vibrate?.([200, 120, 200]);
}

function Focus() {
  const params = useSearchParams();
  const router = useRouter();
  const category = (params.get("cat") as Category) || "leer";
  const title = params.get("title") || "Sesión de foco";
  // La obra de esta sesión (libro, película o álbum), si viene del plan o de una recomendación.
  const work = isWork(category) ? (params.get("work") ?? undefined) : undefined;
  const workBy = params.get("by") ?? undefined;
  const [planned, setPlanned] = useState(() => Math.max(5, Number(params.get("min")) || 20));

  const [phase, setPhase] = useState<Phase>("listo");
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0); // ms
  const startRef = useRef(0);
  const accRef = useRef(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [leveledUp, setLeveledUp] = useState<number | null>(null);
  const [helped, setHelped] = useState<"si" | "no">();
  const [phone, setPhone] = useState<PhoneUse>();
  const [status, setStatus] = useState<"sigo" | FinishedWork["status"]>();
  const [rating, setRating] = useState<Rating>();
  const [tip, setTip] = useState<string>();
  useEffect(() => setTip(focusTip(getState().profile)), []);

  const total = planned * 60_000;

  const finish = useCallback(
    (done: boolean) => {
      const ms = accRef.current + (startRef.current ? Date.now() - startRef.current : 0);
      // Si terminas antes (por ejemplo, ya leíste las páginas) cuentan los minutos reales.
      const actualMin = ms >= total ? planned : Math.max(done ? 1 : 0, Math.round(ms / 60_000));
      const id = uid();
      const before = getState().level;
      setState((s) => {
        const next = {
          ...s,
          sessions: [
            ...s.sessions,
            {
              id,
              startedAt: new Date(Date.now() - ms).toISOString(),
              category,
              title,
              plannedMin: planned,
              actualMin,
              completed: done,
              work,
            },
          ],
        };
        return { ...next, level: evaluateLevel(next) };
      });
      const after = getState().level;
      if (after > before) setLeveledUp(after);
      startRef.current = 0;
      setSessionId(id);
      setCompleted(done);
      setElapsed(ms);
      setPhase("terminado");
      if (done) chime();
    },
    [category, planned, title, total, work],
  );

  useEffect(() => {
    if (phase !== "corriendo" || paused) return;
    const tick = () => {
      const ms = accRef.current + Date.now() - startRef.current;
      setElapsed(ms);
      if (ms >= total) finish(true);
    };
    tick();
    const t = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [phase, paused, total, finish]);

  // Mantener la pantalla encendida mientras corre (si el navegador lo permite).
  useEffect(() => {
    if (phase !== "corriendo") return;
    let lock: WakeLockSentinel | undefined;
    navigator.wakeLock?.request("screen").then((l) => (lock = l)).catch(() => {});
    return () => {
      lock?.release().catch(() => {});
    };
  }, [phase]);

  const start = () => {
    startRef.current = Date.now();
    accRef.current = 0;
    setElapsed(0);
    setPhase("corriendo");
  };

  const togglePause = () => {
    if (paused) {
      startRef.current = Date.now();
    } else {
      accRef.current += Date.now() - startRef.current;
      startRef.current = 0;
    }
    setPaused(!paused);
  };

  const updateSession = (patch: { helped?: boolean; phone?: PhoneUse }) =>
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((x) => (x.id === sessionId ? { ...x, ...patch } : x)),
    }));

  const pickStatus = (v: "sigo" | FinishedWork["status"]) => {
    setStatus(v);
    if (v !== "sigo" && work && isWork(category)) saveFinished({ category, title: work, by: workBy, status: v, rating, phone });
  };

  const pickRating = (v: Rating) => {
    setRating(v);
    if (status && status !== "sigo" && work && isWork(category))
      saveFinished({ category, title: work, by: workBy, status, rating: v, phone });
  };

  const remaining = Math.max(0, total - elapsed);
  const mm = Math.floor(remaining / 60_000);
  const ss = Math.floor((remaining % 60_000) / 1000);
  const R = 92;
  const C = 2 * Math.PI * R;
  const progress = Math.min(1, elapsed / total);

  return (
    <main
      className="flex min-h-dvh flex-col bg-zen px-6 text-zen-ink"
      style={{
        paddingTop: "max(1.25rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {phase === "listo" && (
          <>
            <Link href="/" className="-ml-2 inline-flex w-fit items-center gap-1 rounded-full p-2 text-[13px] text-zen-soft">
              <IconArrowLeft size={18} aria-hidden /> Volver
            </Link>
            <div className="fade-in flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-[12px] font-medium tracking-[0.02em] text-zen-soft">Modo foco · {CATEGORY_VERB[category]}</p>
              <h1 className="mt-2 font-serif text-[30px] leading-9">{title}</h1>
              <div className="mt-8 flex items-center gap-5">
                <button
                  onClick={() => setPlanned((p) => Math.max(5, p - 5))}
                  className="grid size-11 place-items-center rounded-full bg-zen-raised"
                  aria-label="Menos tiempo"
                >
                  <IconMinus size={18} />
                </button>
                <p className="min-w-28 font-serif text-[48px] font-light leading-none">
                  {planned}
                  <span className="ml-1 text-[18px] text-zen-soft">min</span>
                </p>
                <button
                  onClick={() => setPlanned((p) => Math.min(240, p + 5))}
                  className="grid size-11 place-items-center rounded-full bg-zen-raised"
                  aria-label="Más tiempo"
                >
                  <IconPlus size={18} />
                </button>
              </div>
              <p className="mt-8 max-w-xs text-[14px] leading-6 text-zen-soft">{ACTIVITIES[category].tip}</p>
              {tip && <p className="mt-3 max-w-xs text-[14px] leading-6 text-zen-ink">{tip}</p>}
            </div>
            <button
              onClick={start}
              className="h-[52px] w-full rounded-full bg-zen-ink text-[15px] font-semibold text-zen"
            >
              Estoy listo
            </button>
          </>
        )}

        {phase === "corriendo" && (
          <div className="fade-in flex flex-1 flex-col items-center justify-center text-center">
            <p className="mb-8 text-[12px] font-medium tracking-[0.02em] text-zen-soft">
              Modo foco · {CATEGORY_VERB[category]}
            </p>
            <div className="relative size-[220px]">
              <svg viewBox="0 0 220 220" className="size-full -rotate-90" aria-hidden>
                <circle cx="110" cy="110" r={R} fill="none" stroke="var(--zen-ring)" strokeWidth="8" />
                <circle
                  cx="110"
                  cy="110"
                  r={R}
                  fill="none"
                  stroke="var(--zen-accent)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - progress)}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <p
                className="absolute inset-0 grid place-items-center font-serif text-[52px] font-light"
                aria-live="off"
              >
                {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
              </p>
            </div>
            <p className="mt-8 font-serif text-[18px]">{paused ? "En pausa" : "Deja el celular boca abajo"}</p>
            <p className="mt-1 text-[13px] text-zen-soft">{paused ? "Respira. Sigue cuando quieras." : "Te avisamos al terminar"}</p>
            <button
              onClick={togglePause}
              className="mt-6 grid size-12 place-items-center rounded-full bg-zen-raised"
              aria-label={paused ? "Seguir" : "Pausar"}
            >
              {paused ? <IconPlayerPlay size={20} /> : <IconPlayerPause size={20} />}
            </button>
            <div className="mt-auto flex w-full gap-3 pt-10">
              <button
                onClick={() => finish(false)}
                className="h-[52px] flex-1 rounded-full bg-zen-raised text-[14px] font-medium text-zen-ink"
              >
                Me distraje
              </button>
              <button
                onClick={() => finish(true)}
                className="h-[52px] flex-1 rounded-full bg-zen-ink text-[14px] font-semibold text-zen"
              >
                Terminé
              </button>
            </div>
          </div>
        )}

        {phase === "terminado" && (
          <div className="fade-in flex flex-1 flex-col items-center justify-center pt-6 text-center">
            <div
              className={`grid size-28 place-items-center rounded-full ${completed ? "glow bg-achievement" : "bg-zen-raised"}`}
            >
              <span className={`font-serif text-[36px] font-light ${completed ? "text-[#3a2a12]" : "text-zen-ink"}`}>
                {Math.max(1, Math.round(elapsed / 60_000))}
                <span className="text-[14px]"> min</span>
              </span>
            </div>
            <h1 className="mt-6 font-serif text-[28px] leading-9">
              {completed ? "Lo lograste" : "Bien por intentarlo"}
            </h1>
            <p className="mt-2 max-w-xs text-[14px] leading-6 text-zen-soft">
              {completed
                ? "Eso fue atención de verdad. Tu cerebro lo nota, aunque no lo sientas todavía."
                : "Darte cuenta de que te distrajiste también es entrenar. Mañana un poquito más."}
            </p>

            {leveledUp && (
              <div className="glow mt-6 rounded-[20px] bg-achievement-tint px-5 py-3 text-on-achievement-tint">
                <p className="text-[12px] font-medium">Subiste de nivel</p>
                <p className="font-serif text-[20px]">
                  Nivel {leveledUp} · {levelInfo(leveledUp).name}
                </p>
              </div>
            )}

            <div className="mt-8 w-full text-left">
              <Ask
                q="¿Te ayudó a sentirte mejor?"
                options={[...HELPED]}
                value={helped}
                onPick={(v) => {
                  setHelped(v);
                  updateSession({ helped: v === "si" });
                }}
              />
              <Ask
                q="¿Agarraste el celular?"
                options={PHONE_OPTIONS}
                value={phone}
                onPick={(v) => {
                  setPhone(v);
                  updateSession({ phone: v });
                  if (status && status !== "sigo" && work && isWork(category))
                    saveFinished({ category, title: work, by: workBy, status, rating, phone: v });
                }}
              />
              {work && (
                <Ask q={`¿Terminaste ${work}?`} options={[...STATUS]} value={status} onPick={pickStatus} />
              )}
              {work && status && status !== "sigo" && (
                <Ask q="¿Qué te pareció?" options={RATING_OPTIONS} value={rating} onPick={pickRating} />
              )}
              {(helped || phone) && <p className="fade-in mb-1 text-center text-[13px] text-zen-soft">Anotado. Así aprendo qué te funciona.</p>}
              <button
                onClick={() => router.push("/")}
                className="mt-3 h-[52px] w-full rounded-full bg-zen-ink text-[15px] font-semibold text-zen"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function FocusPage() {
  return (
    <Suspense>
      <Focus />
    </Suspense>
  );
}
