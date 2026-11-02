import { setState, uid } from "./store";
import type { Category } from "./types";

export interface PlanInput {
  category: Category;
  title: string;
  by?: string;
  meta?: string;
  minutes: number;
}

export function addToPlan(item: PlanInput) {
  setState((s) => {
    if (s.plan.some((p) => p.title.toLowerCase() === item.title.toLowerCase() && !p.done)) return s;
    return {
      ...s,
      plan: [
        ...s.plan,
        {
          id: uid(),
          category: item.category,
          title: item.title,
          by: item.by,
          meta: item.meta,
          // Un libro no se lee de una sentada: la sesión se limita a una hora.
          minutes: item.category === "leer" ? Math.min(item.minutes, 60) : item.minutes,
          addedAt: new Date().toISOString(),
        },
      ],
    };
  });
}
