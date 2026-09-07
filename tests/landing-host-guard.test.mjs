import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = [
  "../src/pages/leads-landing/abrir-llc-primera-vez/index.html",
  "../src/pages/leads-landing/corregir-llc-existente/index.html",
];

// El guard que llevan las dos landings: pixeles + POST a n8n solo en *.sotomayorconsulting.com
const HOST_GUARD = /\(\^\|\\\.\)sotomayorconsulting\\\.com\$/;

for (const rel of files) {
  const html = await readFile(new URL(rel, import.meta.url), "utf8");

  // 3 sitios: pixel TikTok, pixel Meta, y la var HOST_ALLOWS_LIVE
  const hits = html.match(new RegExp(HOST_GUARD.source, "g")) || [];
  assert.ok(hits.length >= 3, `${rel}: se esperaba el guard de host en pixeles + HOST_ALLOWS_LIVE (encontrados ${hits.length})`);

  assert.match(html, /if \(!HOST_ALLOWS_LIVE\) return \{ ok: false, duplicate: false, status: "skipped_non_prod_host" \}/, `${rel}: sendLeadToWebhook debe cortar fuera de produccion`);
  assert.match(html, /if \(QA_NO_WEBHOOK \|\| !HOST_ALLOWS_LIVE \|\| !CONFIG\.tiktokCapiWebhookUrl\) return;/, `${rel}: el CAPI debe cortar fuera de produccion`);
  assert.match(html, /res\.status === "skipped_non_prod_host"/, `${rel}: la nota de desarrollo debe reconocer el estado skipped_non_prod_host`);
}

// Comportamiento del regex de host usado en las landings
const hostAllowsLive = (h) => /(^|\.)sotomayorconsulting\.com$/i.test(h);
assert.equal(hostAllowsLive("sotomayorconsulting.com"), true);
assert.equal(hostAllowsLive("www.sotomayorconsulting.com"), true);
assert.equal(hostAllowsLive("leads.sotomayorconsulting.com"), true);
assert.equal(hostAllowsLive("localhost"), false);
assert.equal(hostAllowsLive("sci-website.pages.dev"), false);
assert.equal(hostAllowsLive("evilsotomayorconsulting.com"), false, "no debe hacer match un subdominio falso pegado");

console.log("landing host guard: todas las aserciones pasaron");
