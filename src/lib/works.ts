import { setState } from "./store";
import { workKey } from "./catalog";
import type { FinishedWork, PhoneUse, Rating, WorkCategory } from "./types";

export const RATING_OPTIONS: { value: Rating; label: string }[] = [
  { value: "encanto", label: "Me encantó" },
  { value: "bien", label: "Estuvo bien" },
  { value: "nogusto", label: "No me gustó" },
];

export const PHONE_OPTIONS: { value: PhoneUse; label: string }[] = [
  { value: "nada", label: "Ni una vez" },
  { value: "una", label: "Una vez" },
  { value: "varias", label: "Varias veces" },
];

export const ratingLabel = (r?: Rating) => RATING_OPTIONS.find((o) => o.value === r)?.label;
export const phoneLabel = (p?: PhoneUse) => PHONE_OPTIONS.find((o) => o.value === p)?.label;

export interface FinishInput {
  category: WorkCategory;
  title: string;
  by?: string;
  status: FinishedWork["status"];
  rating?: Rating;
  phone?: PhoneUse;
  note?: string;
}

/** Guarda (o actualiza) tu opinión de una obra y la saca del plan. */
export function saveFinished(input: FinishInput) {
  const key = workKey(input.title);
  setState((s) => ({
    ...s,
    finished: [
      { ...input, key, note: input.note?.trim() || undefined, at: new Date().toISOString() },
      ...(s.finished ?? []).filter((f) => f.key !== key),
    ],
    plan: s.plan.map((p) => (workKey(p.title) === key ? { ...p, done: true } : p)),
  }));
}

export function removeFinished(key: string) {
  setState((s) => ({ ...s, finished: (s.finished ?? []).filter((f) => f.key !== key) }));
}
