import type { Category } from "@/lib/types";
import { IconBook2, IconDeviceTv, IconHeadphones } from "@tabler/icons-react";

export const CAT_STYLE: Record<Category, string> = {
  leer: "bg-achievement-tint text-on-achievement-tint",
  ver: "bg-energy-tint text-on-energy-tint",
  escuchar: "bg-focus-tint text-on-focus-tint",
};

export function CategoryIcon({ category, size = 18 }: { category: Category; size?: number }) {
  const props = { size, stroke: 1.6, "aria-hidden": true };
  if (category === "leer") return <IconBook2 {...props} />;
  if (category === "ver") return <IconDeviceTv {...props} />;
  return <IconHeadphones {...props} />;
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
