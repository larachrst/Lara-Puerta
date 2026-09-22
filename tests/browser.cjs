"use strict";
const { chromium, webkit } = require("playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const http = require("node:http");
const fs = require("node:fs");
(async () => {
  const root = path.resolve(__dirname, "..");
  const server = http.createServer((req, res) => {
    const allowed = {"/": "index.html", "/index.html":"index.html", "/style.css":"style.css", "/script.js":"script.js", "/favicon.svg":"favicon.svg", "/assets/spotify.png":"assets/spotify.png", "/assets/nuestro-recuerdo.png":"assets/nuestro-recuerdo.png"};
    const file = allowed[req.url];
    if (!file) { res.writeHead(404); res.end(); return; }
    const types = {html:"text/html", css:"text/css", js:"text/javascript", svg:"image/svg+xml", png:"image/png"};
    res.setHeader("Content-Type", types[file.split(".").pop()]);
    res.end(fs.readFileSync(path.join(root,file)));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    for (const browserType of [chromium, webkit]) {
      const browser = await browserType.launch();
      try {
        for (const zone of ["America/Mexico_City", "Asia/Tokyo"]) {
          const context = await browser.newContext({timezoneId: zone});
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", error => errors.push(error.message));
          page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
          // Pausar antes de navegar: la carga de imágenes no debe avanzar el reloj de prueba.
          await page.clock.install({time: new Date("2026-08-25T20:39:00Z")});
          await page.clock.pauseAt(new Date("2026-08-25T20:40:00Z"));
          await page.goto("http://127.0.0.1:" + server.address().port);
          await page.locator(".memory-photo").scrollIntoViewIfNeeded();
          await page.locator(".memory-photo img").evaluate(img => img.decode());
          assert.equal(await page.locator(".spotify-logo").evaluate(img => img.complete && img.naturalWidth > 0), true);
          assert.equal(await page.locator("#months").innerText(), "01");
          await page.clock.runFor(2100);
          assert.equal(await page.locator("#seconds").innerText(), "02");
          for (const width of [320,375,390,430,768,1440]) {
            await page.setViewportSize({width, height:900});
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "overflow " + width);
            assert.equal(await page.locator("#playlist-link").isVisible(), true);
          }
          await page.setViewportSize({width:375, height:900});
          await page.evaluate(() => document.documentElement.style.fontSize = "200%");
          console.log("Zoom layout", await page.evaluate(() => ({width:innerWidth, scroll:document.documentElement.scrollWidth, elements:[...document.querySelectorAll("body *")].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => ({tag:el.tagName, cls:el.className, scroll:el.scrollWidth, client:el.clientWidth}))})));
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "texto al 200%");
          await page.evaluate(() => document.documentElement.style.fontSize = "");
          await page.emulateMedia({reducedMotion:"reduce"});
          assert.equal(await page.locator(".hero").evaluate(el => getComputedStyle(el).animationName), "none");
          await context.route("https://open.spotify.com/**", route => route.fulfill({status:200, contentType:"text/html", body:"Playlist destination verified"}));
          const popupPromise = page.waitForEvent("popup");
          await page.locator("#playlist-link").click();
          const popup = await popupPromise;
          await popup.waitForLoadState();
          assert.ok(popup.url().startsWith("https://open.spotify.com/playlist/5QHjeTMbXn9gg1KQ9jpVIE"));
          assert.equal(await popup.evaluate(() => window.opener === null), true);
          await popup.close();
          await page.goto(pathToFileURL(path.join(root,"index.html")).href);
          assert.equal(await page.locator("#months").innerText(), "01");
          assert.deepEqual(errors, []);
          await context.close();
        }
      } finally { await browser.close(); }
    }
    console.log("Chromium y WebKit: seis anchos, dos zonas, reloj, playlist, file://, consola y movimiento reducido correctos.");
  } finally { server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
