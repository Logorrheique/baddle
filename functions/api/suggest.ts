/**
 * Cloudflare Pages Function — POST /api/suggest
 *
 * Accepts user suggestions (new player, correction, bug) and opens a GitHub
 * issue on the configured repo. Validated via Cloudflare Turnstile.
 *
 * Required environment variables (Cloudflare Pages → Settings → Environment):
 *   GITHUB_TOKEN     PAT with `issues:write` on the target repo
 *   GITHUB_OWNER     e.g. "Logorrheique"
 *   GITHUB_REPO      e.g. "baddle"
 *   TURNSTILE_SECRET secret site key from Cloudflare Turnstile
 */

interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  TURNSTILE_SECRET: string;
}

type SuggestionType = 'new-player' | 'correction' | 'bug';

interface BasePayload {
  type: SuggestionType;
  turnstileToken: string;
}

interface NewPlayerPayload extends BasePayload {
  type: 'new-player';
  name: string;
  wikiUrl?: string;
  gender: 'H' | 'F';
  discipline: 'Simple' | 'Double' | 'Double mixte';
  country: string;
  notes?: string;
}

interface CorrectionPayload extends BasePayload {
  type: 'correction';
  playerName: string;
  field: string;
  newValue: string;
  source?: string;
  notes?: string;
}

interface BugPayload extends BasePayload {
  type: 'bug';
  title: string;
  description: string;
  url?: string;
}

type Payload = NewPlayerPayload | CorrectionPayload | BugPayload;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const data = await res.json() as { success: boolean };
  return data.success === true;
}

function escape(v: string): string {
  return v.replace(/[<>]/g, c => (c === '<' ? '&lt;' : '&gt;'));
}

function buildIssue(p: Payload): { title: string; body: string; labels: string[] } {
  if (p.type === 'new-player') {
    return {
      title: `[Suggestion] New player: ${escape(p.name)}`,
      labels: ['suggestion', 'new-player'],
      body: [
        '## New player suggestion',
        '',
        `- **Name** : ${escape(p.name)}`,
        `- **Country** : ${escape(p.country)}`,
        `- **Gender** : ${p.gender}`,
        `- **Discipline** : ${p.discipline}`,
        p.wikiUrl ? `- **Wikipedia** : ${escape(p.wikiUrl)}` : '',
        '',
        p.notes ? '### Notes\n\n' + escape(p.notes) : '',
        '',
        '_Submitted via in-app form._',
      ].filter(Boolean).join('\n'),
    };
  }
  if (p.type === 'correction') {
    return {
      title: `[Correction] ${escape(p.playerName)} — ${escape(p.field)}`,
      labels: ['suggestion', 'correction'],
      body: [
        '## Data correction',
        '',
        `- **Player** : ${escape(p.playerName)}`,
        `- **Field** : ${escape(p.field)}`,
        `- **Proposed value** : ${escape(p.newValue)}`,
        p.source ? `- **Source** : ${escape(p.source)}` : '',
        '',
        p.notes ? '### Notes\n\n' + escape(p.notes) : '',
        '',
        '_Submitted via in-app form._',
      ].filter(Boolean).join('\n'),
    };
  }
  // bug
  return {
    title: `[Bug] ${escape(p.title)}`,
    labels: ['suggestion', 'bug'],
    body: [
      '## Bug report',
      '',
      escape(p.description),
      '',
      p.url ? `- **URL/Context** : ${escape(p.url)}` : '',
      '',
      '_Submitted via in-app form._',
    ].filter(Boolean).join('\n'),
  };
}

function validate(p: Payload): string | null {
  if (!p.turnstileToken || typeof p.turnstileToken !== 'string') return 'Missing Turnstile token';
  if (p.type === 'new-player') {
    if (!p.name || p.name.length < 2 || p.name.length > 80) return 'Invalid name';
    if (!p.country || p.country.length > 60) return 'Invalid country';
    if (!['H', 'F'].includes(p.gender)) return 'Invalid gender';
    if (!['Simple', 'Double', 'Double mixte'].includes(p.discipline)) return 'Invalid discipline';
    if (p.wikiUrl && !p.wikiUrl.startsWith('https://')) return 'Wikipedia URL must be HTTPS';
    if (p.notes && p.notes.length > 1000) return 'Notes too long';
    return null;
  }
  if (p.type === 'correction') {
    if (!p.playerName || p.playerName.length > 80) return 'Invalid player name';
    if (!p.field || p.field.length > 40) return 'Invalid field';
    if (!p.newValue || p.newValue.length > 200) return 'Invalid value';
    if (p.notes && p.notes.length > 1000) return 'Notes too long';
    return null;
  }
  if (p.type === 'bug') {
    if (!p.title || p.title.length < 4 || p.title.length > 120) return 'Invalid title';
    if (!p.description || p.description.length < 8 || p.description.length > 2000) return 'Invalid description';
    return null;
  }
  return 'Unknown suggestion type';
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: cors });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let payload: Payload;
  try {
    payload = await request.json() as Payload;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const invalid = validate(payload);
  if (invalid) return json({ error: invalid }, 400);

  const ip = request.headers.get('CF-Connecting-IP');
  const turnstileOk = await verifyTurnstile(payload.turnstileToken, env.TURNSTILE_SECRET, ip);
  if (!turnstileOk) return json({ error: 'Captcha verification failed' }, 403);

  const issue = buildIssue(payload);

  const ghRes = await fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'baddle-suggestion-bot',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(issue),
  });

  if (!ghRes.ok) {
    const text = await ghRes.text();
    return json({ error: 'GitHub API failed', details: text.slice(0, 200) }, 502);
  }

  const created = await ghRes.json() as { html_url: string; number: number };
  return json({ ok: true, issue: created.number, url: created.html_url }, 201);
};
