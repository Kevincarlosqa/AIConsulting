// Serverless function (Vercel) that receives the contact form and emails it through Mailgun.
// The Mailgun key lives only here, never in the browser bundle.
const {
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  MAILGUN_API_BASE = 'https://api.mailgun.net',
  CONTACT_TO = 'sami@andesintelligence.com.pe,kevincarlosqa@gmail.com',
  CONTACT_FROM,
  SITE_URL = 'https://andesintelligence.com.pe',
} = process.env;

const escape = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const clean = (value, max = 200) => String(value ?? '').trim().slice(0, max);

const row = (label, value) => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #ece9e2;width:150px;vertical-align:top;color:#6b6a65;font-size:13px;text-transform:uppercase;letter-spacing:.06em;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #ece9e2;vertical-align:top;color:#16171a;font-size:15px;">${value}</td>
  </tr>`;

const renderHtml = (lead) => `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#f5f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.06);">
        <tr>
          <td style="background:#0e0f11;padding:28px 32px;border-bottom:3px solid #c9a45c;">
            <img src="${SITE_URL}/logo-oscuro-web.png" alt="Andes Intelligence" width="220" style="display:block;width:220px;max-width:100%;height:auto;border:0;" />
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 4px;color:#9c7c3f;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;">Nuevo contacto desde la web</p>
            <h1 style="margin:0 0 24px;color:#16171a;font-size:22px;line-height:1.3;">${escape(lead.nombre)} quiere hablar con ustedes</h1>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${row('Nombre', escape(lead.nombre))}
              ${row('Correo', `<a href="mailto:${escape(lead.email)}" style="color:#9c7c3f;text-decoration:none;">${escape(lead.email)}</a>`)}
              ${row('Empresa', escape(lead.empresa) || '—')}
              ${row('Servicios', escape(lead.servicios) || '—')}
              ${row('Presupuesto', escape(lead.presupuesto) || '—')}
            </table>
            <p style="margin:28px 0 8px;color:#6b6a65;font-size:13px;text-transform:uppercase;letter-spacing:.06em;">Mensaje</p>
            <div style="background:#f5f3ee;border-left:3px solid #c9a45c;border-radius:6px;padding:16px 18px;color:#16171a;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escape(lead.mensaje)}</div>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
              <tr><td style="background:#c9a45c;border-radius:8px;">
                <a href="mailto:${escape(lead.email)}?subject=${encodeURIComponent('Re: tu proyecto con Andes Intelligence')}" style="display:inline-block;padding:12px 22px;color:#0e0f11;font-size:15px;font-weight:600;text-decoration:none;">Responder a ${escape(lead.nombre.split(' ')[0])}</a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px;background:#fbfaf7;border-top:1px solid #ece9e2;color:#82817d;font-size:12px;line-height:1.5;">
            El cliente aceptó la política de privacidad · Enviado desde <a href="${SITE_URL}" style="color:#9c7c3f;text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, '')}</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const renderText = (lead) =>
  [
    'Nuevo contacto desde la web',
    '',
    `Nombre: ${lead.nombre}`,
    `Correo: ${lead.email}`,
    `Empresa: ${lead.empresa || '—'}`,
    `Servicios: ${lead.servicios || '—'}`,
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
    servicios: (Array.isArray(body.servicios) ? body.servicios : []).map((s) => clean(s, 60)).join(', '),
    presupuesto: clean(body.presupuesto, 60),
    mensaje: clean(body.mensaje, 5000),
  };

  if (!lead.nombre || !lead.mensaje || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || body.consentimiento !== true) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const form = new URLSearchParams({
    from: CONTACT_FROM || `Web Andes Intelligence <web@${MAILGUN_DOMAIN}>`,
    to: CONTACT_TO,
    subject: `Nuevo contacto: ${lead.nombre}${lead.empresa ? ` (${lead.empresa})` : ''}`,
    text: renderText(lead),
    html: renderHtml(lead),
    'h:Reply-To': `"${lead.nombre.replace(/[<>"\\\r\n]/g, '')}" <${lead.email}>`,
  });

  const response = await fetch(`${MAILGUN_API_BASE}/v3/${MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}` },
    body: form,
  });

  if (!response.ok) {
    console.error('Mailgun', response.status, await response.text());
    return res.status(502).json({ error: 'No se pudo enviar el correo' });
  }
  return res.status(200).json({ ok: true });
}
