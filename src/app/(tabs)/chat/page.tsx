"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconArrowUp, IconCheck, IconKey, IconPlus, IconTrash } from "@tabler/icons-react";
import { getState, setState, useAppState } from "@/lib/store";
import { addToPlan, type PlanInput } from "@/lib/plan";
import { MissingKeyError, streamReply } from "@/lib/chat";
import type { Category, ChatMessage } from "@/lib/types";
import { CAT_STYLE, CategoryIcon, PageTitle } from "@/components/ui";

const TAG = /\[\[plan\|(leer|ver|escuchar|escribir|dibujar|cocinar|caminar)\|([^|\]]+)\|([^|\]]*)\|([^|\]]*)\|(\d+)\]\]/g;

function parse(content: string): { text: string; recs: PlanInput[] } {
  const recs: PlanInput[] = [];
  for (const m of content.matchAll(TAG)) {
    recs.push({
      category: m[1] as Category,
      title: m[2].trim(),
      by: m[3].trim() || undefined,
      meta: m[4].trim() || undefined,
      minutes: Number(m[5]),
    });
  }
  // Oculta las etiquetas completas y también una a medio escribir durante el streaming.
  const text = content.replace(TAG, "").replace(/\[\[[^\]]*$/, "").trim();
  return { text, recs };
}

const SUGGESTIONS = [
  "Me quiero leer Dune, ¿qué te parece?",
  "Recomiéndame una peli para hoy",
  "Un álbum para escuchar sin hacer nada más",
];

function RecCard({ rec }: { rec: PlanInput }) {
  const state = useAppState();
  const added = state.plan.some((p) => p.title.toLowerCase() === rec.title.toLowerCase() && !p.done);
  return (
    <div className={`mt-2 rounded-[18px] p-3 ${CAT_STYLE[rec.category]}`}>
      <p className="flex items-center gap-1.5 text-[11px] font-medium">
        <CategoryIcon category={rec.category} size={14} />
        {[rec.by, rec.meta].filter(Boolean).join(" · ")}
      </p>
      <p className="mt-0.5 font-serif text-[16px] font-medium">{rec.title}</p>
      <button
        onClick={() => addToPlan(rec)}
        disabled={added}
        className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-full bg-surface-raised/60 px-3 text-[12px] font-medium"
      >
        {added ? <IconCheck size={14} /> : <IconPlus size={14} />}
        {added ? "En tu plan" : "Agregar a mi plan"}
      </button>
    </div>
  );
}

export default function Chat() {
  const { chat } = useAppState();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [missingKey, setMissingKey] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.length, streaming]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || streaming !== null) return;
    setError("");
    setMissingKey(false);
    setInput("");
    const history: ChatMessage[] = [...getState().chat, { role: "user", content }];
    setState((s) => ({ ...s, chat: history }));
    setStreaming("");

    let reply = "";
    try {
      reply = await streamReply(history, (full) => {
        reply = full;
        setStreaming(full);
      });
    } catch (e) {
      if (e instanceof MissingKeyError) setMissingKey(true);
      else setError(e instanceof Error && e.message ? e.message : "No se pudo conectar. Intenta de nuevo.");
    }
    if (reply) setState((s) => ({ ...s, chat: [...s.chat, { role: "assistant", content: reply }] }));
    else setState((s) => ({ ...s, chat: s.chat.slice(0, -1) }));
    if (!reply) setInput(content);
    setStreaming(null);
  };

  const clear = () => {
    if (window.confirm("¿Borrar toda la conversación?")) setState((s) => ({ ...s, chat: [] }));
  };

  const messages = streaming !== null ? [...chat, { role: "assistant" as const, content: streaming }] : chat;

  return (
    <div className="fade-in flex min-h-[calc(100dvh-9rem)] flex-col">
      <div className="flex items-start justify-between">
        <PageTitle sub="Pregunta por libros, pelis o música. Te respondo según tu nivel.">Pregúntame</PageTitle>
        {chat.length > 0 && (
          <button onClick={clear} className="mt-1 rounded-full p-2 text-ink-faint" aria-label="Borrar conversación">
            <IconTrash size={20} stroke={1.6} />
          </button>
        )}
      </div>

      {messages.length === 0 && (
        <div className="space-y-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="block w-full rounded-[20px] bg-surface px-4 py-3 text-left text-[14px]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-3 pb-4" aria-live="polite">
        {messages.map((m, i) => {
          if (m.role === "user")
            return (
              <div key={i} className="ml-auto w-fit max-w-[85%] rounded-[20px] rounded-br-md bg-primary px-4 py-2.5 text-[15px] leading-6 text-on-primary">
                {m.content}
              </div>
            );
          const { text, recs } = parse(m.content);
          return (
            <div key={i} className="max-w-[92%]">
              <div className="w-fit rounded-[20px] rounded-bl-md bg-surface px-4 py-2.5 text-[15px] leading-6 whitespace-pre-wrap">
                {text || <span className="breathe inline-block text-ink-faint">Pensando…</span>}
              </div>
              {(streaming === null || i < messages.length - 1) && recs.map((r) => <RecCard key={r.title} rec={r} />)}
            </div>
          );
        })}
        {missingKey && (
          <Link href="/ajustes" className="flex items-center gap-3 rounded-[20px] bg-surface-warm px-4 py-3 text-on-energy-tint">
            <IconKey size={20} stroke={1.6} aria-hidden />
            <span className="text-[13px]">
              Para usar el chat, agrega tu API key de Anthropic en <span className="font-semibold underline">Ajustes</span>.
            </span>
          </Link>
        )}
        {error && <p className="rounded-[16px] bg-surface-warm px-4 py-3 text-[13px] text-on-energy-tint">{error}</p>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-24 flex items-center gap-2 rounded-full border border-line bg-surface-raised p-1.5 pl-5"
      >
        <label htmlFor="chat-input" className="sr-only">Tu mensaje</label>
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="¿Qué te parece este libro…?"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-faint"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming !== null}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary transition-opacity disabled:opacity-40"
          aria-label="Enviar"
        >
          <IconArrowUp size={20} stroke={2} />
        </button>
      </form>
    </div>
  );
}
