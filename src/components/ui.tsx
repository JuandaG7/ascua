import type { Category } from "@/lib/types";
import { ACTIVITIES } from "@/lib/activities";
import {
  IconBook2,
  IconBrush,
  IconDeviceTv,
  IconHeadphones,
  IconPencil,
  IconToolsKitchen2,
  IconWalk,
} from "@tabler/icons-react";

export const CAT_STYLE = Object.fromEntries(
  Object.entries(ACTIVITIES).map(([k, a]) => [k, a.color]),
) as Record<Category, string>;

const ICONS = {
  leer: IconBook2,
  ver: IconDeviceTv,
  escuchar: IconHeadphones,
  escribir: IconPencil,
  dibujar: IconBrush,
  cocinar: IconToolsKitchen2,
  caminar: IconWalk,
} satisfies Record<Category, unknown>;

export function CategoryIcon({ category, size = 18 }: { category: Category; size?: number }) {
  const Icon = ICONS[category];
  return <Icon size={size} stroke={1.6} aria-hidden />;
}

export function PageTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <header className="mb-5">
      <h1 className="font-serif text-[28px] leading-9 tracking-[-0.01em]">{children}</h1>
      {sub && <p className="mt-1 text-[13px] text-ink-soft">{sub}</p>}
    </header>
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-[28px] p-4 ${className}`}>{children}</div>;
}
