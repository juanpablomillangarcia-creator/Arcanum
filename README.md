# ARCANUM

Caja de herramientas en español para dirigir y jugar **Dungeons & Dragons 5e**, pensada
para usarse en la mesa desde el móvil. Es el port del prototipo monolítico
`arcanum-41.html` a una webapp **Next.js + Tailwind**, mobile-first y desplegable en Vercel.

## Estado del port

Reconstrucción incremental: se preserva la funcionalidad y la identidad visual del
original, pero sobre abstracciones compartidas (un motor de generadores, un sistema de
tokens de diseño, un patrón único de persistencia) en lugar de copiar las ~36 000 líneas.

**Listo y verificado** (`npm run build` / `lint` / `tsc` limpios):

- Sistema de diseño (Grimorio Oscuro), atmósfera, tipografías.
- Shell responsive: barra lateral en escritorio, cajón + barra inferior en móvil.
- **Cámara de los Dados** (con Dados del Caos), **El Oráculo**, **Mesa de Combate**.
- **Generador de NPCs** (procedural + IA) sobre el motor de generadores reutilizable.
- Capa de IA: proxy en `app/api/claude` (tu clave nunca llega al bundle) + ajustes.

**Pendiente** (rutas navegables con marcador "en construcción"): Cofre del Tesoro,
Atlas de Lugares, Cartógrafo de Ciudades, Balanza del Combate, Cinceladora de Hechizos,
Taller de Reliquias (todos = configuración del motor); Compendio y Bestiario; Forja de
Personajes; Tejedor de Campañas.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
npm run lint
```

### Datos del SRD

El contenido estático (SRD, tablas del caos, oráculo, NPCs…) se extrae **verbatim** del
HTML original a `src/data/*.ts`:

```bash
node scripts/extract-data.mjs
```

### IA (opcional)

Los generadores con IA usan tu propia clave de Anthropic, que se introduce en
**Ajustes** y se guarda solo en tu dispositivo. Las llamadas pasan por
`app/api/claude/route.ts` para no exponer la clave en el cliente.

## Arquitectura

- `app/` — rutas (una por herramienta) + layout/shell + ruta de API.
- `src/data/` — contenido extraído y registro de herramientas.
- `src/lib/` — motores puros (dados, oráculo, NPC, IA).
- `src/store/` — estado con Zustand + `persist` (mismas claves `arcanum.<tool>.v1`).
- `src/components/` — shell, motor de generadores y piezas compartidas.

`arcanum-41.html` permanece en el repo como referencia de comportamiento.
