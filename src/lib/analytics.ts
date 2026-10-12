/**
 * Tiny analytics shim. `track()` is always safe to call: it's a no-op until
 * a provider is configured (see components/global/Analytics.astro).
 */
type Config = { provider: 'plausible'; domain: string } | { provider: 'amplitude'; key: string };

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
    amplitude?: { track: (event: string, props?: Record<string, string>) => void; init: (key: string, opts?: object) => void };
  }
}

let config: Config | null = null;

function load(src: string, attrs: Record<string, string> = {}) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export function initAnalytics() {
  const el = document.getElementById('nn-analytics');
  if (!el) return;
  try {
    config = JSON.parse(el.textContent || 'null') as Config;
  } catch {
    return;
  }
  const start = () => {
    if (!config) return;
    if (config.provider === 'plausible') {
      load('https://plausible.io/js/script.js', { 'data-domain': config.domain, defer: '' }).catch(() => {});
    }
    if (config.provider === 'amplitude') {
      const key = config.key;
      load('https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz')
        .then(() => window.amplitude?.init(key, { autocapture: { pageViews: true } }))
        .catch(() => {});
    }
  };
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 4000 });
  else setTimeout(start, 2000);
}

export function track(event: string, props?: Record<string, string>) {
  if (!config) return;
  if (config.provider === 'plausible') window.plausible?.(event, props ? { props } : undefined);
  if (config.provider === 'amplitude') window.amplitude?.track(event, props);
}
