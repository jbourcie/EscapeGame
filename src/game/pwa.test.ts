import { existsSync, readFileSync } from 'node:fs';
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
    const runtimeFiles = ['index.html', 'src/App.tsx', 'src/styles.css', 'src/data/missions.ts', 'public/sw.js', 'public/manifest.webmanifest'];
    for (const file of runtimeFiles) {
      const source = readFileSync(file, 'utf8');
      expect(source, file).not.toMatch(/https?:\/\//);
    }
  });
});
