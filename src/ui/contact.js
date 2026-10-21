// Sends the form to VITE_CONTACT_ENDPOINT (Formspree, a serverless function, etc.).
// Without an endpoint it falls back to opening the visitor's mail client.
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT;
const EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'hola@aiconsulting.pe';

export function initContact() {
  const form = document.querySelector('[data-contact]');
  if (!form) return;

  const status = form.querySelector('[data-status]');
  const submit = form.querySelector('[type="submit"]');

  const setStatus = (message, tone = '') => {
    status.textContent = message;
    status.dataset.tone = tone;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const payload = {
      nombre: data.get('nombre'),
      email: data.get('email'),
      empresa: data.get('empresa'),
      servicios: data.getAll('servicios'),
      presupuesto: data.get('presupuesto'),
      mensaje: data.get('mensaje'),
      consentimiento: data.get('consentimiento') === 'si',
    };

    if (!ENDPOINT) {
      const body = [
        `Nombre: ${payload.nombre}`,
        `Empresa: ${payload.empresa || '—'}`,
        `Servicios: ${payload.servicios.join(', ') || '—'}`,
        `Presupuesto: ${payload.presupuesto || '—'}`,
        '',
        payload.mensaje,
      ].join('\n');
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Proyecto — ${payload.nombre}`)}&body=${encodeURIComponent(body)}`;
      setStatus('Abrimos tu correo con el mensaje listo para enviar.', 'ok');
      return;
    }

    submit.disabled = true;
    setStatus('Enviando…');

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      setStatus('¡Gracias! Te respondemos en menos de 24 horas.', 'ok');
    } catch {
      setStatus(`No pudimos enviar el mensaje. Escríbenos a ${EMAIL}.`, 'error');
    } finally {
      submit.disabled = false;
    }
  });
}
