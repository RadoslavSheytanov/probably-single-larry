interface Env {
  HMAC_SECRET: string;
  GUMROAD_PERMALINK: string;
}

async function computeHMAC(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function respond(body: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '*';

    if (request.method === 'OPTIONS') {
      return respond(null, 204, origin);
    }

    if (request.method !== 'POST') {
      return respond({ error: 'Method not allowed' }, 405, origin);
    }

    let email: string, key: string;
    try {
      const body = await request.json() as { email?: string; key?: string };
      email = (body.email ?? '').toLowerCase().trim();
      key = (body.key ?? '').toUpperCase().trim();
    } catch {
      return respond({ error: 'Invalid request body.' }, 400, origin);
    }

    if (!email || !key) {
      return respond({ error: 'Email and key are required.' }, 400, origin);
    }

    // Verify with Gumroad License API
    const gumResp = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_permalink: env.GUMROAD_PERMALINK,
        license_key: key,
      }),
    });

    const gum = await gumResp.json() as {
      success: boolean;
      purchase?: { refunded?: boolean; chargebacked?: boolean };
    };

    if (!gum.success) {
      return respond({ error: 'License key not recognised. Check your purchase email.' }, 403, origin);
    }

    if (gum.purchase?.refunded || gum.purchase?.chargebacked) {
      return respond({ error: 'This license has been refunded.' }, 403, origin);
    }

    // Compute HMAC token — same secret must be in VITE_LICENSE_SALT for client verification
    const token = await computeHMAC(`${email}:${key}`, env.HMAC_SECRET);
    return respond({ token }, 200, origin);
  },
};
