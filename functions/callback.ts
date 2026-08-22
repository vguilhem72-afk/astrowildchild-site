// Cloudflare Pages Function — OAuth callback for Sveltia CMS. See functions/auth.ts.
//
// GitHub redirects here with a `code` after the user approves the app. We exchange
// that code for an access token server-side (needs the client secret, never exposed
// to the browser), then hand the token to the CMS popup via postMessage.

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

const outputHTML = ({ token, error }: { token?: string; error?: string }) => {
  const state = error ? 'error' : 'success';
  const content = error ? { provider: 'github', error } : { provider: 'github', token };
  const payload = JSON.stringify(content).replaceAll('<', '\\u003c');

  return new Response(
    `<!doctype html><html><body><script>
      (() => {
        window.addEventListener('message', ({ data, origin }) => {
          if (data !== 'authorizing:github') return;
          window.opener?.postMessage('authorization:github:${state}:${payload}', origin);
        });
        window.opener?.postMessage('authorizing:github', '*');
      })();
    </script></body></html>`,
    {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Set-Cookie': 'csrf-token=deleted; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure',
      },
    },
  );
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookie = request.headers.get('Cookie') ?? '';
  const match = cookie.match(/\bcsrf-token=([a-z-]+?)_([0-9a-f]{32})\b/);
  const [, provider, csrfToken] = match ?? [];

  if (provider !== 'github') {
    return outputHTML({ error: 'Your Git backend is not supported by the authenticator.' });
  }

  if (!code || !state) {
    return outputHTML({ error: 'Failed to receive an authorization code. Please try again later.' });
  }

  if (!csrfToken || state !== csrfToken) {
    return outputHTML({ error: 'Potential CSRF attack detected. Authentication flow aborted.' });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return outputHTML({ error: 'OAuth app client ID or secret is not configured.' });
  }

  let response: Response;

  try {
    response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
      }),
    });
  } catch {
    return outputHTML({ error: 'Failed to request an access token. Please try again later.' });
  }

  let token = '';
  let error = '';

  try {
    ({ access_token: token, error } = await response.json());
  } catch {
    return outputHTML({ error: 'Server responded with malformed data. Please try again later.' });
  }

  return outputHTML({ token, error });
};
