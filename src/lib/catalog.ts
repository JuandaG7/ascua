import type { Category, Profile } from "./types";
import { MUSIC_LIKES, STORY_LIKES } from "./profile";

export interface CatalogItem {
  id: string;
  category: Category;
  title: string;
  by: string;
  meta: string;
  minutes: number; // una sesión típica con esto
  minLevel: number;
  why: string;
  tags: string[]; // mismos valores que los gustos del perfil
}

// Recomendaciones base, ordenadas de "engancha fácil" a "pide más atención".
// La IA del chat puede sugerir más; estas funcionan sin conexión.
export const CATALOG: CatalogItem[] = [
  // Leer
  { id: "l1", category: "leer", title: "El principito", by: "Antoine de Saint-Exupéry", meta: "96 págs", minutes: 15, minLevel: 1, why: "Capítulos cortísimos. Perfecto para volver a agarrar el hábito.", tags: ["reflexion", "fantasia"] },
  { id: "l2", category: "leer", title: "La metamorfosis", by: "Franz Kafka", meta: "80 págs", minutes: 20, minLevel: 1, why: "Corta, rara y engancha desde la primera línea.", tags: ["reflexion", "terror"] },
  { id: "l9", category: "leer", title: "Relato de un náufrago", by: "Gabriel García Márquez", meta: "128 págs", minutes: 20, minLevel: 1, why: "Una historia real contada como novela de aventuras.", tags: ["real", "drama"] },
  { id: "l10", category: "leer", title: "El corazón delator y otros cuentos", by: "Edgar Allan Poe", meta: "150 págs", minutes: 15, minLevel: 1, why: "Cuentos cortos de terror: cada uno cabe en una sesión.", tags: ["terror", "misterio"] },
  { id: "l3", category: "leer", title: "Crónica de una muerte anunciada", by: "Gabriel García Márquez", meta: "120 págs", minutes: 20, minLevel: 2, why: "Sabes el final desde el inicio y aun así no la sueltas.", tags: ["misterio", "drama"] },
  { id: "l4", category: "leer", title: "El viejo y el mar", by: "Ernest Hemingway", meta: "128 págs", minutes: 25, minLevel: 2, why: "Frases simples, ritmo lento: entrena la paciencia.", tags: ["drama", "reflexion"] },
  { id: "l11", category: "leer", title: "Como agua para chocolate", by: "Laura Esquivel", meta: "250 págs", minutes: 25, minLevel: 2, why: "Romance, cocina y magia. Un capítulo por mes del año.", tags: ["romance", "fantasia", "drama"] },
  { id: "l12", category: "leer", title: "El curioso incidente del perro a medianoche", by: "Mark Haddon", meta: "270 págs", minutes: 30, minLevel: 3, why: "Un misterio contado con mucho humor y capítulos cortos.", tags: ["misterio", "humor"] },
  { id: "l5", category: "leer", title: "Pedro Páramo", by: "Juan Rulfo", meta: "130 págs", minutes: 30, minLevel: 3, why: "Fragmentada y misteriosa: te obliga a estar presente.", tags: ["misterio", "fantasia", "terror"] },
  { id: "l6", category: "leer", title: "Siddhartha", by: "Hermann Hesse", meta: "160 págs", minutes: 30, minLevel: 3, why: "Tranquila y reflexiva. Buena para leer de noche.", tags: ["reflexion"] },
  { id: "l7", category: "leer", title: "Ficciones", by: "Jorge Luis Borges", meta: "200 págs", minutes: 45, minLevel: 4, why: "Cuentos densos: cada uno pide toda tu atención.", tags: ["fantasia", "reflexion", "misterio"] },
  { id: "l8", category: "leer", title: "Cien años de soledad", by: "Gabriel García Márquez", meta: "470 págs", minutes: 60, minLevel: 5, why: "El gran reto: muchos personajes, sesiones largas.", tags: ["fantasia", "drama"] },
  // Ver
  { id: "v9", category: "ver", title: "Un lugar en silencio", by: "John Krasinski, 2018", meta: "90 min", minutes: 90, minLevel: 1, why: "Casi sin diálogos: si miras el celular te pierdes todo.", tags: ["terror", "drama"] },
  { id: "v1", category: "ver", title: "Coco", by: "Pixar, 2017", meta: "105 min", minutes: 105, minLevel: 1, why: "Ritmo ágil y emocional: fácil de ver sin el celular.", tags: ["animacion", "drama", "humor"] },
  { id: "v2", category: "ver", title: "Spider-Man: Into the Spider-Verse", by: "2018", meta: "117 min", minutes: 117, minLevel: 1, why: "Visualmente tan intensa que no vas a querer mirar otra cosa.", tags: ["animacion", "fantasia", "humor"] },
  { id: "v10", category: "ver", title: "El Gran Hotel Budapest", by: "Wes Anderson, 2014", meta: "100 min", minutes: 100, minLevel: 2, why: "Comedia rápida y llena de detalles en cada plano.", tags: ["humor", "misterio"] },
  { id: "v11", category: "ver", title: "Antes del amanecer", by: "Richard Linklater, 1995", meta: "101 min", minutes: 101, minLevel: 2, why: "Dos personas conversando toda una noche. Romance sin prisa.", tags: ["romance", "reflexion"] },
  { id: "v3", category: "ver", title: "Whiplash", by: "Damien Chazelle, 2014", meta: "106 min", minutes: 106, minLevel: 2, why: "Tensión constante de principio a fin.", tags: ["drama"] },
  { id: "v4", category: "ver", title: "El laberinto del fauno", by: "Guillermo del Toro, 2006", meta: "118 min", minutes: 118, minLevel: 2, why: "Fantasía oscura que te atrapa de a poco.", tags: ["fantasia", "terror", "drama"] },
  { id: "v5", category: "ver", title: "Parásitos", by: "Bong Joon-ho, 2019", meta: "132 min", minutes: 132, minLevel: 3, why: "Cada detalle importa. Perderte algo cuesta.", tags: ["misterio", "humor", "drama"] },
  { id: "v12", category: "ver", title: "Hacia rutas salvajes", by: "Sean Penn, 2007", meta: "148 min", minutes: 148, minLevel: 3, why: "Historia real de alguien que dejó todo para irse a la naturaleza.", tags: ["real", "drama", "reflexion"] },
  { id: "v6", category: "ver", title: "Perfect Days", by: "Wim Wenders, 2023", meta: "124 min", minutes: 124, minLevel: 4, why: "Lenta a propósito. Ejercicio puro de estar presente.", tags: ["reflexion", "drama"] },
  { id: "v7", category: "ver", title: "Interstellar", by: "Christopher Nolan, 2014", meta: "169 min", minutes: 169, minLevel: 4, why: "Casi tres horas: tu primer maratón de atención.", tags: ["fantasia", "drama"] },
  { id: "v8", category: "ver", title: "2001: Odisea del espacio", by: "Stanley Kubrick, 1968", meta: "149 min", minutes: 149, minLevel: 5, why: "Silencios largos. Si aguantas esta, recuperaste el foco.", tags: ["fantasia", "reflexion"] },
  // Escuchar
  { id: "e1", category: "escuchar", title: "El mal querer", by: "Rosalía", meta: "30 min", minutes: 30, minLevel: 1, why: "Corto y contado como una historia, capítulo a capítulo.", tags: ["pop", "latina"] },
  { id: "e8", category: "escuchar", title: "Canción animal", by: "Soda Stereo", meta: "45 min", minutes: 45, minLevel: 2, why: "Un clásico del rock en español que se escucha de un tirón.", tags: ["rock", "latina"] },
  { id: "e2", category: "escuchar", title: "In Rainbows", by: "Radiohead", meta: "42 min", minutes: 42, minLevel: 2, why: "Fluye solo, de principio a fin.", tags: ["rock"] },
  { id: "e3", category: "escuchar", title: "Kind of Blue", by: "Miles Davis", meta: "46 min", minutes: 46, minLevel: 2, why: "Jazz tranquilo: ideal para escuchar sin hacer nada más.", tags: ["jazz"] },
  { id: "e4", category: "escuchar", title: "Abbey Road", by: "The Beatles", meta: "47 min", minutes: 47, minLevel: 2, why: "El cierre en medley premia escucharlo entero.", tags: ["rock", "pop"] },
  { id: "e9", category: "escuchar", title: "Buena Vista Social Club", by: "Buena Vista Social Club", meta: "60 min", minutes: 60, minLevel: 3, why: "Son cubano grabado casi en vivo. Cálido y sin prisa.", tags: ["latina", "jazz"] },
  { id: "e10", category: "escuchar", title: "Migration", by: "Bonobo", meta: "62 min", minutes: 62, minLevel: 3, why: "Electrónica suave que se va construyendo canción a canción.", tags: ["electronica"] },
  { id: "e5", category: "escuchar", title: "Blonde", by: "Frank Ocean", meta: "60 min", minutes: 60, minLevel: 3, why: "Íntimo y cambiante: pide atención real.", tags: ["hiphop", "pop"] },
  { id: "e6", category: "escuchar", title: "Random Access Memories", by: "Daft Punk", meta: "74 min", minutes: 74, minLevel: 4, why: "Largo, con mucho detalle en cada capa.", tags: ["electronica", "pop"] },
  { id: "e7", category: "escuchar", title: "To Pimp a Butterfly", by: "Kendrick Lamar", meta: "79 min", minutes: 79, minLevel: 5, why: "Denso en letra y sonido. Un álbum para escuchar, no de fondo.", tags: ["hiphop", "jazz"] },
];

const LIKE_LABEL = Object.fromEntries([...STORY_LIKES, ...MUSIC_LIKES].map((o) => [o.value, o.label]));

/** El gusto que tiene en común con el perfil, para mostrar "porque te gusta…". */
export function matchReason(item: CatalogItem, profile?: Profile): string | undefined {
  const tag = item.tags.find((t) => profile?.likes.includes(t));
  return tag ? `Porque te gusta: ${LIKE_LABEL[tag].toLowerCase()}` : undefined;
}

/**
 * Recomendaciones para tu nivel, primero las que coinciden con tus gustos.
 * Las categorías que no elegiste en las preguntas iniciales no aparecen.
 */
export function recommendedFor(level: number, profile?: Profile) {
  const wants = profile?.wants.length ? profile.wants : (["leer", "ver", "escuchar"] as Category[]);
  const score = (c: CatalogItem) => {
    const matches = c.tags.filter((t) => profile?.likes.includes(t)).length;
    return Math.abs(c.minLevel - level) * 1.5 - Math.min(matches, 2) * 2;
  };
  return CATALOG.filter((c) => wants.includes(c.category) && c.minLevel <= level + 1).sort((a, b) => score(a) - score(b));
}
