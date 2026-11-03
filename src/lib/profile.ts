import type { Category, Profile } from "./types";

export const ATTENTION_OPTIONS = [
  { value: "menos5", label: "Menos de 5 minutos", level: 1 },
  { value: "5a15", label: "Entre 5 y 15 minutos", level: 1 },
  { value: "15a30", label: "Entre 15 y 30 minutos", level: 2 },
  { value: "mas30", label: "Más de 30 minutos", level: 3 },
] as const;

export const WANT_OPTIONS: { value: Category; label: string; sub: string }[] = [
  { value: "leer", label: "Leer", sub: "Volver a terminar libros" },
  { value: "ver", label: "Ver", sub: "Películas completas, sin el celular" },
  { value: "escuchar", label: "Escuchar", sub: "Álbumes de principio a fin" },
];

export const STORY_LIKES = [
  { value: "misterio", label: "Misterio y suspenso" },
  { value: "fantasia", label: "Fantasía y ciencia ficción" },
  { value: "drama", label: "Drama y emociones" },
  { value: "real", label: "Historias reales" },
  { value: "romance", label: "Romance" },
  { value: "humor", label: "Humor" },
  { value: "terror", label: "Terror" },
  { value: "reflexion", label: "Para pensar" },
  { value: "animacion", label: "Animación" },
];

export const MUSIC_LIKES = [
  { value: "pop", label: "Pop" },
  { value: "latina", label: "Latina" },
  { value: "rock", label: "Rock e indie" },
  { value: "hiphop", label: "Hip hop y R&B" },
  { value: "electronica", label: "Electrónica" },
  { value: "jazz", label: "Jazz y clásica" },
];

export const TIME_OPTIONS = [
  { value: "manana", label: "En la mañana" },
  { value: "tarde", label: "En la tarde" },
  { value: "noche", label: "En la noche" },
  { value: "variable", label: "Depende del día" },
] as const;

export const DISTRACTOR_OPTIONS = [
  { value: "redes", label: "Redes sociales y scroll" },
  { value: "videos", label: "Videos cortos" },
  { value: "notificaciones", label: "Notificaciones" },
  { value: "cansancio", label: "Cansancio" },
  { value: "estres", label: "Estrés o pensamientos que no paran" },
  { value: "pendientes", label: "Pendientes del trabajo o estudio" },
];

export const GOAL_OPTIONS = [
  { value: "concentrarme", label: "Concentrarme mejor" },
  { value: "energia", label: "Sentirme con más energía" },
  { value: "disfrutar", label: "Volver a disfrutar cosas largas" },
  { value: "pantalla", label: "Pasar menos tiempo en pantallas" },
] as const;

const label = <T extends { value: string; label: string }>(opts: readonly T[], v?: string) =>
  opts.find((o) => o.value === v)?.label;

export const goalLabel = (p?: Profile) => label(GOAL_OPTIONS, p?.goal);

export function startingLevel(attention: Profile["attention"]) {
  return ATTENTION_OPTIONS.find((o) => o.value === attention)?.level ?? 1;
}

/** Un consejo extra para el modo foco según lo que más te distrae. */
export function focusTip(p?: Profile): string | undefined {
  const d = p?.distractors ?? [];
  if (d.includes("notificaciones")) return "Activa No molestar antes de empezar. Lo que llegue puede esperar.";
  if (d.includes("redes") || d.includes("videos"))
    return "Si te dan ganas de abrir redes, respira y sigue. Esas ganas se pasan en un minuto.";
  if (d.includes("estres")) return "Si un pensamiento no te suelta, anótalo en un papel y vuelve. Ya no se te va a olvidar.";
  if (d.includes("pendientes")) return "Los pendientes siguen ahí en 20 minutos. Ahora este rato es tuyo.";
  if (d.includes("cansancio")) return "Si hay mucho cansancio, baja el tiempo. Un rato corto también cuenta.";
  return undefined;
}

/** Descripción del perfil para el chat. */
export function profileForChat(p?: Profile) {
  if (!p) return "Aún no respondió las preguntas iniciales.";
  const likes = [...STORY_LIKES, ...MUSIC_LIKES].filter((o) => p.likes.includes(o.value)).map((o) => o.label);
  return [
    `Quiere recuperar: ${p.wants.join(", ")}.`,
    `Le gusta: ${likes.length ? likes.join(", ") : "no lo dijo"}.`,
    `Lo que más le distrae: ${DISTRACTOR_OPTIONS.filter((o) => p.distractors.includes(o.value)).map((o) => o.label).join(", ") || "no lo dijo"}.`,
    `Tiene más tiempo: ${label(TIME_OPTIONS, p.time) ?? "no lo dijo"}.`,
    `Su meta: ${goalLabel(p) ?? "no la dijo"}.`,
  ].join("\n");
}
