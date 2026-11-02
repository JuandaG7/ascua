"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconArrowLeft, IconDownload, IconTrash, IconUpload } from "@tabler/icons-react";
import { setState, useAppState } from "@/lib/store";
import { getApiKey, setApiKey } from "@/lib/chat";
import { exportBackup, importBackup } from "@/lib/backup";
import { CATEGORY_LABEL } from "@/lib/levels";
import { CategoryIcon, PageTitle } from "@/components/ui";

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mb-3 rounded-[28px] bg-surface p-5">
      <h2 className="font-serif text-[19px]">{title}</h2>
      {sub && <p className="mt-1 mb-3 text-[13px] leading-5 text-ink-soft">{sub}</p>}
      {children}
    </section>
  );
}

const input =
  "h-11 w-full rounded-full bg-surface-raised px-4 text-[15px] outline-none ring-1 ring-line focus:ring-2 focus:ring-focus";
const secondary = "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-surface-nested px-4 text-[14px] font-medium";

export default function Ajustes() {
  const state = useAppState();
  const [key, setKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [keyMsg, setKeyMsg] = useState("");
  const [withVoice, setWithVoice] = useState(true);
  const [backupMsg, setBackupMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setHasKey(Boolean(getApiKey())), []);

  const saveKey = () => {
    const k = key.trim();
    if (!k.startsWith("sk-ant-")) {
      setKeyMsg("Eso no parece una API key de Anthropic. Empieza por sk-ant-.");
      return;
    }
    setApiKey(k);
    setKey("");
    setHasKey(true);
    setKeyMsg("Guardada en este teléfono.");
  };

  const removeKey = () => {
    setApiKey("");
    setHasKey(false);
    setKeyMsg("Key borrada de este teléfono.");
  };

  const onImport = async (file?: File) => {
    if (!file) return;
    if (!window.confirm("Esto reemplaza tu progreso actual por el de la copia. ¿Seguir?")) return;
    try {
      const n = await importBackup(file);
      setBackupMsg(`Copia restaurada: ${n} sesiones.`);
    } catch (e) {
      setBackupMsg(e instanceof Error ? e.message : "No se pudo leer la copia.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const deleteSession = (id: string) => {
    if (!window.confirm("¿Borrar esta sesión?")) return;
    setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
  };

  const resetAll = () => {
    if (!window.confirm("¿Reiniciar todo? Se borran sesiones, plan, chat y nivel. Las grabaciones de voz no se tocan.")) return;
    setState((s) => ({ version: 1, checkIns: [], sessions: [], plan: [], chat: [], level: 1, name: s.name }));
  };

  const sessions = [...state.sessions].reverse();

  return (
    <div className="fade-in">
      <Link href="/" className="-ml-2 mb-2 inline-flex items-center gap-1 rounded-full p-2 text-[13px] text-ink-soft">
        <IconArrowLeft size={18} aria-hidden /> Inicio
      </Link>
      <PageTitle>Ajustes</PageTitle>

      <Section title="Tu nombre" sub="Para saludarte en el inicio.">
        <label htmlFor="name" className="sr-only">Tu nombre</label>
        <input
          id="name"
          className={input}
          value={state.name ?? ""}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          placeholder="¿Cómo te llamas?"
          autoComplete="given-name"
        />
      </Section>

      <Section
        title="Chat con Claude"
        sub="El chat usa tu propia API key de Anthropic. Se guarda solo en este teléfono y va directo a Anthropic: no pasa por ningún servidor ni se sube a GitHub."
      >
        {hasKey ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] text-on-focus-tint">Key guardada</p>
            <button onClick={removeKey} className={secondary}>
              Borrar key
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveKey();
            }}
            className="flex gap-2"
          >
            <label htmlFor="key" className="sr-only">API key de Anthropic</label>
            <input
              id="key"
              type="password"
              className={input}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setKeyMsg("");
              }}
              placeholder="sk-ant-…"
              autoComplete="off"
            />
            <button type="submit" className="h-11 shrink-0 rounded-full bg-primary px-5 text-[14px] font-semibold text-on-primary">
              Guardar
            </button>
          </form>
        )}
        {keyMsg && <p className="mt-2 text-[13px] text-ink-soft">{keyMsg}</p>}
        <p className="mt-3 text-[12px] leading-5 text-ink-faint">
          Consíguela en console.anthropic.com → API keys. Te recomiendo ponerle un límite de gasto mensual.
        </p>
      </Section>

      <Section
        title="Copia de seguridad"
        sub="Todo vive en este teléfono. Si borras los datos del navegador o cambias de celular, sin copia lo pierdes. Haz una cada cierto tiempo y guárdala en Archivos o iCloud."
      >
        <label className="mb-3 flex items-center gap-2 text-[14px]">
          <input type="checkbox" checked={withVoice} onChange={(e) => setWithVoice(e.target.checked)} className="size-4 accent-[var(--focus)]" />
          Incluir grabaciones de voz
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              exportBackup(withVoice).then(
                () => setBackupMsg("Copia creada."),
                () => setBackupMsg("No se pudo crear la copia."),
              )
            }
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-semibold text-on-primary"
          >
            <IconDownload size={18} aria-hidden /> Crear copia
          </button>
          <button onClick={() => fileRef.current?.click()} className={secondary}>
            <IconUpload size={18} aria-hidden /> Restaurar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => onImport(e.target.files?.[0])}
          />
        </div>
        {backupMsg && <p className="mt-3 text-[13px] text-ink-soft">{backupMsg}</p>}
      </Section>

      <Section title="Tus sesiones" sub={sessions.length ? "Si registraste una por error, bórrala aquí." : "Aún no tienes sesiones."}>
        <ul className="space-y-1">
          {sessions.slice(0, 30).map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-[16px] py-1.5">
              <span className="text-ink-soft">
                <CategoryIcon category={s.category} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px]">{s.title}</p>
                <p className="text-[12px] text-ink-faint">
                  {new Date(s.startedAt).toLocaleDateString("es", { day: "numeric", month: "short" })} · {CATEGORY_LABEL[s.category]} ·{" "}
                  {s.actualMin} min{s.completed ? "" : " · se distrajo"}
                </p>
              </div>
              <button
                onClick={() => deleteSession(s.id)}
                className="grid size-10 place-items-center rounded-full text-ink-faint"
                aria-label={`Borrar sesión ${s.title}`}
              >
                <IconTrash size={18} stroke={1.6} />
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <button onClick={resetAll} className="mt-3 h-11 w-full rounded-full text-[14px] font-medium text-on-energy-tint">
        Reiniciar todo el progreso
      </button>
    </div>
  );
}
