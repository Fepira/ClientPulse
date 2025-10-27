export async function sendWelcomeEmail({ email, name, company }) {
  const endpoint = import.meta.env.VITE_WELCOME_EMAIL_ENDPOINT;
  const apiKey = import.meta.env.VITE_EMAIL_API_KEY;
  if (!endpoint) {
    console.info('[email] VITE_WELCOME_EMAIL_ENDPOINT no configurado. Omite envío.');
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ email, name, company }),
    });
    const ok = res.ok;
    if (!ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return { ok: true };
  } catch (err) {
    console.error('[email] Error enviando bienvenida:', err);
    return { ok: false, error: err };
  }
}

export async function sendPasswordRecoveryEmail({ email }) {
  const endpoint = import.meta.env.VITE_PASSWORD_RECOVERY_EMAIL_ENDPOINT;
  const apiKey = import.meta.env.VITE_EMAIL_API_KEY;
  if (!endpoint) {
    console.info('[email] VITE_PASSWORD_RECOVERY_EMAIL_ENDPOINT no configurado. Omite envío.');
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ email }),
    });
    const ok = res.ok;
    if (!ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return { ok: true };
  } catch (err) {
    console.error('[email] Error enviando recuperación:', err);
    return { ok: false, error: err };
  }
}