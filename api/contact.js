// Serverless function (Vercel) that receives the contact form and emails it through Mailgun.
// The Mailgun key lives only here, never in the browser bundle.
const {
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN = 'sandbox69ac2f66be574b86aec61874bdf9a22a.mailgun.org',
  MAILGUN_API_BASE = 'https://api.mailgun.net',
  CONTACT_TO = 'sami@andesintelligence.io,kevincarlosqa@gmail.com',
  CONTACT_FROM,
  VERCEL_PROJECT_PRODUCTION_URL,
} = process.env;

const SITE_URL =
  process.env.SITE_URL || (VERCEL_PROJECT_PRODUCTION_URL ? `https://${VERCEL_PROJECT_PRODUCTION_URL}` : 'https://andesintelligence.com.pe');

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

const escape = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const clean = (value, max = 200) => String(value ?? '').trim().slice(0, max);

const label = (text) =>
  `<p style="margin:0 0 6px;color:#71717a;font-size:12px;font-weight:500;letter-spacing:.02em;">${text}</p>`;

const detail = (title, value) => `
  <td width="50%" valign="top" class="col" style="padding:0 6px 12px;">
    <div style="border:1px solid #ececef;border-radius:12px;padding:14px 16px;">
      ${label(title)}
      <p style="margin:0;color:#18181b;font-size:15px;font-weight:500;line-height:1.4;word-break:break-word;">${value}</p>
    </div>
  </td>`;

const chips = (items) =>
  items.length
    ? items
        .map(
          (item) =>
            `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 11px;border-radius:999px;background:#f7f1e4;color:#7a5c24;font-size:13px;font-weight:500;">${escape(item)}</span>`,
        )
        .join('')
    : '<span style="color:#a1a1aa;font-size:14px;">No indicó</span>';

const renderHtml = (lead, receivedAt) => {
  const firstName = escape(lead.nombre.split(' ')[0]);
  const email = escape(lead.email);
  const replyHref = `mailto:${email}?subject=${encodeURIComponent('Re: tu proyecto con Andes Intelligence')}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Nuevo contacto</title>
  <style>
    @media (max-width: 520px) {
      .outer { padding: 16px 8px !important; }
      .pad { padding-left: 20px !important; padding-right: 20px !important; }
      .grid { padding-left: 14px !important; padding-right: 14px !important; }
      .col { display: block !important; width: 100% !important; box-sizing: border-box; }
      .date { display: block !important; text-align: left !important; padding-top: 10px; }
      .logo { width: 140px !important; }
      .title { font-size: 22px !important; }
      .cta, .cta a { display: block !important; text-align: center; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:${FONT};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escape(lead.nombre)}${lead.empresa ? ` de ${escape(lead.empresa)}` : ''} escribió desde la web: ${escape(lead.mensaje.slice(0, 90))}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
    <tr><td align="center" class="outer" style="padding:40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

        <tr><td style="background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="height:4px;background:#c9a45c;line-height:4px;font-size:0;">&nbsp;</td></tr>

            <tr><td class="pad" style="padding:28px 36px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td valign="middle" class="col"><img src="${SITE_URL}/logo-claro-web.png" alt="Andes Intelligence" class="logo" width="168" style="display:block;width:168px;height:auto;border:0;" /></td>
                <td valign="middle" align="right" class="col date" style="color:#a1a1aa;font-size:12px;">${receivedAt}</td>
              </tr></table>
            </td></tr>

            <tr><td class="pad" style="padding:8px 36px 0;">
              <span style="display:inline-block;padding:5px 12px;border-radius:999px;background:#ecfdf3;color:#067647;font-size:12px;font-weight:600;">● Nuevo lead</span>
              <h1 class="title" style="margin:16px 0 6px;color:#18181b;font-size:26px;font-weight:700;line-height:1.25;letter-spacing:-.02em;">${escape(lead.nombre)}</h1>
              <p style="margin:0;color:#52525b;font-size:15px;line-height:1.5;">${lead.empresa ? `${escape(lead.empresa)} · ` : ''}<a href="mailto:${email}" style="color:#52525b;text-decoration:none;">${email}</a></p>
            </td></tr>

            <tr><td class="grid" style="padding:28px 30px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>${detail('Empresa', escape(lead.empresa) || '<span style="color:#a1a1aa;font-weight:400;">No indicó</span>')}${detail('Presupuesto', escape(lead.presupuesto) || '<span style="color:#a1a1aa;font-weight:400;">No indicó</span>')}</tr>
              </table>
            </td></tr>

            <tr><td class="pad" style="padding:8px 36px 0;">
              ${label('Servicios de interés')}
              <div style="padding-top:2px;">${chips(lead.servicios)}</div>
            </td></tr>

            <tr><td class="pad" style="padding:22px 36px 0;">
              ${label('Mensaje')}
              <div style="background:#fafafa;border:1px solid #f0f0f2;border-radius:12px;padding:18px 20px;color:#27272a;font-size:15px;line-height:1.7;white-space:pre-wrap;">${escape(lead.mensaje)}</div>
            </td></tr>

            <tr><td class="pad" style="padding:28px 36px 36px;">
              <table role="presentation" class="cta" cellpadding="0" cellspacing="0"><tr>
                <td style="background:#18181b;border-radius:10px;">
                  <a href="${replyHref}" style="display:inline-block;padding:13px 24px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Responder a ${firstName} &rarr;</a>
                </td>
              </tr></table>
              <p style="margin:14px 0 0;color:#a1a1aa;font-size:13px;">También puedes responder directamente a este correo.</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td align="center" style="padding:20px 24px 0;color:#a1a1aa;font-size:12px;line-height:1.6;">
          Recibido desde el formulario de <a href="${SITE_URL}" style="color:#71717a;text-decoration:underline;">${SITE_URL.replace(/^https?:\/\//, '')}</a><br />
          El cliente aceptó la política de privacidad.
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

const renderText = (lead) =>
  [
    'Nuevo contacto desde la web',
    '',
    `Nombre: ${lead.nombre}`,
    `Correo: ${lead.email}`,
    `Empresa: ${lead.empresa || '—'}`,
    `Servicios: ${lead.servicios.join(', ') || '—'}`,
    `Presupuesto: ${lead.presupuesto || '—'}`,
    '',
    lead.mensaje,
  ].join('\n');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    return res.status(500).json({ error: 'Mailgun no está configurado' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  // Bots fill the hidden field; pretend it worked so they don't retry
  if (body.botcheck) return res.status(200).json({ ok: true });

  const lead = {
    nombre: clean(body.nombre, 120),
    email: clean(body.email, 200),
    empresa: clean(body.empresa, 160),
    servicios: (Array.isArray(body.servicios) ? body.servicios : []).map((s) => clean(s, 60)).filter(Boolean),
    presupuesto: clean(body.presupuesto, 60),
    mensaje: clean(body.mensaje, 5000),
  };

  if (!lead.nombre || !lead.mensaje || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || body.consentimiento !== true) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const receivedAt = new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Lima',
  }).format(new Date());

  const message = {
    from: CONTACT_FROM || `Andes Intelligence Web <postmaster@${MAILGUN_DOMAIN}>`,
    subject: `Nuevo contacto: ${lead.nombre}${lead.empresa ? ` · ${lead.empresa}` : ''}`,
    text: renderText(lead),
    html: renderHtml(lead, receivedAt),
    'h:Reply-To': `"${lead.nombre.replace(/[<>"\\\r\n]/g, '')}" <${lead.email}>`,
  };

  // One message per recipient: Mailgun rejects the whole message if any address is refused
  // (e.g. not yet an authorized recipient on a sandbox domain), so the others still get theirs
  const recipients = CONTACT_TO.split(',').map((to) => to.trim()).filter(Boolean);
  const results = await Promise.all(
    recipients.map(async (to) => {
      const response = await fetch(`${MAILGUN_API_BASE}/v3/${MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: { Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}` },
        body: new URLSearchParams({ ...message, to }),
      });
      if (!response.ok) console.error('Mailgun', to, response.status, await response.text());
      return response.ok;
    }),
  );

  if (!results.some(Boolean)) return res.status(502).json({ error: 'No se pudo enviar el correo' });
  return res.status(200).json({ ok: true });
}
