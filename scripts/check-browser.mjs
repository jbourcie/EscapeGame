// Test-only Playwright installation can live outside the game repository.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.GAME_URL || 'http://127.0.0.1:4173';
const output = process.env.BROWSER_SHOTS || '/tmp/abbadia-browser-shots';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE });
try {
  for (const [width, height] of [[768, 1024], [1024, 768], [390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (!r.url().startsWith(url) && !r.url().startsWith('data:')) errors.push(r.url()); });
    const button = name => page.getByRole('button', { name });
    const tap = name => button(name).tap();
    const place = async (item, target) => { await tap(item); await tap(target); };
    async function drag(item, target) {
      const source = await button(item).boundingBox(), destination = await button(target).boundingBox();
      const from = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
      const to = { x: destination.x + destination.width / 2, y: destination.y + destination.height / 2 };
      const session = await context.newCDPSession(page);
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] });
      for (let i = 1; i <= 12; i++) await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * i / 12, y: from.y + (to.y - from.y) * i / 12 }],
      });
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await session.detach();
    }
    async function capture(name) {
      await page.screenshot({ path: `${output}/${name}-${width}.png`, fullPage: true, animations: 'disabled' });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: horizontal overflow`);
    }
    await page.goto(url);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    await context.setOffline(true);
    await page.reload();
    await capture('welcome');
    await tap(/Entrer dans le laboratoire/);
    await capture('map-empty');
    for (const [id, title] of [['components', 'Composants'], ['program', 'Programme'], ['memory', 'Mémoire'], ['data', 'Données'], ['everywhere', 'Informatique partout'], ['ai', 'Intelligence artificielle']]) {
      await tap(new RegExp(title + '.*Disponible'));
      await capture(id);
      if (id === 'components') {
        await place(/Processeur/, /Conserver les fichiers après/);
        await page.getByText(/Cette zone doit plutôt conserver les fichiers/).waitFor();
        if (width >= 740) await drag(/Processeur/, /Calculer et exécuter/);
        else await place(/Processeur/, /Calculer et exécuter/);
        await page.getByLabel(/1 composant installé sur 4/).waitFor();
        await place(/Mémoire vive/, /Conserver temporairement/);
        await place(/Stockage/, /Conserver les fichiers après/);
        await place(/Alimentation/, /Fournir et distribuer/);
      } else if (id === 'program') {
        const reserve = page.locator('aside').filter({ has: page.getByRole('heading', { name: 'Blocs disponibles' }) });
        for (const [i, name] of [/Répéter 4× avancer/, /Tourner à droite/, /Répéter 4× avancer/].entries()) {
          await reserve.getByRole('button', { name }).first().tap();
          await tap(new RegExp(`Position ${i + 1}, vide`));
        }
        await tap(/Exécuter/);
      } else if (id === 'memory') {
        for (const title of ['Calcul en cours', 'Onglet actuellement ouvert', 'Position actuelle de l’automate', 'Image modifiée non enregistrée']) await place(new RegExp(title), /Table de travail/);
        for (const title of ['Photographie enregistrée', 'Carnet scientifique sauvegardé', 'Carte téléchargée', 'Archive d’observations']) await place(new RegExp(title), /Bibliothèque/);
      } else if (id === 'data') {
        await tap(/Poids 4, étoile éteinte/); await tap(/Poids 1, étoile éteinte/); await tap(/Vérifier l’observation/);
      } else if (id === 'everywhere') {
        await page.mouse.move(width - 8, height - 100); await page.mouse.wheel(0, 400);
        await page.waitForFunction(() => scrollY > 0);
        if (width >= 740) {
          const target = await page.locator('.chain-machine').boundingBox();
          assert(target.y >= 0 && target.y < height, 'targets remain visible during scrolling');
        }
        await place(/Capteur de luminosité/, /Capteur, observe/);
        await place(/Règle programmée/, /Programme, décide/);
        await place(/Lampe commandée/, /Action, agit/);
        await tap(/Tester le système/);
      } else {
        await tap(/Signal intéressant.*Toucher pour observer/);
        await tap(/Parasite.*Toucher pour observer/);
        await tap(/J’ai compris les exemples/); await tap(/Voir la comparaison/);
        for (let step = 0; step < 5; step++) await tap(/Continuer/);
        await tap(/Sur les exemples les plus proches/); await tap(/Je peux entraîner la machine/);
        await capture('ai-training');
        for (const [id, family] of [['O1', 'signal'], ['O2', 'signal'], ['O3', 'parasite'], ['O4', 'parasite']]) {
          await place(new RegExp(`${id}.*Luminosité`), new RegExp(`Famille ${family}.*déposer`));
          await tap(/Voir l’observation suivante|Découvrir si l’IA peut se tromper/);
        }
        await tap(/^IA bien entraînée$/); await tap(/Tester l’IA bien entraînée/);
        await tap(/Tester l’IA mal entraînée/); await tap(/Comparer les deux réponses/);
        await capture('ai-comparison');
        await tap(/révéler le fragment/);
      }
      await button(/Retourner au laboratoire/).waitFor();
      assert(await page.locator('.completion-panel').evaluate(e => document.activeElement === e), `${id}: completion focus`);
      const completion = await page.locator('.completion-panel').boundingBox();
      assert(completion.y < height && completion.y + completion.height > 0, `${id}: hidden fragment`);
      await capture(`${id}-complete`);
      await tap(/Retourner au laboratoire/);
      if (id === 'components') {
        await capture('map-partial');
        await page.reload(); await tap(/Entrer dans le laboratoire/);
        await button(/Composants.*Terminée.*fragment 4/).waitFor();
      }
    }
    async function finaleCapture(name) {
      await capture(`awakening-${name}`);
      if (width >= 740) {
        assert(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight), `${name}: vertical overflow`);
        for (const selector of ['.awakening-tools', '.awakening-controls', '.awakening-final-actions']) {
          const item = page.locator(selector);
          if (await item.count()) { const rect = await item.boundingBox(); assert(rect.y >= 0 && rect.y + rect.height <= height, `${name}: hidden controls`); }
        }
      }
    }
    const waitPhase = async name => page.locator(`[data-phase="${name}"]`).waitFor();
    await finaleCapture('idle'); await waitPhase('dimming'); await finaleCapture('dimming');
    await waitPhase('fragments'); await page.getByLabel('Mémoire : fragment 2 installé', {exact:true}).waitFor(); await finaleCapture('fragments');
    await waitPhase('ready'); await finaleCapture('ready');
    const control = button(/Maintiens pour activer/);
    const rect = await control.boundingBox();
    const session = await context.newCDPSession(page);
    const touch = [{x:rect.x+rect.width/2,y:rect.y+rect.height/2}];
    await session.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:touch});
    await waitPhase('charging'); await finaleCapture('charging');
    await session.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
    await waitPhase('ready');
    await page.getByText(/Encore un petit effort/).waitFor();
    await session.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:touch});
    await waitPhase('awakening');
    await session.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
    await session.detach(); await finaleCapture('awakening');
    await waitPhase('observatory'); await finaleCapture('observatory');
    await waitPhase('constellation'); await page.getByLabel('Code scientifique reconstitué').waitFor({state:'visible'}); await finaleCapture('constellation');
    assert.match(await page.getByLabel('Code scientifique reconstitué').textContent(), /472596/);
    await waitPhase('illuminated'); await finaleCapture('illuminated');
    await waitPhase('summary'); await finaleCapture('summary');
    assert.equal(await page.getByLabel('Code scientifique', {exact:true}).textContent(), '472596');
    assert.equal(await page.locator('.awakening-final-actions button').count(),3);
    await tap('Rejouer le réveil'); await waitPhase('idle'); await tap('Passer'); await waitPhase('summary');
    await tap('Revoir une mission'); await button(/Données.*Terminée.*fragment 5/).waitFor();
    await page.reload(); await tap(/Entrer dans le laboratoire/); await button(/Le redémarrage est prêt/).waitFor();
    assert.equal(await page.locator('[data-phase]').count(),0);
    await page.emulateMedia({ reducedMotion:'reduce' });
    await tap(/Le redémarrage est prêt/);
    for (let i=0;i<8;i++) await tap('Continuer le réveil');
    await tap('Activer sans maintien');
    for (let i=0;i<4;i++) await tap('Continuer le réveil');
    await waitPhase('summary'); await finaleCapture('reduced-summary');
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}×${height}: six missions offline, fragments, reload, finale, touch selection, no horizontal overflow or browser error`);
    await context.close();
  }
} finally { await browser.close(); }
