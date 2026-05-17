/**
 * Minimal Cloudflare Turnstile helper.
 * Lazily injects the script and renders an invisible widget that returns
 * a verification token via `getToken()`. No npm dependency.
 */

interface TurnstileRenderOptions {
  sitekey: string;
  size?: 'invisible' | 'normal' | 'compact';
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
}

interface TurnstileAPI {
  render: (el: HTMLElement, opts: TurnstileRenderOptions) => string;
  execute: (id: string) => void;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileAPI;
  }
}

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) { resolve(); return; }
    const s = document.createElement('script');
    s.src = TURNSTILE_SCRIPT;
    s.async = true;
    s.defer = true;
    s.onload = () => {
      const tick = () => {
        if (window.turnstile) resolve();
        else setTimeout(tick, 50);
      };
      tick();
    };
    s.onerror = () => reject(new Error('Failed to load Turnstile script'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Renders an invisible Turnstile widget and resolves with the verification
 * token when the challenge passes. The widget is mounted on the given host
 * element; caller is responsible for removing the host on unmount.
 */
export async function getTurnstileToken(host: HTMLElement, sitekey: string): Promise<string> {
  await loadScript();
  const api = window.turnstile!;
  return new Promise((resolve, reject) => {
    let id: string | null = null;
    id = api.render(host, {
      sitekey,
      size: 'invisible',
      callback: token => resolve(token),
      'error-callback': () => reject(new Error('Turnstile failed')),
      'expired-callback': () => reject(new Error('Turnstile expired')),
    });
    api.execute(id);
  });
}
