# Brasa

App personal para recuperar la atención y la energía, un poco cada día. Diseño en [DESIGN.md](DESIGN.md).

## Pantallas

- **Inicio**: check-in de energía, reto del día según tu nivel y energía, y tu plan.
- **Modo foco**: temporizador inmersivo, "Me distraje" / "Terminé" y "¿te ayudó?".
- **Biblioteca**: recomendaciones por nivel y tu plan.
- **Chat**: pregunta por libros, pelis o música; responde según tu nivel e historial (Claude).
- **Voz**: diario de voz para vaciar la cabeza. Solo se guarda en el teléfono (IndexedDB).
- **Progreso**: minutos por día, niveles, lo que te funciona y logros.

Todos los datos viven en el navegador (localStorage e IndexedDB). Solo el chat sale a internet.

## Correr en local

1. Pon tu API key de Anthropic en `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
2. `npm install` y `npm run dev`.
3. Abre http://localhost:3000. Para probar en el celular, usa la dirección "Network" que imprime Next.js (misma red wifi).

## Instalarla en el celular

Despliégala (por ejemplo en Vercel, agregando `ANTHROPIC_API_KEY` en las variables de entorno), ábrela en el navegador del celular y usa "Agregar a pantalla de inicio".

Ojo: la ruta `/api/chat` no tiene contraseña. Si la despliegas en una URL pública, cualquiera que la encuentre podría usar tu API key.
