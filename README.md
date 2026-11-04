# A.I. Consulting — sitio web

Sitio de A.I. Consulting (Andes Intelligence Consulting), consultora peruana de IA, automatización y desarrollo web. Vite + JavaScript sin frameworks, con un campo de partículas en canvas que cambia de forma con el scroll.

## Desarrollo

```bash
npm install
npm run dev       # servidor local
npm run build     # build de producción en dist/
npm run preview   # sirve el build
```

## Estructura

```
index.html               Página principal
blog/index.html          Listado del blog
blog/<slug>/index.html   Un artículo por carpeta
partials/                Encabezado, pie y estilos críticos compartidos (<!-- include:header -->)
privacidad/index.html    Política de privacidad (Ley N.° 29733)
src/main.js              Punto de entrada de la página principal
src/blog.js              Punto de entrada de las páginas del blog
src/data/posts.js        Índice de artículos (título, fecha, etiquetas) y datos del autor
src/particles/shapes.js  Formas de partículas (cerebro, engranes, chat, navegador…)
src/particles/field.js   Motor del canvas y mezcla por scroll
src/data/projects.js     Casos de la sección «Proyectos» (textos, resultados, pantallas e imágenes)
src/ui/mockups.js        Pantallas generadas que ilustran cada proyecto
src/ui/                  Navegación, animaciones, proyectos y formulario
src/styles/              Tokens, base, componentes, secciones y responsive
```

## Partículas por sección

Cada `<section data-shape="…">` define la forma que toman las partículas cuando la sección cruza el centro de la pantalla:

| Atributo | Uso |
|----------|-----|
| `data-shape` | `aiBrain`, `chaos`, `cloud`, `chart`, `gears`, `chat`, `browser`, `wave`, `helix`, `plane` |
| `data-x`, `data-y` | Centro de la forma (0–1 del viewport) |
| `data-scale` | Tamaño |
| `data-mx`, `data-my`, `data-mscale` | Lo mismo para pantallas < 860px |

Para crear una forma nueva, agrega un generador en `shapes.js` y su rotación en `rotations`.

## Formulario de contacto

El formulario envía un JSON a `/api/contact`, una función serverless de Vercel ([api/contact.js](api/contact.js)) que manda un correo HTML con el logo a los destinatarios de `CONTACT_TO` vía Mailgun. Las variables están en `.env.example`; las del servidor (`MAILGUN_*`, `CONTACT_*`, `SITE_URL`) van en **Vercel → Settings → Environment Variables**, nunca con prefijo `VITE_`, para que la API key no llegue al navegador.

En local, `npm run dev` no ejecuta la función: usa `vercel dev` para probar el envío.

## Proyectos

En escritorio la sección se fija y las tarjetas avanzan de lado con el scroll; en móvil es un carrusel deslizable. Cada tarjeta abre un visor con galería, reto, solución y resultados.

Para mostrar capturas reales de un proyecto, colócalas en `public/projects/` y agrégalas en `images` dentro de `src/data/projects.js`:

```js
images: ['/projects/legal-1.jpg', '/projects/legal-2.jpg'],
```

Las imágenes aparecen primero en el visor; las pantallas de `screens` (`document`, `chat`, `dashboard`, `flow`, `store`, `product`, `landing`, `analytics`, `kanban`) siguen ilustrando la tarjeta.

## Blog

Cada artículo es una página estática en `blog/<slug>/index.html`, con su texto, citas numeradas y referencias. Para publicar uno nuevo:

1. Copia la carpeta de un artículo existente con un nuevo `slug` y edita el contenido dentro de `.prose`.
2. Agrega su entrada en `src/data/posts.js` (mismo `slug`), que alimenta el listado, la sección del blog en la portada y «Sigue leyendo».

Vite detecta automáticamente cada carpeta de `blog/` al compilar. El índice de contenidos, la barra de lectura y la caja de autor se generan solos.

## Transición entre páginas

Los enlaces a otra página del sitio cierran una cortina de cinco paneles con el logo y el nombre del destino, y la página nueva la abre al cargar. La cortina se pinta desde el HTML con los estilos críticos de `partials/head.html`, así que nunca aparece una pantalla en blanco. Además, la página siguiente se precarga al pasar el cursor sobre el enlace. La lógica está en `src/ui/page-transition.js` y los estilos en `src/styles/transition.css`.
