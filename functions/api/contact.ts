// Cloudflare Pages Function — endpoint contact form.
//
// Recoit un POST du formulaire de /contact, envoie via Resend a Mare.
// Deux garde-fous :
//   1. Honeypot invisible (`_website`) — si rempli, on repond 200 sans envoyer,
//      les bots croient a un succes sans polluer l'inbox.
//   2. Rate limit implicite via Cloudflare (cf-ray + IP), plus une taille de
//      message capee pour eviter les envois massifs.

interface Env {
  RESEND_API_KEY: string;
  MARE_INBOX?: string;   // defaut : mare@marepunzalan.com
}

const MAX_MESSAGE_LEN = 5000;
const MAX_NAME_LEN = 120;
const MAX_EMAIL_LEN = 200;

const escapeHtml = (s: string) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const cors = {
    'Content-Type': 'application/json',
    // Le form est meme origine (astrowildchild.com), pas besoin de CORS ouvert.
    'Access-Control-Allow-Origin': 'https://astrowildchild.com',
  };

  if (!env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'Mail service not configured.' }), {
      status: 500, headers: cors,
    });
  }

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Bad request.' }), {
      status: 400, headers: cors,
    });
  }

  // Honeypot : un champ invisible qu'aucun humain ne remplit. Un bot qui
  // remplit tous les champs se fait griller ici. On repond 200 pour ne pas
  // lui apprendre a contourner.
  if (String(data.get('_website') ?? '').trim()) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
  }

  const name = String(data.get('name') ?? '').trim().slice(0, MAX_NAME_LEN);
  const email = String(data.get('email') ?? '').trim().slice(0, MAX_EMAIL_LEN);
  const message = String(data.get('message') ?? '').trim().slice(0, MAX_MESSAGE_LEN);

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Please fill in every field.' }), {
      status: 400, headers: cors,
    });
  }

  // Validation email basique — rien de trop strict, un regex simple attrape
  // les fautes de frappe evidentes sans rejeter les adresses valides exotiques.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return new Response(JSON.stringify({ error: "That email doesn't look right." }), {
      status: 400, headers: cors,
    });
  }

  const to = env.MARE_INBOX ?? 'mare@marepunzalan.com';

  const html = `
    <div style="font-family:-apple-system,system-ui,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;">
      <p style="margin:0 0 12px;color:#666;font-size:12px;letter-spacing:.05em;text-transform:uppercase;">
        Message from astrowildchild.com/contact
      </p>
      <p style="margin:0 0 8px;"><b>${escapeHtml(name)}</b>
        &lt;<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>&gt;</p>
      <hr style="border:0;border-top:1px solid #eaeaea;margin:16px 0;">
      <div style="white-space:pre-wrap;">${escapeHtml(message)}</div>
      <hr style="border:0;border-top:1px solid #eaeaea;margin:24px 0 12px;">
      <p style="margin:0;color:#999;font-size:12px;">Reply directly to this email — it goes to ${escapeHtml(email)}.</p>
    </div>`;

  // Resend transactional API. Domaine astrowildchild.com deja verified chez
  // eux (DKIM `resend._domainkey` existe, SPF `send` pointe vers SES).
  // Le FROM DOIT etre sur le domaine verified, pas sur une adresse tierce ;
  // reply-to porte l'email du visiteur pour que Mare lui reponde en un click.
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Astro Wild Child <contact@astrowildchild.com>',
      to: [to],
      reply_to: email,
      subject: `Contact — ${name}`,
      html,
      // Fallback texte pour les clients qui n'affichent pas le HTML.
      text: `From: ${name} <${email}>\n\n${message}\n\n--\nReply directly to this email.`,
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    console.error('Resend error', resp.status, detail);
    return new Response(JSON.stringify({
      error: "Message couldn't be sent. Please try again in a moment.",
    }), { status: 502, headers: cors });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
};

// Un GET renvoie une reponse propre plutot qu'une 405 muette, ca aide au
// debug quand on tape l'URL par erreur dans le browser.
export const onRequestGet: PagesFunction = () =>
  new Response('POST only', { status: 405, headers: { 'Content-Type': 'text/plain' } });
