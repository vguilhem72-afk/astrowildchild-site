// Cloudflare Pages Function — OAuth entry point for Sveltia CMS.
//
// Port of the official Sveltia CMS Authenticator (github.com/sveltia/sveltia-cms-auth),
// adapted from a standalone Cloudflare Worker to a Pages Function so it runs on the
// same domain as the site (no separate worker/subdomain to manage).
//
// Flow: /admin/ -> "Log in with GitHub" -> here (/auth) -> github.com authorize
//   -> /callback -> exchanges the code for a token -> posts it back to the CMS popup.

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

const SCOPE = 'repo,user';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  if (provider !== 'github') {
    return new Response('Unsupported backend', { status: 400 });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response('OAuth app client ID or secret is not configured.', { status: 500 });
  }

  const csrfToken = crypto.randomUUID().replaceAll('-', '');

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    scope: SCOPE,
    state: csrfToken,
  });

  return new Response('', {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
      'Set-Cookie': `csrf-token=github_${csrfToken}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure`,
    },
  });
};
