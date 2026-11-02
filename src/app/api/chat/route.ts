import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

interface ChatContext {
  level: number;
  levelName: string;
  levelMinutes: number;
  energyToday?: string;
  recentSessions: { category: string; title: string; actualMin: number; completed: boolean; helped?: boolean }[];
  plan: { category: string; title: string }[];
}

const BASE_PROMPT = `Eres el compañero de lectura, cine y música dentro de Brasa, una app personal para recuperar la capacidad de atención y la energía. La persona siente que el scroll y el contenido corto le dejaron el "cerebro podrido" y está entrenando su atención poco a poco, con niveles.

Cómo responder:
- En español, cálido y directo, como un amigo que sabe mucho de libros, películas y música. Respuestas cortas para leer en el celular: 2 a 5 frases normalmente.
- Usa siempre su nivel de atención actual para opinar. Ejemplo: si pregunta por un libro largo y denso y hoy aguanta 20 minutos, dilo con honestidad y propón cómo abordarlo (por capítulos) o una alternativa para ahora y dejarlo para más adelante.
- Ten en cuenta su historial: lo que terminó, lo que dejó y lo que le ayudó ("helped: true").
- No inventes datos. Si no conoces bien una obra, dilo.
- No uses markdown con encabezados ni listas largas; texto simple.

Cuando recomiendes una obra concreta que pueda agregar a su plan, añade al final de tu mensaje una línea por obra con este formato exacto (máximo 3):
[[plan|categoria|Título|Autor o año|duración legible|minutos]]
- categoria es leer, ver o escuchar
- duración legible: por ejemplo "180 págs" o "95 min"
- minutos: minutos de una sesión típica (para libros, una sesión de lectura acorde a su nivel; para películas y álbumes, la duración total)
Ejemplo: [[plan|leer|El principito|Antoine de Saint-Exupéry|96 págs|15]]

No eres terapeuta. Si la persona expresa malestar fuerte o persistente, responde con calidez, sin diagnosticar, y anímala a hablar con alguien de confianza o con un profesional. Si menciona hacerse daño, prioriza eso y sugiérele contactar de inmediato a una línea de ayuda o servicio de emergencia de su país.`;

function contextBlock(ctx: ChatContext) {
  const sessions = ctx.recentSessions.length
    ? ctx.recentSessions
        .map(
          (s) =>
            `- ${s.category}: "${s.title}", ${s.actualMin} min, ${s.completed ? "completada" : "se distrajo"}${
              s.helped === undefined ? "" : s.helped ? ", le ayudó" : ", no le ayudó mucho"
            }`,
        )
        .join("\n")
    : "- Aún no tiene sesiones.";
  const plan = ctx.plan.length ? ctx.plan.map((p) => `- ${p.category}: ${p.title}`).join("\n") : "- Vacío.";
  return `Contexto actual de la persona:
Nivel de atención: ${ctx.level} (${ctx.levelName}), aguanta unos ${ctx.levelMinutes} min seguidos.
Energía hoy: ${ctx.energyToday ?? "no la marcó"}.
Últimas sesiones:
${sessions}
Su plan:
${plan}`;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      "Falta configurar tu API key de Anthropic. Agrégala en el archivo .env.local como ANTHROPIC_API_KEY y reinicia la app.",
      { status: 500 },
    );
  }

  const { messages, context } = (await req.json()) as {
    messages: Anthropic.MessageParam[];
    context: ChatContext;
  };

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const body = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.beta.messages.stream({
          model: "claude-opus-5-5",
          max_tokens: 16000,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          output_config: { effort: "low" },
          system: [
            { type: "text", text: BASE_PROMPT, cache_control: { type: "ephemeral" } },
            { type: "text", text: contextBlock(context) },
          ],
          messages: messages.slice(-30),
        });

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\nNo puedo ayudarte con eso. ¿Hablamos de otra cosa?"));
        }
      } catch (err) {
        const msg =
          err instanceof Anthropic.AuthenticationError
            ? "Tu API key no es válida. Revisa ANTHROPIC_API_KEY en .env.local."
            : err instanceof Anthropic.RateLimitError
              ? "Muchas preguntas seguidas. Espera un momento y vuelve a intentar."
              : err instanceof Anthropic.APIConnectionError
                ? "No hay conexión con el servidor. Revisa tu internet."
                : "Algo salió mal. Intenta de nuevo.";
        controller.enqueue(encoder.encode(`\n\n[error] ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
