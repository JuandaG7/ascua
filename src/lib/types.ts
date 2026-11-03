export type Category = "leer" | "ver" | "escuchar";
export type Energy = "bajo" | "medio" | "alto";

export interface CheckIn {
  date: string; // YYYY-MM-DD
  energy: Energy;
}

export interface Session {
  id: string;
  startedAt: string; // ISO
  category: Category;
  title: string;
  plannedMin: number;
  actualMin: number;
  completed: boolean;
  helped?: boolean; // respuesta a "¿te ayudó?"
}

export interface PlanItem {
  id: string;
  category: Category;
  title: string;
  by?: string;
  meta?: string; // "120 págs", "95 min"
  minutes: number; // duración estimada de una sesión
  addedAt: string;
  done?: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Profile {
  attention: "menos5" | "5a15" | "15a30" | "mas30";
  wants: Category[];
  likes: string[]; // géneros de historias y de música
  time?: "manana" | "tarde" | "noche" | "variable";
  distractors: string[];
  goal?: "concentrarme" | "energia" | "disfrutar" | "pantalla";
  completedAt: string;
}

export interface AppState {
  version: 1;
  checkIns: CheckIn[];
  sessions: Session[];
  plan: PlanItem[];
  chat: ChatMessage[];
  level: number;
  name?: string;
  lastBackupAt?: string;
  profile?: Profile;
}
