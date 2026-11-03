# Ascua

App web para recuperar la atención y la energía, un poco cada día. Todo se guarda **en el teléfono** (localStorage e IndexedDB). No hay servidor ni cuentas.

Diseño: [DESIGN.md](DESIGN.md) · Lo que falta: [ROADMAP.md](ROADMAP.md)

## Qué hace

- **Inicio**: check-in de energía y un reto del día según tu nivel y tu energía.
- **Modo foco**: temporizador inmersivo, "Me distraje" o "Terminé", y "¿te ayudó?". Con eso aprende qué te funciona.
- **Niveles**: de Chispa (10 min) a Faro (90 min). Se sube con 3 sesiones completas; nunca se baja.
- **Biblioteca**: libros, películas y álbumes por nivel, y tu plan.
- **Chat**: pregunta por un libro, peli o álbum y responde según tu nivel e historial (Claude).
- **Voz**: diario de voz para vaciar la cabeza antes de enfocarte. Nadie responde.
- **Progreso**: minutos por día, niveles, lo que te funciona y logros.
- **Ajustes**: nombre, API key del chat, copias de seguridad y borrar sesiones.

## El chat y la API key

La app es estática, así que el chat llama a Anthropic directo desde el teléfono con **tu** API key. La key se pega en **Ajustes** y se guarda solo en ese teléfono: no está en el código ni en GitHub. Conviene ponerle un límite de gasto mensual en console.anthropic.com.

## Publicar en GitHub Pages

Se publica sola con GitHub Actions ([.github/workflows/pages.yml](.github/workflows/pages.yml)) cada vez que se sube algo a `main`. En GitHub, **Settings → Pages → Source** debe estar en **GitHub Actions**.

Queda en `https://juandag7.github.io/ascua/`.

Para probar en el Mac:

```bash
npm install
npm run dev
```

y abre `http://localhost:3000`.

## Instalarla en el iPhone

1. Abre el enlace en **Safari**.
2. Toca **Compartir** → **Agregar a inicio** → **Agregar**.
3. Ábrela **siempre desde ese ícono**. Lo guardado en Safari y lo guardado en la app instalada son cosas separadas.

## Importante

- **No borrar el ícono de la app**: si lo borras, se borra el progreso. Haz copias desde **Ajustes → Copia de seguridad** y guárdalas en Archivos o iCloud.
- Con la pantalla bloqueada, el aviso de fin de sesión puede no sonar. El tiempo sí se cuenta bien al volver.
