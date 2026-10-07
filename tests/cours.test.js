// Parcours navigateur de l'accueil et du cours 1.1.
// NODE_PATH=$(npm root -g) node --test tests/cours.test.js
const { test, before, after } = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const url = (f) => "file://" + path.join(ROOT, f);
let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser.close(); });

async function open(file, viewport = { width: 1200, height: 900 }) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(url(file));
  return { page, errors };
}

test("accueil : grilles des cours et des exercices, liens valides", async () => {
  const { page, errors } = await open("index.html");
  assert.equal(await page.locator(".cours-grid .mode-card").count(), 4);
  assert.equal(await page.locator(".cours-grid .en-edition").count(), 3);
  assert.match(await page.locator(".cours-grid .mode-card").first().innerText(), /Cours 1\.1\s+Niveau 1/);
  const hrefs = await page.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  for (const h of hrefs) assert.ok(fs.existsSync(path.join(ROOT, h.split("#")[0])), "lien cassé : " + h);
  assert.equal(await page.locator('a[href$="#examen"]').count(), 3);
  assert.equal(await page.locator('.ex-card a[href^="exercice-2-"]').count(), 4);
  assert.deepEqual(errors, []);
  await page.close();
});

test("cours 1.1 : données des 11 liaisons conformes au cours", async () => {
  const { page, errors } = await open("cours-1-1-liaisons-mecaniques.html");
  const rows = await page.evaluate(() => window.__LIAISONS__.LIAISONS.map((l) => [l.id, window.__LIAISONS__.ddl(l),
    l.mob.slice(0, 3).reduce((a, b) => a + b), l.mob.slice(3).reduce((a, b) => a + b)]));
  assert.deepEqual(rows, [
    ["encastrement", 0, 0, 0], ["pivot", 1, 0, 1], ["pivot-glissant", 2, 1, 1], ["glissiere", 1, 1, 0],
    ["appui-plan", 3, 2, 1], ["lineaire-rectiligne", 4, 2, 2], ["ponctuelle", 5, 2, 3], ["lineaire-annulaire", 4, 1, 3],
    ["rotule", 3, 0, 3], ["rotule-a-doigt", 2, 0, 2], ["helicoidale", 1, 1, 1]]);
  assert.equal(await page.locator("#recap-body tr").count(), 11);
  assert.deepEqual(errors, []);
  await page.close();
});

test("cours 1.1 : bloc animé, liaisons élémentaires, explorateur", async () => {
  const { page, errors } = await open("cours-1-1-liaisons-mecaniques.html");
  // le bloc bouge
  const before = await page.locator(".cube-body").innerHTML();
  await page.click('.cube-btns [data-m="Rz"]');
  await page.waitForTimeout(500);
  assert.notEqual(await page.locator(".cube-body").innerHTML(), before);
  assert.match(await page.locator("#cube-txt").innerText(), /Rz/);
  // liaisons élémentaires
  await page.click('.ve-cell[data-l="lineaire-annulaire"]');
  assert.match(await page.locator("#ve-out").innerText(), /Linéaire annulaire\s+4 ddl/);
  await page.click("#ve-out [data-go]");
  assert.match(await page.locator("#lx-card h3").innerText(), /Linéaire annulaire/);
  // orientation : glissière d'axe y
  await page.click('#lx-list [data-id="glissiere"]');
  await page.click('.lx-axes button:has-text("y")');
  assert.equal(await page.locator(".lx-full").innerText(), "Glissière d'axe y");
  assert.deepEqual(await page.locator("#lx-card table.mob tbody td").allInnerTexts(), ["0", "1", "0", "0", "0", "0"]);
  // devinette : tableau juste
  await page.click("#lx-guess");
  await page.click('.mob-g[data-i="1"]');
  await page.click("#lx-check");
  assert.match(await page.locator(".lx-fb").innerText(), /Bravo/);
  // devinette fausse
  await page.click('.mob-g[data-i="3"]');
  await page.click("#lx-check");
  assert.match(await page.locator(".lx-fb").innerText(), /5 cases justes sur 6/);
  // animation du schéma
  await page.click('#lx-list [data-id="pivot-glissant"]');
  await page.click(".lx-play");
  assert.ok(await page.evaluate(() => document.querySelectorAll(".lx-views .s2")[0].getAnimations().length > 0));
  // filtre du récapitulatif
  await page.click('.rc-filter [data-f="1"]');
  assert.equal(await page.locator("#recap-body tr:not([hidden])").count(), 3);
  assert.deepEqual(errors, []);
  await page.close();
});

test("cours 1.1 : jeu en dix manches et quiz à 8/8", async () => {
  const { page, errors } = await open("cours-1-1-liaisons-mecaniques.html");
  for (let i = 0; i < 10; i++) {
    await page.locator("#jeu-opts button").first().click();
    assert.equal(await page.locator("#jeu-opts button.good").count(), 1);
    await page.click("#jeu-next");
  }
  assert.ok(await page.locator("#jeu-end").isVisible());
  assert.match(await page.locator("#jeu-score").innerText(), /^\d+ \/ 10$/);
  const qs = page.locator(".quiz-q");
  const n = await qs.count();
  assert.equal(n, 8);
  const oks = await qs.evaluateAll((fs) => fs.map((f) => +f.getAttribute("data-ok")));
  assert.ok(new Set(oks).size > 1, "la bonne réponse n'est pas toujours à la même place");
  for (let i = 0; i < n; i++) await qs.nth(i).locator("input").nth(oks[i]).check();
  assert.equal(await page.locator("#qz-score").innerText(), "8 / 8");
  assert.equal(await page.locator("#qz-stars").innerText(), "★★★");
  assert.deepEqual(errors, []);
  await page.close();
});

test("pages « en cours d'édition » et affichage mobile sans défilement horizontal", async () => {
  for (const f of ["cours-1-2-liaisons-mecaniques.html", "cours-2-1-schema-cinematique.html", "cours-2-2-schema-cinematique.html"]) {
    const { page, errors } = await open(f);
    assert.match(await page.locator("#ec-t").innerText(), /En cours d'édition/);
    assert.deepEqual(errors, []);
    await page.close();
  }
  for (const f of ["index.html", "cours-1-1-liaisons-mecaniques.html"]) {
    const { page } = await open(f, { width: 420, height: 800 });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(over <= 0, f + " : défilement horizontal de " + over + " px");
    await page.close();
  }
});

for (const slug of ["eolienne", "support-smartphone", "imprimante-3d", "grue-camera"]) {
  test("exercice 2.1 " + slug + " : réponses justes = 20/20, bilan, réponse fausse pénalisée", async () => {
    const { page, errors } = await open("exercice-2-" + slug + ".html");
    const E = await page.evaluate(() => window.__ETUDES__.ETUDES.map((e) => ({ mob: e.mob, nom: e.nom, axe: e.axe, ok: e.sch.findIndex((s) => s[3]) })));
    for (const e of E) assert.equal(e.mob.length, 6);
    for (let i = 0; i < E.length; i++) {
      const e = E[i];
      // la question 3 reste verrouillée tant que 1 et 2 ne sont pas validées
      assert.ok(await page.locator(".sch-opt").first().isDisabled());
      for (let j = 0; j < 6; j++) if (e.mob[j]) await page.click(`.mob-g[data-i="${j}"]`);
      await page.check(`input[name=nom][value="${e.nom}"]`);
      await page.check(`input[name=axe][value="${e.axe}"]`);
      await page.click("#val12");
      assert.match(await page.locator(".fb.ok").first().innerText(), /Correction/);
      await page.click(`.sch-opt[data-k="${e.ok}"]`);
      await page.click(i < E.length - 1 ? "#next" : "#bilan-btn");
    }
    assert.equal(await page.locator("#sc-n").innerText(), "20 / 20");
    assert.equal(await page.locator(".graphe .gk").count(), 0);
    // une étude refaite fausse : rechargement, tableau vide et mauvais nom
    await page.reload();
    await page.check('input[name=nom][value="Ponctuelle"]');
    await page.check('input[name=axe][value="z"]');
    await page.click("#val12");
    assert.ok(await page.evaluate(() => window.__ETUDES__.note()) < 20 / E.length);
    assert.deepEqual(errors, []);
    await page.close();
  });
}
