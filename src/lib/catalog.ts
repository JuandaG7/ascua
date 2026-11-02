import type { Category } from "./types";

export interface CatalogItem {
  id: string;
  category: Category;
  title: string;
  by: string;
  meta: string;
  minutes: number; // una sesión típica con esto
  minLevel: number;
  why: string;
}

// Recomendaciones base, ordenadas de "engancha fácil" a "pide más atención".
// La IA del chat puede sugerir más; estas funcionan sin conexión.
export const CATALOG: CatalogItem[] = [
  // Leer
  { id: "l1", category: "leer", title: "El principito", by: "Antoine de Saint-Exupéry", meta: "96 págs", minutes: 15, minLevel: 1, why: "Capítulos cortísimos. Perfecto para volver a agarrar el hábito." },
  { id: "l2", category: "leer", title: "La metamorfosis", by: "Franz Kafka", meta: "80 págs", minutes: 20, minLevel: 1, why: "Corta, rara y engancha desde la primera línea." },
  { id: "l3", category: "leer", title: "Crónica de una muerte anunciada", by: "Gabriel García Márquez", meta: "120 págs", minutes: 20, minLevel: 2, why: "Sabes el final desde el inicio y aun así no la sueltas." },
  { id: "l4", category: "leer", title: "El viejo y el mar", by: "Ernest Hemingway", meta: "128 págs", minutes: 25, minLevel: 2, why: "Frases simples, ritmo lento: entrena la paciencia." },
  { id: "l5", category: "leer", title: "Pedro Páramo", by: "Juan Rulfo", meta: "130 págs", minutes: 30, minLevel: 3, why: "Fragmentada y misteriosa: te obliga a estar presente." },
  { id: "l6", category: "leer", title: "Siddhartha", by: "Hermann Hesse", meta: "160 págs", minutes: 30, minLevel: 3, why: "Tranquila y reflexiva. Buena para leer de noche." },
  { id: "l7", category: "leer", title: "Ficciones", by: "Jorge Luis Borges", meta: "200 págs", minutes: 45, minLevel: 4, why: "Cuentos densos: cada uno pide toda tu atención." },
  { id: "l8", category: "leer", title: "Cien años de soledad", by: "Gabriel García Márquez", meta: "470 págs", minutes: 60, minLevel: 5, why: "El gran reto: muchos personajes, sesiones largas." },
  // Ver
  { id: "v1", category: "ver", title: "Coco", by: "Pixar, 2017", meta: "105 min", minutes: 105, minLevel: 1, why: "Ritmo ágil y emocional: fácil de ver sin el celular." },
  { id: "v2", category: "ver", title: "Spider-Man: Into the Spider-Verse", by: "2018", meta: "117 min", minutes: 117, minLevel: 1, why: "Visualmente tan intensa que no vas a querer mirar otra cosa." },
  { id: "v3", category: "ver", title: "Whiplash", by: "Damien Chazelle, 2014", meta: "106 min", minutes: 106, minLevel: 2, why: "Tensión constante de principio a fin." },
  { id: "v4", category: "ver", title: "El laberinto del fauno", by: "Guillermo del Toro, 2006", meta: "118 min", minutes: 118, minLevel: 2, why: "Fantasía oscura que te atrapa de a poco." },
  { id: "v5", category: "ver", title: "Parásitos", by: "Bong Joon-ho, 2019", meta: "132 min", minutes: 132, minLevel: 3, why: "Cada detalle importa. Perderte algo cuesta." },
  { id: "v6", category: "ver", title: "Perfect Days", by: "Wim Wenders, 2023", meta: "124 min", minutes: 124, minLevel: 4, why: "Lenta a propósito. Ejercicio puro de estar presente." },
  { id: "v7", category: "ver", title: "Interstellar", by: "Christopher Nolan, 2014", meta: "169 min", minutes: 169, minLevel: 4, why: "Casi tres horas: tu primer maratón de atención." },
  { id: "v8", category: "ver", title: "2001: Odisea del espacio", by: "Stanley Kubrick, 1968", meta: "149 min", minutes: 149, minLevel: 5, why: "Silencios largos. Si aguantas esta, recuperaste el foco." },
  // Escuchar
  { id: "e1", category: "escuchar", title: "El mal querer", by: "Rosalía", meta: "30 min", minutes: 30, minLevel: 1, why: "Corto y contado como una historia, capítulo a capítulo." },
  { id: "e2", category: "escuchar", title: "In Rainbows", by: "Radiohead", meta: "42 min", minutes: 42, minLevel: 2, why: "Fluye solo, de principio a fin." },
  { id: "e3", category: "escuchar", title: "Kind of Blue", by: "Miles Davis", meta: "46 min", minutes: 46, minLevel: 2, why: "Jazz tranquilo: ideal para escuchar sin hacer nada más." },
  { id: "e4", category: "escuchar", title: "Abbey Road", by: "The Beatles", meta: "47 min", minutes: 47, minLevel: 2, why: "El cierre en medley premia escucharlo entero." },
  { id: "e5", category: "escuchar", title: "Blonde", by: "Frank Ocean", meta: "60 min", minutes: 60, minLevel: 3, why: "Íntimo y cambiante: pide atención real." },
  { id: "e6", category: "escuchar", title: "Random Access Memories", by: "Daft Punk", meta: "74 min", minutes: 74, minLevel: 4, why: "Largo, con mucho detalle en cada capa." },
  { id: "e7", category: "escuchar", title: "To Pimp a Butterfly", by: "Kendrick Lamar", meta: "79 min", minutes: 79, minLevel: 5, why: "Denso en letra y sonido. Un álbum para escuchar, no de fondo." },
];

export function recommendedFor(level: number) {
  return CATALOG.filter((c) => c.minLevel <= level + 1).sort(
    (a, b) => Math.abs(a.minLevel - level) - Math.abs(b.minLevel - level),
  );
}
