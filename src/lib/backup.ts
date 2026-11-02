import { get, set } from "idb-keyval";
import { getState, setState } from "./store";
import { LIST_KEY, audioKey, type Recording } from "./voice";
import type { AppState } from "./types";

interface Backup {
  app: "brasa";
  version: 1;
  createdAt: string;
  state: AppState;
  recordings?: (Recording & { data: string })[];
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

function base64ToBlob(data: string, type: string) {
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

/** Crea la copia y la entrega para guardar o compartir (en el iPhone abre "Compartir"). */
export async function exportBackup(includeVoice: boolean) {
  const backup: Backup = { app: "brasa", version: 1, createdAt: new Date().toISOString(), state: getState() };
  if (includeVoice) {
    const list = (await get<Recording[]>(LIST_KEY)) ?? [];
    backup.recordings = [];
    for (const r of list) {
      const blob = await get<Blob>(audioKey(r.id));
      if (blob) backup.recordings.push({ ...r, data: await blobToBase64(blob) });
    }
  }
  const name = `brasa-copia-${backup.createdAt.slice(0, 10)}.json`;
  const file = new File([JSON.stringify(backup)], name, { type: "application/json" });

  const markDone = () => setState((s) => ({ ...s, lastBackupAt: backup.createdAt }));

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Copia de Brasa" });
      markDone();
      return;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  markDone();
}

/** Reemplaza todo por lo que hay en la copia. Devuelve cuántas sesiones trae. */
export async function importBackup(file: File): Promise<number> {
  let data: Backup;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error("Ese archivo no es una copia de Brasa.");
  }
  if (data?.app !== "brasa" || !data.state || !Array.isArray(data.state.sessions)) {
    throw new Error("Ese archivo no es una copia de Brasa.");
  }
  if (data.recordings) {
    const metas: Recording[] = [];
    for (const { data: b64, ...meta } of data.recordings) {
      await set(audioKey(meta.id), base64ToBlob(b64, meta.type));
      metas.push(meta);
    }
    const current = (await get<Recording[]>(LIST_KEY)) ?? [];
    const merged = [...metas, ...current.filter((c) => !metas.some((m) => m.id === c.id))];
    merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    await set(LIST_KEY, merged);
  }
  setState(() => data.state);
  return data.state.sessions.length;
}
