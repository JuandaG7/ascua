"use client";

import { useSyncExternalStore } from "react";
import type { AppState } from "./types";

const KEY = "ascua:v1";
const OLD_KEY = "brasa:v1"; // nombre anterior de la app

const initialState: AppState = {
  version: 1,
  checkIns: [],
  sessions: [],
  plan: [],
  chat: [],
  level: 1,
};

let state: AppState = initialState;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY) ?? window.localStorage.getItem(OLD_KEY);
    if (raw) state = { ...initialState, ...JSON.parse(raw) };
  } catch {
    // Sin almacenamiento disponible: la app funciona en memoria.
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Ignorado a propósito: modo privado o almacenamiento lleno.
  }
}

export function getState(): AppState {
  load();
  return state;
}

export function setState(update: (s: AppState) => AppState) {
  load();
  state = update(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, () => initialState);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
