"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconMinus,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconThumbDown,
  IconThumbUp,
} from "@tabler/icons-react";
import { getState, setState, uid } from "@/lib/store";
import { CATEGORY_VERB, evaluateLevel, levelInfo } from "@/lib/levels";
import { focusTip } from "@/lib/profile";
import type { Category } from "@/lib/types";

type Phase = "listo" | "corriendo" | "terminado";

const TIPS: Record<Category, string> = {
  leer: "Deja el celular boca abajo, lejos de ti. Si te distraes, vuelve a la última línea.",
  ver: "Celular en otra habitación o boca abajo. Nada de segunda pantalla.",
  escuchar: "Ponte cómodo y no hagas nada más. Solo escucha. Sin saltar canciones.",
};

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
  const [planned, setPlanned] = useState(() => Math.max(5, Number(params.get("min")) || 20));

  const [phase, setPhase] = useState<Phase>("listo");
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0); // ms
  const startRef = useRef(0);
  const accRef = useRef(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [leveledUp, setLeveledUp] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
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
    [category, planned, title, total],
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

  const answer = (helped: boolean) => {
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((x) => (x.id === sessionId ? { ...x, helped } : x)),
    }));
    setAnswered(true);
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
              <p className="mt-8 max-w-xs text-[14px] leading-6 text-zen-soft">{TIPS[category]}</p>
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
          <div className="fade-in flex flex-1 flex-col items-center justify-center text-center">
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

            <div className="mt-10 w-full">
              {!answered ? (
                <>
                  <p className="mb-3 text-[14px] text-zen-soft">¿Te ayudó a sentirte mejor?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => answer(false)}
                      className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-zen-raised text-[14px] font-medium"
                    >
                      <IconThumbDown size={18} stroke={1.6} /> No mucho
                    </button>
                    <button
                      onClick={() => answer(true)}
                      className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-zen-raised text-[14px] font-medium"
                    >
                      <IconThumbUp size={18} stroke={1.6} /> Sí
                    </button>
                  </div>
                </>
              ) : (
                <p className="fade-in mb-3 text-[14px] text-zen-soft">Anotado. Así aprendo qué te funciona.</p>
              )}
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
