// Generated product screens used as project imagery until real screenshots exist.
// Every screen sizes itself with container query units, so the same markup works
// as a small card visual and as a full-size slide in the case viewer.

const lines = (count, cls = '') =>
  Array.from({ length: count }, (_, i) => `<i class="ln ${cls}" style="--w:${[92, 78, 86, 64, 88, 70, 82][i % 7]}%"></i>`).join('');

const browser = (title, body, extra = '') => `
  <div class="screen screen--browser ${extra}">
    <div class="screen-bar"><span></span><span></span><span></span><em>${title}</em></div>
    <div class="screen-body">${body}</div>
  </div>`;

const phone = (body, extra = '') => `
  <div class="screen screen--phone ${extra}">
    <div class="phone-notch"></div>
    <div class="screen-body">${body}</div>
  </div>`;

const templates = {
  document: () =>
    browser(
      'contratos.ai/revision',
      `<div class="m-doc">
        <div class="m-page">
          <b class="m-title">Contrato de prestación de servicios</b>
          ${lines(3)}
          <div class="m-flag">${lines(2, 'ln-hi')}<span class="m-note">Riesgo alto · cláusula 7.2</span></div>
          ${lines(3)}
          <div class="m-flag m-flag--mid">${lines(1, 'ln-hi')}<span class="m-note">Revisar penalización</span></div>
          ${lines(2)}
        </div>
        <aside class="m-side">
          <b>Resumen IA</b>
          <div class="m-ring" style="--v:72"><span>72</span></div>
          <p>3 cláusulas de riesgo</p>
          ${lines(4)}
          <span class="m-chip">Generar informe</span>
        </aside>
      </div>`
    ),

  chat: () =>
    phone(
      `<div class="m-chat">
        <div class="m-chat-head"><span class="m-avatar"></span><div><b>Asistente A.I.</b><small>en línea</small></div></div>
        <div class="m-msgs">
          <p class="m-in">Hola, ¿tienen cita para mañana?</p>
          <p class="m-out">¡Claro! Tengo 10:30 y 16:00. ¿Cuál prefieres?</p>
          <p class="m-in">16:00 por favor</p>
          <p class="m-out">Listo ✓ Te envié la confirmación por correo.</p>
          <p class="m-typing"><span></span><span></span><span></span></p>
        </div>
        <div class="m-quick"><span>Reagendar</span><span>Precios</span></div>
      </div>`
    ),

  dashboard: () =>
    browser(
      'panel.aiconsulting.pe',
      `<div class="m-dash">
        <nav class="m-nav"><i></i><i class="on"></i><i></i><i></i><i></i></nav>
        <div class="m-main">
          <div class="m-kpis">
            <div><small>Ingresos</small><b>S/ 4.8M</b><em>+18%</em></div>
            <div><small>Horas ahorradas</small><b>1,240</b><em>+32%</em></div>
            <div><small>Satisfacción</small><b>96%</b><em>+4%</em></div>
          </div>
          <div class="m-chart">
            <svg viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
              <path class="m-area" d="M0 82 C30 78 45 60 75 62 S120 40 150 44 S205 22 230 26 S280 8 300 10 L300 100 L0 100Z"/>
              <path class="m-line" pathLength="1" d="M0 82 C30 78 45 60 75 62 S120 40 150 44 S205 22 230 26 S280 8 300 10"/>
            </svg>
          </div>
          <div class="m-bars">${[86, 64, 72, 48, 58].map((v) => `<span style="--v:${v}%"></span>`).join('')}</div>
        </div>
      </div>`
    ),

  flow: () =>
    browser(
      'automatizaciones/facturacion',
      `<div class="m-flow">
        <svg viewBox="0 0 300 160" preserveAspectRatio="none" aria-hidden="true">
          <path d="M84 40 C102 40 102 80 120 80"/>
          <path d="M84 120 C102 120 102 80 120 80"/>
          <path d="M186 80 C201 80 201 40 216 40"/>
          <path d="M186 80 C201 80 201 120 216 120"/>
          <circle r="2.4"><animateMotion dur="2.4s" begin="0.0s" repeatCount="indefinite" path="M84 40 C102 40 102 80 120 80"/></circle>
          <circle r="2.4"><animateMotion dur="2.4s" begin="0.6s" repeatCount="indefinite" path="M84 120 C102 120 102 80 120 80"/></circle>
          <circle r="2.4"><animateMotion dur="2.4s" begin="1.2s" repeatCount="indefinite" path="M186 80 C201 80 201 40 216 40"/></circle>
          <circle r="2.4"><animateMotion dur="2.4s" begin="1.7999999999999998s" repeatCount="indefinite" path="M186 80 C201 80 201 120 216 120"/></circle>
        </svg>
        <span class="m-node" style="--x:6%;--y:16%"><i>◎</i>Pago recibido</span>
        <span class="m-node" style="--x:6%;--y:66%"><i>▤</i>Pedido ERP</span>
        <span class="m-node m-node--ai" style="--x:40%;--y:41%"><i>✦</i>Conciliar con IA</span>
        <span class="m-node" style="--x:72%;--y:16%"><i>§</i>Emitir comprobante</span>
        <span class="m-node" style="--x:72%;--y:66%"><i>✉</i>Avisar a cobranza</span>
      </div>`
    ),

  store: () =>
    browser(
      'maison.pe',
      `<div class="m-store">
        <div class="m-store-nav"><b>MAISON</b><span></span><span></span><span></span></div>
        <div class="m-hero-product"><div><b>Nueva colección</b>${lines(2)}<span class="m-chip">Comprar</span></div><i class="m-orb"></i></div>
        <div class="m-grid">${[0, 1, 2, 3].map((k) => `<div><i style="--k:${k}"></i><small>S/ ${[129, 89, 149, 99][k]}</small></div>`).join('')}</div>
      </div>`
    ),

  product: () =>
    phone(
      `<div class="m-product">
        <i class="m-orb"></i>
        <b>Abrigo Lana Merino</b>
        <small>S/ 349.00</small>
        ${lines(3)}
        <div class="m-sizes"><span>S</span><span class="on">M</span><span>L</span></div>
        <span class="m-cta">Añadir al carrito</span>
      </div>`
    ),

  landing: () =>
    browser(
      'lanzamiento.app',
      `<div class="m-landing">
        <div class="m-stars"></div>
        <b class="m-big">El futuro de tus finanzas</b>
        ${lines(2)}
        <div class="m-cta-row"><span class="m-cta">Únete</span><span class="m-ghost">Ver demo</span></div>
      </div>`
    ),

  analytics: () =>
    phone(
      `<div class="m-analytics">
        <small>Este mes</small>
        <div class="m-ring m-ring--big" style="--v:82"><span>82%</span></div>
        <p>Resueltas por IA</p>
        <ul>
          <li><span>Citas agendadas</span><b>1,204</b></li>
          <li><span>Tiempo de respuesta</span><b>8 s</b></li>
          <li><span>Escaladas</span><b>18%</b></li>
        </ul>
      </div>`
    ),

  kanban: () =>
    browser(
      'crm.aiconsulting.pe/pipeline',
      `<div class="m-kanban">
        ${['Nuevo', 'Calificado', 'Propuesta', 'Cierre']
          .map(
            (col, c) => `<div class="m-col"><small>${col}</small>${Array.from({ length: 3 - (c % 2) }, (_, k) => `<div class="m-card${c === 1 && k === 0 ? ' m-card--hot' : ''}">${lines(2)}<em>${['IA 94', 'IA 81', 'IA 67'][k]}</em></div>`).join('')}</div>`
          )
          .join('')}
      </div>`
    ),
};

export const renderScreen = (type) => (templates[type] ? templates[type]() : '');

export const renderImage = (src, alt) => `<div class="screen screen--image"><img src="${src}" alt="${alt}" loading="lazy" decoding="async" /></div>`;
