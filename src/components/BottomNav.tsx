"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBooks, IconChartLine, IconHome, IconMessageCircle, IconMicrophone } from "@tabler/icons-react";

const TABS = [
  { href: "/", label: "Inicio", Icon: IconHome },
  { href: "/biblioteca", label: "Biblioteca", Icon: IconBooks },
  { href: "/chat", label: "Chat", Icon: IconMessageCircle },
  { href: "/voz", label: "Voz", Icon: IconMicrophone },
  { href: "/progreso", label: "Progreso", Icon: IconChartLine },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-canvas/90 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md justify-around px-2 pt-2 pb-2">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex min-w-14 flex-col items-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-medium transition-colors duration-300 ${
                  active ? "text-primary" : "text-ink-faint"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={22} stroke={active ? 2 : 1.6} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
