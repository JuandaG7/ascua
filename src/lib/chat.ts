import Anthropic from "@anthropic-ai/sdk";
import { getState, today } from "./store";
import { levelInfo } from "./levels";
import type { ChatMessage } from "./types";

const KEY_STORAGE = "brasa:anthropic-key";

export function getApiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function setApiKey(key: string) {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key.trim());
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    // Sin almacenamiento disponible.
  }
}

const BASE_PROMPT = `Eres el compañero de lectura, cine y música dentro de Brasa, una app personal para recuperar la capacidad de atención y la energía. La persona siente que el scroll y el contenido corto le dejaron el "cerebro podrido" y está entrenando su atención poco a poco, con niveles.

Cómo responder:
- En español, cálido y directo, como un amigo que sabe mucho de libros, películas y música. Respuestas cortas para leer en el celular: 2 a 5 frases normalmente.
- Usa siempre su nivel de atención actual para opinar. Ejemplo: si pregunta por un libro largo y denso y hoy aguanta 20 minutos, dilo con honestidad y propón cómo abordarlo (por capítulos) o una alternativa para ahora y dejarlo para más adelante.
- Ten en cuenta su historial: lo que terminó, lo que dejó y lo que le ayudó.
- No inventes datos. Si no conoces bien una obra, dilo.
- No uses markdown con encabezados ni listas largas; texto simple.

Cuando recomiendes una obra concreta que pueda agregar a su plan, añade al final de tu mensaje una línea por obra con este formato exacto (máximo 3):
[[plan|categoria|Título|Autor o año|duración legible|minutos]]
- categoria es leer, ver o escuchar
- duración legible: por ejemplo "180 págs" o "95 min"
- minutos: minutos de una sesión típica (para libros, una sesión de lectura acorde a su nivel; para películas y álbumes, la duración total)
Ejemplo: [[plan|leer|El principito|Antoine de Saint-Exupéry|96 págs|15]]

No eres terapeuta. Si la persona expresa malestar fuerte o persistente, responde con calidez, sin diagnosticar, y anímala a hablar con alguien de confianza o con un profesional. Si menciona hacerse daño, prioriza eso y sugiérele contactar de inmediato a una línea de ayuda o servicio de emergencia de su país.`;

function contextBlock() {
  const s = getState();
  const lvl = levelInfo(s.level);
  const energy = s.checkIns.find((c) => c.date === today())?.energy;
  const sessions = s.sessions.slice(-12);
  const sessionLines = sessions.length
    ? sessions
        .map(
          (x) =>
            `- ${x.category}: "${x.title}", ${x.actualMin} min, ${x.completed ? "completada" : "se distrajo"}${
              x.helped === undefined ? "" : x.helped ? ", le ayudó" : ", no le ayudó mucho"
            }`,
        )
        .join("\n")
    : "- Aún no tiene sesiones.";
  const plan = s.plan.filter((p) => !p.done);
  const planLines = plan.length ? plan.map((p) => `- ${p.category}: ${p.title}`).join("\n") : "- Vacío.";
  return `Contexto actual de la persona:
Nivel de atención: ${lvl.level} (${lvl.name}), aguanta unos ${lvl.minutes} min seguidos.
Energía hoy: ${energy ?? "no la marcó"}.
Últimas sesiones:
${sessionLines}
Su plan:
${planLines}`;
}

export class MissingKeyError extends Error {}

/**
 * Llama a Claude directo desde el navegador con la key guardada en este dispositivo.
 * La app es estática (GitHub Pages), así que no hay servidor que guarde la key.
 */
export async function streamReply(history: ChatMessage[], onText: (full: string) => void): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new MissingKeyError();

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  let full = "";
  try {
    const stream = client.beta.messages.stream({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [
        { type: "text", text: BASE_PROMPT, cache_control: { type: "ephemeral" } },
        { type: "text", text: contextBlock() },
      ],
      messages: history.slice(-30),
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        full += event.delta.text;
        onText(full);
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      full += "\n\nNo puedo ayudarte con eso. ¿Hablamos de otra cosa?";
      onText(full);
    }
    return full;
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError)
      throw new Error("Tu API key no es válida. Revísala en Ajustes.");
    if (err instanceof Anthropic.RateLimitError)
      throw new Error("Muchas preguntas seguidas. Espera un momento y vuelve a intentar.");
    if (err instanceof Anthropic.APIConnectionError) throw new Error("No hay conexión. Revisa tu internet.");
    throw new Error("Algo salió mal. Intenta de nuevo.");
  }
}
