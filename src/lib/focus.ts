import { isWork } from "./activities";
import type { Category } from "./types";

/** Enlace al modo foco. `work` es la obra (libro, película, álbum) para preguntar al final si la terminaste. */
export function focusHref(c: { category: Category; minutes: number; title: string; work?: string; by?: string }) {
  const q = new URLSearchParams({ cat: c.category, min: String(c.minutes), title: c.title });
  if (c.work && isWork(c.category)) q.set("work", c.work);
  if (c.by && c.work) q.set("by", c.by);
  return `/foco?${q}`;
}
