import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { getApiKey, MissingKeyError } from "./chat";
import { getState, setState } from "./store";
import { levelInfo } from "./levels";
import { profileForChat } from "./profile";
import { ratingLabel, phoneLabel } from "./works";
import { WORK_CATEGORIES } from "./activities";
import type { AiRec } from "./types";

const SCHEMA = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["leer", "ver", "escuchar"] },
          title: { type: "string" },
          by: { type: "string", description: "Autor, director y año, o artista" },
          meta: { type: "string", description: 'Duración legible, por ejemplo "180 págs" o "95 min"' },
          minutes: { type: "integer", description: "Minutos de una sesión típica (libros: según su nivel; películas y álbumes: duración total)" },
          why: { type: "string", description: "Una frase, en segunda persona, de por qué le va a gustar según sus favoritos y su nivel" },
        },
        required: ["category", "title", "by", "meta", "minutes", "why"],
        additionalProperties: false,
      },
    },
  },
  required: ["recommendations"],
  additionalProperties: false,
} as const;

function buildPrompt() {
  const s = getState();
  const lvl = levelInfo(s.level);
  const wants = (s.profile?.wants ?? []).filter((c) => (WORK_CATEGORIES as string[]).includes(c));
  const finished = (s.finished ?? []).map(
    (f) =>
      `- ${f.category}: "${f.title}" (${f.status === "terminado" ? "terminado" : "lo dejó"}${
        f.rating ? `, ${ratingLabel(f.rating)?.toLowerCase()}` : ""
      }${f.phone ? `, agarró el celular: ${phoneLabel(f.phone)?.toLowerCase()}` : ""}${f.note ? `, nota: ${f.note}` : ""})`,
  );
  const plan = s.plan.filter((p) => !p.done).map((p) => `- ${p.title}`);
  return `Recomienda 6 obras reales para alguien que está recuperando su capacidad de atención.

Categorías que quiere (solo estas): ${(wants.length ? wants : WORK_CATEGORIES).join(", ")}. Reparte las 6 entre ellas.
Nivel de atención: ${lvl.level} (${lvl.name}), aguanta unos ${lvl.minutes} minutos seguidos. Elige obras que pueda sostener ahora: que enganchen, y como mucho un poco más exigentes que su nivel.

${profileForChat(s.profile)}

Ya terminó o dejó (no las repitas; usa su opinión para afinar):
${finished.length ? finished.join("\n") : "- Nada todavía."}

Ya están en su plan (no las repitas):
${plan.length ? plan.join("\n") : "- Nada."}

Reglas: obras que existan de verdad y que conozcas bien, con datos correctos. Nada de sus favoritos. Si le gustó algo, busca afinidad real (autor, tono, ritmo), no solo el mismo género. Escribe en español.`;
}

/** Pide 6 recomendaciones personalizadas a Claude y las guarda en el estado. */
export async function generateAiRecs(): Promise<AiRec[]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new MissingKeyError();
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: jsonSchemaOutputFormat(SCHEMA) },
      messages: [{ role: "user", content: buildPrompt() }],
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) {
      throw new Error("No se pudieron generar recomendaciones. Intenta de nuevo.");
    }
    const items = response.parsed_output.recommendations.map((r) => ({ ...r, minutes: Math.max(5, r.minutes) }));
    setState((s) => ({ ...s, aiRecs: { items, at: new Date().toISOString() } }));
    return items;
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new Error("Tu API key no es válida. Revísala en Ajustes.");
    if (err instanceof Anthropic.RateLimitError) throw new Error("Muchas peticiones seguidas. Espera un momento.");
    if (err instanceof Anthropic.APIConnectionError) throw new Error("No hay conexión. Revisa tu internet.");
    if (err instanceof Error && err.message.startsWith("No se pudieron")) throw err;
    throw new Error("Algo salió mal. Intenta de nuevo.");
  }
}
