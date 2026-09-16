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

describe('mise à jour visuelle hors ligne', () => {
  it('pré-cache tous les nouveaux visuels utilisés par l’interface et le partage', () => {
    const worker = readFileSync('public/sw.js', 'utf8');
    for (const path of ['/assets/abbadia-night.svg', '/og.png']) {
      expect(existsSync(`public${path}`)).toBe(true);
      expect(worker).toContain(`'${path}'`);
    }
    const source = readFileSync('public/assets/abbadia-night.svg', 'utf8');
    expect(source).not.toMatch(/<(image|script|foreignObject)\b|(?:href|src)=|@import/);
  });

  it('retire uniquement les caches Abbadia obsolètes et conserve la version installée', async () => {
    const listeners: Record<string, (event: { waitUntil: (p: Promise<unknown>) => void }) => void> = {};
    const deleted: string[] = []; let claimed = false;
    runInNewContext(readFileSync('public/sw.js', 'utf8'), {
      self: { addEventListener: (name: string, listener: typeof listeners[string]) => { listeners[name] = listener; }, clients: { claim: async () => { claimed = true; } } },
      caches: { keys: async () => ['abbadie-v8', 'abbadie-v9', 'another-app-v1'], delete: async (name: string) => { deleted.push(name); } },
    });
    let activation: Promise<unknown> = Promise.resolve();
    listeners.activate({ waitUntil: promise => { activation = promise; } });
    await activation;
    expect(deleted).toEqual(['abbadie-v8']); expect(claimed).toBe(true);
  });

  it('installe le cache puis recharge page, scripts, styles et illustrations sans réseau', async () => {
    const origin = ['https:', '', 'abbadia.local'].join('/');
    type Request = string | { url: string };
    type Event = { request?: { url: string; method: string; mode: string }; waitUntil?: (p: Promise<unknown>) => void; respondWith?: (p: Promise<unknown>) => void };
    const listeners: Record<string, (event: Event) => void> = {};
    const saved = new Map<string, string>();
    let online = true; let networkCalls = 0;
    const normalize = (request: Request) => new URL(typeof request === 'string' ? request : request.url, origin).pathname;
    runInNewContext(readFileSync('public/sw.js', 'utf8'), {
      self: { location: { origin }, addEventListener: (name: string, listener: typeof listeners[string]) => { listeners[name] = listener; }, skipWaiting: async () => {} },
      URL,
      fetch: async () => { networkCalls++; if (!online) throw new Error('offline'); return { text: async () => '<script src="/assets/game.js"></script><link href="/assets/game.css">' }; },
      caches: {
        open: async () => ({ addAll: async (paths: string[]) => { for (const path of paths) saved.set(path, `local:${path}`); } }),
        match: async (request: Request) => saved.get(normalize(request)),
      },
    });
    let task: Promise<unknown> = Promise.resolve();
    listeners.install({ waitUntil: promise => { task = promise; } }); await task;
    online = false; const callsBeforeReload = networkCalls;
    for (const path of ['/', '/index.html', '/assets/game.js', '/assets/game.css', '/assets/abbadia-night.svg', '/og.png', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']) {
      listeners.fetch({ request: { url: `${origin}${path}`, method: 'GET', mode: path === '/' ? 'navigate' : 'cors' }, respondWith: promise => { task = promise; } });
      await expect(task).resolves.toBe(`local:${path}`);
    }
    expect(networkCalls).toBe(callsBeforeReload);
  });
});
