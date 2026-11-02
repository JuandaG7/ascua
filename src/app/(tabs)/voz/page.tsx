"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { del, get, set } from "idb-keyval";
import {
  IconLock,
  IconMicrophone,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconTrash,
} from "@tabler/icons-react";
import { uid } from "@/lib/store";
import { LIST_KEY, audioKey, type Recording } from "@/lib/voice";
import { PageTitle } from "@/components/ui";

const PROMPTS = ["¿Qué te está dando vueltas?", "¿Qué te pesa hoy?", "¿Qué necesitas soltar antes de empezar?"];

function fmt(sec: number) {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}

function pickMime() {
  if (typeof MediaRecorder === "undefined") return "";
  return ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

function Voice() {
  const before = useSearchParams().get("antes") === "1";
  const [list, setList] = useState<Recording[]>([]);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  useEffect(() => {
    get<Recording[]>(LIST_KEY).then((l) => setList(l ?? [])).catch(() => {});
    return () => {
      audioRef.current?.pause();
      recRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((Date.now() - startRef.current) / 1000), 250);
    return () => clearInterval(t);
  }, [recording]);

  const start = async () => {
    setError("");
    setJustSaved(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = rec.mimeType || mime || "audio/webm";
        const blob = new Blob(chunks.current, { type });
        const item: Recording = {
          id: uid(),
          createdAt: new Date().toISOString(),
          seconds: Math.round((Date.now() - startRef.current) / 1000),
          type,
        };
        await set(audioKey(item.id), blob);
        const next = [item, ...((await get<Recording[]>(LIST_KEY)) ?? [])];
        await set(LIST_KEY, next);
        setList(next);
        setJustSaved(true);
      };
      recRef.current = rec;
      startRef.current = Date.now();
      setSeconds(0);
      rec.start(1000);
      setRecording(true);
    } catch {
      setError("No pude usar el micrófono. Revisa que la app tenga permiso en los ajustes del navegador.");
    }
  };

  const stop = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  const play = async (r: Recording) => {
    if (playing === r.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    audioRef.current?.pause();
    const blob = await get<Blob>(audioKey(r.id));
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => {
      setPlaying(null);
      URL.revokeObjectURL(url);
    };
    audioRef.current = audio;
    setPlaying(r.id);
    audio.play().catch(() => setPlaying(null));
  };

  const remove = async (r: Recording) => {
    if (!window.confirm("¿Borrar esta grabación? No se puede recuperar.")) return;
    if (playing === r.id) audioRef.current?.pause();
    await del(audioKey(r.id));
    const next = list.filter((x) => x.id !== r.id);
    await set(LIST_KEY, next);
    setList(next);
  };

  return (
    <div className="fade-in">
      <PageTitle sub="Habla lo que te da vueltas. Nadie responde, nadie juzga.">Vaciar la cabeza</PageTitle>

      <section className="flex flex-col items-center rounded-[28px] bg-calm px-5 pt-8 pb-6 text-center text-on-calm">
        <p className="font-serif text-[20px]">{recording ? "Te escucho…" : prompt}</p>
        <button
          onClick={recording ? stop : start}
          className={`mt-6 grid size-32 place-items-center rounded-full bg-on-calm/15 ${recording ? "breathe" : ""}`}
          aria-label={recording ? "Detener grabación" : "Empezar a grabar"}
        >
          <span className="grid size-20 place-items-center rounded-full bg-on-calm text-calm">
            {recording ? <IconPlayerStop size={30} /> : <IconMicrophone size={30} stroke={1.8} />}
          </span>
        </button>
        <p className="mt-4 font-serif text-[26px] font-light">{fmt(seconds)}</p>
        <p className="mt-3 flex items-center gap-1.5 text-[12px] opacity-90">
          <IconLock size={14} aria-hidden /> Solo se guarda en este teléfono
        </p>
      </section>

      {error && <p className="mt-3 rounded-[16px] bg-surface-warm px-4 py-3 text-[13px] text-on-energy-tint">{error}</p>}

      {justSaved && (
        <div className="fade-in mt-3 rounded-[24px] bg-surface p-4 text-center">
          <p className="font-serif text-[18px]">Listo, ya lo soltaste.</p>
          {before ? (
            <Link
              href="/"
              className="mt-3 flex h-[52px] items-center justify-center rounded-full bg-energy text-[15px] font-semibold text-on-energy"
            >
              Ahora sí, a enfocarse
            </Link>
          ) : (
            <p className="mt-1 text-[13px] text-ink-soft">Respira hondo una vez antes de seguir.</p>
          )}
        </div>
      )}

      {list.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 font-serif text-[20px]">Tus grabaciones</h2>
          <ul className="space-y-2">
            {list.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-[20px] bg-surface py-2 pr-2 pl-2">
                <button
                  onClick={() => play(r)}
                  className="grid size-10 place-items-center rounded-full bg-calm text-on-calm"
                  aria-label={playing === r.id ? "Pausar" : "Reproducir"}
                >
                  {playing === r.id ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
                </button>
                <div className="flex-1">
                  <p className="text-[14px] font-medium first-letter:uppercase">
                    {new Date(r.createdAt).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short" })},{" "}
                    {new Date(r.createdAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-[12px] text-ink-soft">{fmt(r.seconds)}</p>
                </div>
                <button
                  onClick={() => remove(r)}
                  className="grid size-10 place-items-center rounded-full text-ink-faint"
                  aria-label="Borrar grabación"
                >
                  <IconTrash size={18} stroke={1.6} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function VoicePage() {
  return (
    <Suspense>
      <Voice />
    </Suspense>
  );
}
