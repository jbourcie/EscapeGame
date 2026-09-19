// Fast visual regression of the final stage. Fixtures stay outside the game code.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE});
const url=process.env.GAME_URL || 'http://127.0.0.1:4173';
const output=process.env.BROWSER_SHOTS || '/tmp/abbadia-finale-shots';
await mkdir(output,{recursive:true});
try {
 for(const [width,height] of [[768,1024],[1024,768]]) {
  const page=await browser.newPage({viewport:{width,height}});
  await page.goto(url);
  await page.evaluate(() => localStorage.setItem('abbadie-progress-v1',JSON.stringify({level:'scientist',completed:['components','program','memory','data','everywhere','ai'],fragments:{components:'4',program:'7',memory:'2',data:'5',everywhere:'9',ai:'6'}})));
  await page.reload();
  await page.clock.install(); await page.clock.pauseAt(new Date());
  const button=name=>page.getByRole('button',{name,exact:true});
  await page.getByRole('button',{name:/Entrer dans le laboratoire/}).click(); await page.getByRole('button',{name:/Le redémarrage est prêt/}).click();
  async function capture(phase) {
   assert.equal(await page.locator('[data-phase]').getAttribute('data-phase'),phase);
   assert(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight));
   await page.screenshot({path:`${output}/${phase}-${width}.png`,animations:'disabled'});
  }
  await capture('idle'); await page.clock.runFor(1200); await capture('dimming'); await page.clock.runFor(2800);
  for (let i=0;i<3;i++) { await page.clock.runFor(1000); await page.locator('.awakening-socket.is-installed').nth(i).waitFor(); } await capture('fragments');
  for (let i=3;i<6;i++) { await page.clock.runFor(1000); await page.locator('.awakening-socket.is-installed').nth(i).waitFor(); } await capture('ready');
  const modules=await page.locator('.central-machine').boundingBox(), sockets=await page.locator('.awakening-sockets').boundingBox();
  assert(modules.y+modules.height<=sockets.y,'modules and sockets overlap');
  const control=page.getByRole('button',{name:/Maintiens pour activer/}); const box=await control.boundingBox();
  assert(box.height>=64); await page.mouse.move(box.x+box.width/2,box.y+box.height/2); await page.mouse.down();
  await page.clock.runFor(1000); await capture('charging'); await page.clock.runFor(1000); await page.mouse.up(); await capture('awakening');
  await page.clock.runFor(5000); await capture('observatory'); await page.clock.runFor(5000); await capture('constellation');
  await page.clock.runFor(5000); await capture('illuminated'); await page.clock.runFor(5000); await capture('summary');
  for(const action of ['Rejouer le réveil','Revoir une mission','Accueillir une nouvelle équipe']) {const box=await button(action).boundingBox();assert(box.y+box.height<height);}
  assert.equal(await page.getByLabel('Code scientifique',{exact:true}).textContent(),'472596');
  console.log(`PASS finale ${width}×${height}: 10 phases, mouse hold, no overlap, no scrolling, 64 px control, three visible actions`);
  await page.close();
 }
}finally{await browser.close();}
