import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

describe('ressources hors ligne', () => {
  it('déclare un manifeste autonome et ses deux icônes locales', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons).toHaveLength(2);
    for (const icon of manifest.icons) expect(existsSync(`public${icon.src}`)).toBe(true);
  });

  it('pré-cache la coque et toutes les icônes déclarées', () => {
    const worker = readFileSync('public/sw.js', 'utf8');
    expect(worker).toContain("'/index.html'");
    expect(worker).toContain("'/manifest.webmanifest'");
    expect(worker).toContain("'/icons/icon-192.png'");
    expect(worker).toContain("'/icons/icon-512.png'");
    expect(worker).toContain("caches.match(event.request)");
  });

  it('ne charge aucune ressource distante dans l’application', () => {
    const runtimeFiles = ['index.html', ...readdirSync('src', { recursive: true, encoding: 'utf8' }).filter((file) => /\.(ts|tsx|css)$/.test(file)).map((file) => `src/${file}`), 'public/sw.js', 'public/manifest.webmanifest'];
    for (const file of runtimeFiles) {
      const source = readFileSync(file, 'utf8');
      expect(source, file).not.toMatch(/https?:\/\//);
    }
  });

  it('met en cache les scripts et styles du build dès la première installation', async () => {
    const listeners = new Map<string, (event: { waitUntil: (promise: Promise<unknown>) => void }) => void>();
    const added: string[] = [];
    const html = '<link href="/assets/index-test.css" rel="stylesheet"><script src="/assets/index-test.js"></script>';
    runInNewContext(readFileSync('public/sw.js', 'utf8'), {
      self: { addEventListener: (name: string, listener: (event: { waitUntil: (promise: Promise<unknown>) => void }) => void) => listeners.set(name, listener), skipWaiting: () => Promise.resolve() },
      fetch: async () => ({ text: async () => html }),
      caches: { open: async () => ({ addAll: async (paths: string[]) => { added.push(...paths); } }) },
    });
    let installation: Promise<unknown> = Promise.resolve();
    listeners.get('install')!({ waitUntil: (promise) => { installation = promise; } });
    await installation;
    expect(added).toContain('/index.html');
    expect(added).toContain('/assets/index-test.css');
    expect(added).toContain('/assets/index-test.js');
  });

  it('sert la page locale mise en cache lors d’une navigation hors ligne', async () => {
    const listeners = new Map<string, (event: { request: { method: string; url: string; mode: string }; respondWith: (promise: Promise<unknown>) => void }) => void>();
    const fallback = { offline: true };
    const localOrigin = ['https:', '', 'local.test'].join('/');
    runInNewContext(readFileSync('public/sw.js', 'utf8'), {
      self: { location: { origin: localOrigin }, addEventListener: (name: string, listener: (event: { request: { method: string; url: string; mode: string }; respondWith: (promise: Promise<unknown>) => void }) => void) => listeners.set(name, listener) },
      URL,
      fetch: async () => { throw new Error('hors ligne'); },
      caches: { match: async (request: string | { url: string }) => request === '/index.html' ? fallback : undefined },
    });
    let response: Promise<unknown> = Promise.resolve();
    listeners.get('fetch')!({ request: { method: 'GET', url: `${localOrigin}/mission`, mode: 'navigate' }, respondWith: (promise) => { response = promise; } });
    await expect(response).resolves.toBe(fallback);
  });
});
