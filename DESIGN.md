---
name: Río y Brasa
description: Sistema de diseño para una app de recuperación de atención y energía. Calma de jardín zen (verdes) con calidez de brasa (terracota) para la energía y dorado suave para los logros.
colors:
  light:
    # Superficies (niebla de río + crema cálida)
    canvas: '#F5F7F4'          # fondo de la app
    surface: '#EDF2EC'         # tarjetas
    surface-nested: '#E2EAE1'  # elementos dentro de tarjetas, chips en reposo
    surface-warm: '#F6F0E9'    # tarjetas de check-in / energía
    surface-raised: '#FFFFFF'  # hojas inferiores, campos de chat
    # Texto
    ink: '#1C2420'             # texto principal (16.0:1 sobre canvas)
    ink-soft: '#5A6B61'        # texto secundario (5.2:1)
    ink-faint: '#7D8C83'       # solo placeholders y metadatos grandes
    border: 'rgba(118, 138, 126, 0.16)'
    # Roles
    primary: '#1E3A2F'         # Bonsai: acción principal, títulos de énfasis
    on-primary: '#F5F7F4'
    primary-hover: '#274C3D'
    focus: '#3B7A68'           # River jade: modo foco, progreso (5.0:1 con blanco)
    focus-tint: '#D3E6DD'
    on-focus-tint: '#1F4A3D'
    energy: '#B5573A'          # Brasa: check-in, "Empezar" (4.6:1 con blanco)
    energy-hover: '#9E4930'
    energy-tint: '#F6DDD2'
    on-energy-tint: '#7A2F15'
    achievement: '#D4A373'     # Sunlit leaf: SOLO relleno, nunca texto
    achievement-tint: '#F5E6D3'
    on-achievement-tint: '#6B4410'
    calm: '#E4E1EE'            # Lavanda niebla: chat y diario de voz
    on-calm: '#463F66'
    create-tint: '#F3E1E5'     # Rosa empolvado: actividades de crear
    on-create-tint: '#6E3346'
    move-tint: '#DCE8EF'       # Azul niebla de río: moverte
    on-move-tint: '#24465C'
  dark:
    canvas: '#121915'
    surface: '#1A231E'
    surface-nested: '#232E28'
    surface-warm: '#211D19'
    surface-raised: '#26312B'
    ink: '#E4ECE6'
    ink-soft: '#9DB0A5'
    ink-faint: '#71837A'
    border: 'rgba(200, 216, 206, 0.10)'
    primary: '#A8CBBB'
    on-primary: '#0E241B'
    primary-hover: '#BCD9CB'
    focus: '#7FBFAA'
    focus-tint: '#1D3A31'
    on-focus-tint: '#BFE3D5'
    energy: '#E89A7C'
    energy-hover: '#F0AE94'
    energy-tint: '#3B2418'
    on-energy-tint: '#F6CDBB'
    achievement: '#E2BC8E'
    achievement-tint: '#3A2F1F'
    on-achievement-tint: '#F0D3AE'
    calm: '#2A2738'
    on-calm: '#D2CCEB'
    create-tint: '#36222A'
    on-create-tint: '#F0C9D4'
    move-tint: '#1B2A35'
    on-move-tint: '#C3DAEA'
categories:
  # Cada actividad tiene un color fijo (tint de fondo + texto oscuro de la misma familia)
  leer: achievement-tint / on-achievement-tint
  ver: energy-tint / on-energy-tint
  escuchar: focus-tint / on-focus-tint
  hablar: calm / on-calm
  # Crear y moverte usan un color por grupo para que la paleta no se llene
  escribir, dibujar, cocinar: create-tint / on-create-tint
  caminar: move-tint / on-move-tint
typography:
  display:     { fontFamily: Newsreader, fontSize: 40px, fontWeight: '400', lineHeight: 48px, letterSpacing: -0.02em }
  headline-lg: { fontFamily: Newsreader, fontSize: 28px, fontWeight: '400', lineHeight: 36px, letterSpacing: -0.01em }
  headline-md: { fontFamily: Newsreader, fontSize: 22px, fontWeight: '400', lineHeight: 30px }
  headline-sm: { fontFamily: Newsreader, fontSize: 18px, fontWeight: '500', lineHeight: 26px }
  timer:       { fontFamily: Newsreader, fontSize: 56px, fontWeight: '300', lineHeight: 64px, fontFeature: tnum }
  body-lg:     { fontFamily: Plus Jakarta Sans, fontSize: 17px, fontWeight: '400', lineHeight: 26px }
  body-md:     { fontFamily: Plus Jakarta Sans, fontSize: 15px, fontWeight: '400', lineHeight: 23px }
  body-sm:     { fontFamily: Plus Jakarta Sans, fontSize: 13px, fontWeight: '400', lineHeight: 19px }
  label:       { fontFamily: Plus Jakarta Sans, fontSize: 13px, fontWeight: '500', lineHeight: 18px, letterSpacing: 0.01em }
  caption:     { fontFamily: Plus Jakarta Sans, fontSize: 12px, fontWeight: '500', lineHeight: 16px, letterSpacing: 0.02em }
rounded:
  sm: 0.75rem
  DEFAULT: 1.25rem
  lg: 1.75rem
  xl: 2.5rem
  full: 9999px
spacing:
  margin: 1.25rem
  margin-tablet: 2.5rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3rem
motion:
  fast: 180ms
  base: 320ms
  slow: 600ms
  easing: cubic-bezier(0.22, 1, 0.36, 1)   # suave, sin rebote
---

## Idea

Un jardín zen junto a un río, con una brasa encendida. Los **verdes** calman y acompañan el foco; la **brasa** (terracota) es la energía que te pone en marcha; el **dorado** aparece solo cuando logras algo. Nada grita, pero la app no te deja "apagado".

## Reglas de color

- **Cada color tiene un trabajo.** Verde jade = foco y progreso. Brasa = energía y acción de empezar. Dorado = logros. Lavanda niebla = chat y diario de voz. No se mezclan roles.
- **Nada de rojo de alarma ni verde neón.** No existe un color de "error". Lo que falla se dice con texto amable sobre superficies neutras.
- **"Me distraje" nunca se pinta como error.** Es un botón secundario neutro, igual de válido que "Terminé".
- **El dorado nunca es texto.** Solo relleno o fondo de logros; el texto encima usa `on-achievement-tint`.
- **Texto sobre color = la variante oscura de la misma familia**, nunca negro ni gris genérico.
- **Contraste mínimo AA** (4.5:1 texto normal, 3:1 texto grande) en ambos modos.

## Tipografía

- **Newsreader** para títulos, el temporizador y citas de libros. Da sensación de libro, que es justo lo que la app quiere recuperar.
- **Plus Jakarta Sans** para la interfaz, el chat y los números.
- Pesos máximos: 500 en títulos, 600 nunca. Números con cifras tabulares (`tnum`).

## Superficies y profundidad

- La jerarquía se marca con tono: `canvas` → `surface` → `surface-nested`. Sin líneas divisorias; se separa con espacio.
- `surface-warm` se reserva para el check-in de energía, para que ese momento se sienta distinto.
- Sombra solo en elementos flotantes (hojas inferiores, reproductor de audio):
  `box-shadow: 0 16px 36px -10px rgba(30, 58, 47, 0.08), 0 4px 12px -2px rgba(30, 58, 47, 0.04);`

## Formas

- Botones, chips y campos: píldora (`full`).
- Tarjetas: `lg` (28px). Hojas inferiores y modales: `xl` arriba.
- Botones de al menos 52px de alto.

## Movimiento

- Transiciones lentas y suaves (`base` 320ms), sin rebotes ni destellos.
- El anillo del modo foco avanza de forma continua, sin saltos por segundo.
- Al completar un reto: un brillo dorado que se expande despacio (`slow`), nada de confeti.

## Pantallas y componentes

### Inicio
- Saludo en Newsreader + check-in de energía (3 chips: bajo, medio, alto) sobre `surface-warm`; el chip elegido usa `energy-tint`.
- Tarjeta "Tu reto de hoy" con fondo de su categoría y botón **Empezar** en `energy`.
- Tarjeta de progreso: barra en `focus` sobre `surface-nested`, texto en minutos reales ("Ayer aguantaste 32 min").

### Modo foco
- Pantalla completa en `primary` (Bonsai) en ambos modos: inmersiva y sin distracciones.
- Temporizador en Newsreader `timer`, anillo en `focus`.
- Dos botones iguales en tamaño: **Me distraje** (secundario) y **Terminé** (relleno claro).

### Biblioteca
- Tarjetas de recomendaciones con el tint de su categoría, duración o páginas arriba en `caption` y título en `headline-sm`.
- Filtro por categoría con chips; el seleccionado usa `primary`.

### Chat
- Burbujas del usuario en `primary` con `on-primary`; respuestas en `surface` con `ink`.
- Si la respuesta recomienda algo, lleva una tarjeta de acción con **Agregar a mi plan**.
- Campo de texto en `surface-raised`, píldora.

### Diario de voz
- Fondo con acento `calm`. Botón de grabar grande y circular en `on-calm` / `calm`.
- Ningún feedback de IA por defecto. Las grabaciones se guardan en el dispositivo.
- Atajo "Vaciar la cabeza" antes de una sesión de foco.

### Progreso
- Minutos de atención profunda por semana en barras `focus`.
- Logros en tarjetas `achievement-tint`.
