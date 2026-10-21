// Example case studies — replace with real client work.
//
// screens  Generated mockups shown on the card and in the viewer (see ui/mockups.js):
//          document, chat, dashboard, flow, store, product, landing, analytics, kanban.
//          The first one is the hero screen of the card.
// images   Optional real screenshots (e.g. '/projects/legal-1.jpg' inside /public).
//          When present they are shown in the viewer before the mockups.
// accent   Tint for the card backdrop and the mockups.
export const categories = {
  ia: 'IA',
  automatizacion: 'Automatización',
  web: 'Web',
};

export const projects = [
  {
    title: 'Asistente legal con IA',
    client: 'Despacho corporativo',
    category: 'ia',
    year: '2026',
    summary: 'Agente que revisa contratos, detecta cláusulas de riesgo y redacta resúmenes para el equipo legal.',
    challenge: 'El equipo dedicaba días a revisar contratos línea por línea antes de cada firma.',
    solution: 'Un agente entrenado con los criterios del despacho que marca riesgos, sugiere redacción y responde dudas por chat.',
    results: [
      { value: '−70%', label: 'tiempo de revisión' },
      { value: '3×', label: 'contratos por semana' },
    ],
    stack: ['RAG', 'OpenAI', 'Python'],
    screens: ['document', 'chat', 'dashboard'],
    images: [],
    accent: '#c9a45c',
  },
  {
    title: 'Facturación en piloto automático',
    client: 'Distribuidora nacional',
    category: 'automatizacion',
    year: '2026',
    summary: 'Flujo que concilia pagos, emite comprobantes electrónicos y notifica a cobranza sin intervención manual.',
    challenge: 'Tres personas conciliaban pagos y emitían facturas a mano, con errores cada cierre de mes.',
    solution: 'Un flujo que cruza banco y ERP, concilia con IA los casos dudosos, emite el comprobante ante SUNAT y avisa a cobranza.',
    results: [
      { value: '1,200 h', label: 'ahorradas al año' },
      { value: '0', label: 'errores de captura' },
    ],
    stack: ['n8n', 'SUNAT', 'ERP'],
    screens: ['flow', 'dashboard', 'analytics'],
    images: [],
    accent: '#a9a9a6',
  },
  {
    title: 'E-commerce inmersivo',
    client: 'Marca de moda',
    category: 'web',
    year: '2025',
    summary: 'Tienda con escenas 3D, transiciones fluidas y checkout optimizado para móvil.',
    challenge: 'La tienda anterior era lenta en móvil y no transmitía el nivel de la marca.',
    solution: 'Una experiencia de compra con escenas 3D, carga instantánea y un checkout de dos pasos.',
    results: [
      { value: '+48%', label: 'conversión' },
      { value: '1.2 s', label: 'carga en móvil' },
    ],
    stack: ['Three.js', 'Shopify', 'Vite'],
    screens: ['store', 'product', 'landing'],
    images: [],
    accent: '#d4b06a',
  },
  {
    title: 'Agente 24/7 en WhatsApp',
    client: 'Red de clínicas',
    category: 'ia',
    year: '2025',
    summary: 'Asistente que agenda citas, responde dudas frecuentes y escala casos complejos al personal.',
    challenge: 'La recepción no alcanzaba a contestar y se perdían citas fuera de horario.',
    solution: 'Un asistente en WhatsApp conectado a la agenda que confirma, reagenda y responde dudas al instante.',
    results: [
      { value: '82%', label: 'consultas resueltas solas' },
      { value: '8 s', label: 'tiempo de respuesta' },
    ],
    stack: ['WhatsApp API', 'LLM', 'CRM'],
    screens: ['chat', 'analytics', 'dashboard'],
    images: [],
    accent: '#bdbdb9',
  },
  {
    title: 'Pipeline de leads conectado',
    client: 'Desarrolladora inmobiliaria',
    category: 'automatizacion',
    year: '2025',
    summary: 'Captura, califica con IA y asigna prospectos al asesor ideal en segundos.',
    challenge: 'Los prospectos llegaban por cinco canales y tardaban horas en recibir respuesta.',
    solution: 'Un pipeline que centraliza los canales, califica cada prospecto con IA y lo asigna al asesor indicado.',
    results: [
      { value: '3×', label: 'velocidad de respuesta' },
      { value: '+27%', label: 'citas agendadas' },
    ],
    stack: ['Make', 'HubSpot', 'GPT'],
    screens: ['kanban', 'flow', 'chat'],
    images: [],
    accent: '#c2a061',
  },
  {
    title: 'Lanzamiento interactivo',
    client: 'Startup fintech',
    category: 'web',
    year: '2026',
    summary: 'Sitio narrativo con partículas, scroll cinematográfico y rendimiento de 98 en Lighthouse.',
    challenge: 'Necesitaban un lanzamiento que destacara frente a competidores con mucho más presupuesto.',
    solution: 'Un sitio narrativo con partículas y scroll cinematográfico, optimizado para cargar en menos de un segundo.',
    results: [
      { value: '98', label: 'Lighthouse' },
      { value: '40k', label: 'registros en lista de espera' },
    ],
    stack: ['WebGL', 'GSAP', 'Astro'],
    screens: ['landing', 'analytics', 'dashboard'],
    images: [],
    accent: '#9e9e9b',
  },
];
