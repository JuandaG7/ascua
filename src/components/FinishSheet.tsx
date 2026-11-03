"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconX } from "@tabler/icons-react";
import { PHONE_OPTIONS, RATING_OPTIONS, saveFinished } from "@/lib/works";
import type { FinishedWork, PhoneUse, Rating, WorkCategory } from "@/lib/types";

export interface FinishTarget {
  category: WorkCategory;
  title: string;
  by?: string;
  initial?: FinishedWork;
}

const VERB: Record<WorkCategory, { done: string; phone: string }> = {
  leer: { done: "Lo leí", phone: "mientras lo leías" },
  ver: { done: "La vi", phone: "mientras la veías" },
  escuchar: { done: "Lo escuché", phone: "mientras lo escuchabas" },
};

function Pills<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: { value: T; label: string }[];
  value?: T;
  onPick: (v: T) => void;
}) {
  return (
    <fieldset className="mb-5">
      <legend className="mb-2 text-[14px] text-ink-soft">{label}</legend>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onPick(o.value)}
            className={`h-11 flex-1 rounded-full px-2 text-[13px] font-medium transition-colors duration-300 ${
              value === o.value ? "bg-primary text-on-primary" : "bg-surface text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Hoja inferior para contar qué te pareció una obra y si agarraste el celular. */
export default function FinishSheet({ target, onClose }: { target: FinishTarget | null; onClose: () => void }) {
  const [status, setStatus] = useState<FinishedWork["status"]>("terminado");
  const [rating, setRating] = useState<Rating>();
  const [phone, setPhone] = useState<PhoneUse>();
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!target) return;
    setStatus(target.initial?.status ?? "terminado");
    setRating(target.initial?.rating);
    setPhone(target.initial?.phone);
    setNote(target.initial?.note ?? "");
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, onClose]);

  if (!target) return null;
  const v = VERB[target.category];

  const save = () => {
    saveFinished({ category: target.category, title: target.title, by: target.by, status, rating, phone, note });
    onClose();
  };

  // En un portal: la animación de entrada de la página (transform) atraparía el `fixed`.
  return createPortal(
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Tu opinión sobre ${target.title}`}
        onClick={(e) => e.stopPropagation()}
        className="fade-in w-full max-w-md rounded-t-[32px] bg-canvas px-5 pt-5"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] text-ink-soft">Tu opinión</p>
            <h2 className="font-serif text-[22px] leading-7">{target.title}</h2>
          </div>
          <button onClick={onClose} className="-mr-2 rounded-full p-2 text-ink-faint" aria-label="Cerrar">
            <IconX size={20} />
          </button>
        </div>

        <Pills
          label="¿Cómo te fue?"
          options={[
            { value: "terminado", label: `${v.done} completo` },
            { value: "dejado", label: "Lo dejé" },
          ]}
          value={status}
          onPick={setStatus}
        />
        <Pills label="¿Qué te pareció?" options={RATING_OPTIONS} value={rating} onPick={setRating} />
        <Pills label={`¿Agarraste el celular ${v.phone}?`} options={PHONE_OPTIONS} value={phone} onPick={setPhone} />

        <label htmlFor="finish-note" className="mb-2 block text-[14px] text-ink-soft">
          Algo que quieras recordar (opcional)
        </label>
        <textarea
          id="finish-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="El final me voló la cabeza"
          className="w-full resize-none rounded-[20px] bg-surface-raised px-4 py-3 text-[15px] outline-none ring-1 ring-line placeholder:text-ink-faint focus:ring-2 focus:ring-focus"
        />
        <button onClick={save} className="mt-4 h-[52px] w-full rounded-full bg-primary text-[15px] font-semibold text-on-primary">
          Guardar
        </button>
      </div>
    </div>,
    document.body,
  );
}
