/** Obras: leer, ver, escuchar. Crear: escribir, dibujar, cocinar. Moverte: caminar. */
export type Category = "leer" | "ver" | "escuchar" | "escribir" | "dibujar" | "cocinar" | "caminar";
export type WorkCategory = "leer" | "ver" | "escuchar";
export type Energy = "bajo" | "medio" | "alto";
export type PhoneUse = "nada" | "una" | "varias";
export type Rating = "encanto" | "bien" | "nogusto";

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
  phone?: PhoneUse; // respuesta a "¿agarraste el celular?"
  work?: string; // título del libro, película o álbum de la sesión
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

/** Un libro, película o álbum que ya terminaste (o dejaste), con tu opinión. */
export interface FinishedWork {
  key: string; // título normalizado
  category: WorkCategory;
  title: string;
  by?: string;
  status: "terminado" | "dejado";
  rating?: Rating;
  phone?: PhoneUse;
  note?: string;
  at: string;
}

/** Recomendación generada por Claude para la biblioteca. */
export interface AiRec {
  category: WorkCategory;
  title: string;
  by: string;
  meta: string;
  minutes: number;
  why: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Profile {
  attention: "menos5" | "5a15" | "15a30" | "mas30";
  wants: Category[];
  likes: string[]; // géneros de historias y de música
  favorites?: Partial<Record<WorkCategory, string[]>>;
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
  finished?: FinishedWork[];
  aiRecs?: { items: AiRec[]; at: string };
}
