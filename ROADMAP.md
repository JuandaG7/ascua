# Roadmap de Ascua

Estado actual (v1.1): check-in de energía, reto diario por nivel, modo foco, niveles, biblioteca con 23 recomendaciones, chat con Claude, diario de voz local, progreso, ajustes y copias de seguridad. Todo guardado en el teléfono.

## Fase 1 · Usarla de verdad en el celular

Sin esto la app funciona, pero no está lista para el día a día.

- [x] **Publicada con HTTPS** en GitHub Pages, igual que las otras apps. Hace falta para el micrófono y para instalarla.
- [x] **Chat sin servidor:** la API key se guarda solo en el teléfono, así que no hay un endpoint público que otros puedan usar.
- [x] **Copia de seguridad:** exportar e importar un archivo (con o sin grabaciones), con un aviso si hace más de 14 días que no la haces.
- [x] **Modo sin conexión** (service worker): abre aunque no haya internet. Solo el chat necesita red.
- [x] **Íconos PNG** de 180, 192 y 512 px.
- [x] **Ajustes:** tu nombre, la API key, borrar sesiones y reiniciar el progreso.
- [ ] **Probar en el iPhone:** micrófono, instalación, modo sin conexión y chat con la key real.

## Fase 2 · Que te conozca mejor

Aquí la app pasa de "lista fija" a "recomendaciones para ti".

- [x] **Preguntas iniciales:** cuánto aguantas hoy (nivel de partida), qué quieres recuperar, tus gustos, cuándo tienes tiempo, qué te distrae y tu meta. Ordenan las recomendaciones, eligen el reto diario, dan consejos en el modo foco y le dan contexto al chat.

- [x] **Más actividades:** escribir, dibujar, cocinar y caminar, con retos e ideas por nivel (grupos Disfrutar, Crear y Moverte).
- [x] **Tus favoritos** (libros, películas, álbumes) en las preguntas iniciales.
- [x] **Recomendaciones de Claude en la Biblioteca** según tus favoritos, lo que terminaste y lo que te pareció.
- [x] **Marcar obras como terminadas o dejadas**, con qué te pareció, si agarraste el celular y una nota. No se vuelven a recomendar; el chat y Claude usan tu opinión.
- [x] **Al terminar una sesión:** "¿Agarraste el celular?" y, si era una obra, "¿La terminaste? ¿Qué te pareció?". En Progreso: % de sesiones sin celular.
- [ ] **"No me interesa"** para descartar una recomendación sin haberla visto.
- [ ] **Progreso por libro:** páginas totales, por dónde vas y un logro al terminarlo.
- [x] **Perfil de gustos** que el chat recuerda: géneros, favoritos y lo que te gustó o no.
- [ ] **Chat con tool use** en lugar de etiquetas en el texto: más fiable al agregar cosas al plan.
- [ ] **Sonidos ambiente en modo foco** (río, lluvia, fuego), muy suaves y opcionales.

## Fase 3 · Entender cómo estás

- [ ] **Resumen semanal** escrito por IA: cuánto aguantaste, qué te ayudó y qué probar la próxima semana.
- [ ] **Energía en el tiempo:** gráfico de tus check-ins y su relación con las sesiones ("los días que lees, al otro día llegas con más energía").
- [ ] **Diario de voz v2 (opcional y privado):** transcripción solo si la activas, para ver de qué hablas más. Sin que la IA te responda como terapeuta.
- [ ] **Recordatorio suave** a la hora que elijas (notificaciones web; en iPhone solo con la app instalada).

## Fase 4 · Producto completo

Solo si quieres llevarla más allá de uso personal.

- [ ] **Cuenta y sincronización** entre dispositivos (por ejemplo, Supabase).
- [ ] **App nativa (Expo)** para lo que la web no puede: bloquear apps durante el modo foco (Screen Time en iOS), notificaciones fiables con la pantalla bloqueada y widgets.
- [ ] **Tests** de la lógica de niveles y del reto diario.
- [ ] **Revisión de accesibilidad** completa (lector de pantalla, tamaños de texto grandes).

## Limitaciones conocidas de la v1

- Con la pantalla bloqueada, el aviso de fin de sesión puede no sonar (el navegador congela la página). El tiempo sí se calcula bien al volver.
- El chat no está probado contra la API real todavía (falta la key).
- La grabación de voz no está probada en un dispositivo real.
