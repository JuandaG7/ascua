import type { Category, WorkCategory } from "./types";

export type Group = "disfrutar" | "crear" | "moverte";

interface Activity {
  label: string;
  verb: string; // "Modo foco · leyendo"
  group: Group;
  sub: string; // texto en las preguntas iniciales
  tip: string; // consejo base del modo foco
  color: string; // clases de fondo + texto (tint de la misma familia)
}

export const ACTIVITIES: Record<Category, Activity> = {
  leer: {
    label: "Leer", verb: "leyendo", group: "disfrutar", sub: "Volver a terminar libros",
    tip: "Deja el celular boca abajo, lejos de ti. Si te distraes, vuelve a la última línea.",
    color: "bg-achievement-tint text-on-achievement-tint",
  },
  ver: {
    label: "Ver", verb: "viendo", group: "disfrutar", sub: "Películas completas, sin el celular",
    tip: "Celular en otra habitación o boca abajo. Nada de segunda pantalla.",
    color: "bg-energy-tint text-on-energy-tint",
  },
  escuchar: {
    label: "Escuchar", verb: "escuchando", group: "disfrutar", sub: "Álbumes de principio a fin",
    tip: "Ponte cómodo y no hagas nada más. Solo escucha. Sin saltar canciones.",
    color: "bg-focus-tint text-on-focus-tint",
  },
  escribir: {
    label: "Escribir", verb: "escribiendo", group: "crear", sub: "Diario, escritura libre o una carta",
    tip: "Mejor en papel. No borres ni corrijas: solo sigue escribiendo.",
    color: "bg-create-tint text-on-create-tint",
  },
  dibujar: {
    label: "Dibujar o pintar", verb: "dibujando", group: "crear", sub: "Sin que tenga que quedar bonito",
    tip: "No importa cómo quede. Mira más lo que dibujas que el papel.",
    color: "bg-create-tint text-on-create-tint",
  },
  cocinar: {
    label: "Cocinar", verb: "cocinando", group: "crear", sub: "Una receta nueva, sin prisa",
    tip: "Lee la receta antes de empezar y deja el celular fuera de la cocina.",
    color: "bg-create-tint text-on-create-tint",
  },
  caminar: {
    label: "Caminar", verb: "caminando", group: "moverte", sub: "Sin celular ni audífonos, mejor si hay verde",
    tip: "Celular en el bolsillo y sin audífonos. Fíjate en 5 cosas que nunca habías notado.",
    color: "bg-move-tint text-on-move-tint",
  },
};

export const GROUPS: { id: Group; label: string }[] = [
  { id: "disfrutar", label: "Disfrutar" },
  { id: "crear", label: "Crear" },
  { id: "moverte", label: "Moverte" },
];

export const ALL_CATEGORIES = Object.keys(ACTIVITIES) as Category[];
export const DEFAULT_CATEGORIES: Category[] = ["leer", "ver", "escuchar"];
export const WORK_CATEGORIES: WorkCategory[] = ["leer", "ver", "escuchar"];

export const isWork = (c: Category): c is WorkCategory => (WORK_CATEGORIES as Category[]).includes(c);
