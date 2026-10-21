// Blog index. Each post's full text lives in blog/<slug>/index.html; this list
// feeds the blog listing, the home teaser and the "keep reading" block.
export const author = {
  name: 'Kevin Quispe Aquise',
  initials: 'KQ',
  role: 'Senior Software Engineer y AI Engineer en Interbank · Líder técnico',
};

export const posts = [
  {
    slug: 'seguridad-llm-owasp-prompt-injection',
    title: 'Seguridad en IA: los 10 riesgos que debes conocer antes de llevar un LLM a producción',
    excerpt: 'Prompt injection, fuga de datos, agentes con demasiados permisos. Un recorrido práctico por el OWASP Top 10 para aplicaciones con LLM y cómo mitigar cada riesgo.',
    date: '2026-09-22',
    readingTime: 9,
    tags: ['Seguridad'],
    glyph: '◎',
  },
  {
    slug: 'mcp-model-context-protocol-empresas',
    title: 'MCP: el estándar que conecta la IA con tus sistemas (y cómo usarlo sin abrirle la puerta a atacantes)',
    excerpt: 'Qué es el Model Context Protocol, por qué se volvió el "USB-C de la IA" y qué controles aplicar antes de conectar un servidor MCP a datos de tu empresa.',
    date: '2026-08-18',
    readingTime: 8,
    tags: ['MCP', 'Seguridad'],
    glyph: '⇄',
  },
  {
    slug: 'por-que-fracasan-los-pilotos-de-ia',
    title: 'Por qué la mayoría de pilotos de IA no llegan a producción (y cómo estar del lado que sí)',
    excerpt: 'Los estudios de MIT y McKinsey coinciden: casi todas las empresas experimentan con IA, pero muy pocas la escalan. Estas son las causas y un método para evitarlas.',
    date: '2026-07-14',
    readingTime: 7,
    tags: ['Estrategia'],
    glyph: '↗',
  },
  {
    slug: 'agentes-de-ia-cuando-usarlos',
    title: 'Agentes de IA en la empresa: cuándo usarlos y cuándo un flujo simple es mejor',
    excerpt: 'No todo problema necesita un agente autónomo. Cómo elegir entre un flujo determinista y un agente, y cómo limitar lo que ese agente puede hacer.',
    date: '2026-06-09',
    readingTime: 7,
    tags: ['Agentes', 'Arquitectura'],
    glyph: '✦',
  },
  {
    slug: 'rag-en-produccion-evaluacion',
    title: 'RAG en producción: cómo construir y evaluar un asistente que responde con tus documentos',
    excerpt: 'Recuperar el contexto correcto importa más que el modelo. Técnicas de recuperación, métricas de evaluación y los errores más comunes al pasar de la demo a producción.',
    date: '2026-05-12',
    readingTime: 8,
    tags: ['RAG', 'Arquitectura'],
    glyph: '❖',
  },
  {
    slug: 'ley-ia-peru-reglamento-empresas',
    title: 'La Ley de IA en el Perú y su reglamento: lo que tu empresa debería revisar hoy',
    excerpt: 'El Perú aprobó en 2025 el reglamento de la Ley N.° 31814. Un resumen orientado a empresas y una lista de verificación para empezar a prepararse.',
    date: '2026-03-17',
    readingTime: 6,
    tags: ['Regulación', 'Perú'],
    glyph: '§',
  },
];

export const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
