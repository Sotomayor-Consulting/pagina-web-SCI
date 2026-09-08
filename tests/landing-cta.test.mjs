import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const A = "../src/pages/leads-landing/abrir-llc-primera-vez/index.html";
const B = "../src/pages/leads-landing/corregir-llc-existente/index.html";
const read = (rel) => readFile(new URL(rel, import.meta.url), "utf8");
const a = await read(A);
const b = await read(B);

for (const [name, html, verb] of [["A", a, "asesoría"], ["B", b, "revisión"]]) {
  const heroBlock = html.match(/<section class="hero">[\s\S]*?\n  <\/section>/)[0];

  // Header en estilo ghost
  assert.match(html, /class="btn btn--ghost btn--sm" href="#agendar" data-cta="header"/, `${name}: header CTA es ghost`);

  // Modelo VSL: el hero NO lleva el formulario; va en la sección .agenda-final al final
  assert.doesNotMatch(heroBlock, /id="book-step-form"/, `${name}: el form NO está en el hero`);
  assert.match(html, /<section class="agenda-final" id="agendar">[\s\S]*?id="book-step-form"/, `${name}: el form vive dentro de .agenda-final`);
  assert.doesNotMatch(html, /<section class="final">/, `${name}: la vieja sección .final se reemplazó`);

  // CTA principal del hero: hero-jump, ahora visible siempre (no display:none)
  assert.match(html, /class="btn btn--primary hero-jump" href="#agendar" data-cta="hero-jump"/, `${name}: hero-jump presente`);
  assert.match(html, /\.hero-jump\{display:inline-flex/, `${name}: hero-jump visible por defecto`);
  assert.match(html, /@media \(max-width:900px\)\{[\s\S]*?\.hero-jump\{width:100%/, `${name}: hero-jump full-width en movil`);
  assert.ok((html.match(/<div class="hero-obj[\s\S]*?<\/div>/)[0].match(/class="hide-sm"/g) || []).length === 2, `${name}: 2 chips marcados hide-sm`);

  // CTA de body dorados a #agendar: 4 (fit/cases, pain, meeting, faq) — sin "final"
  const goldBody = [...html.matchAll(/class="btn btn--primary"[^>]*href="#agendar"[^>]*data-cta="(fit|cases|pain|meeting|faq)"/g)].map(m => m[1]);
  assert.equal(goldBody.length, 4, `${name}: 4 CTAs dorados en el body (hay ${goldBody.length}: ${goldBody})`);
  assert.doesNotMatch(html, /data-cta="why-first"/, `${name}: se quitó el CTA de why-first`);
  assert.doesNotMatch(html, /class="btn btn--primary"[^>]*data-cta="plans"/, `${name}: plans ya no es botón dorado`);

  // Etiqueta unificada en los CTAs de body
  const bodyLabels = [...html.matchAll(/data-cta="(fit|cases|pain|meeting|faq)">([^<]+)</g)].map(m => m[2]);
  assert.ok(bodyLabels.length && bodyLabels.every(l => l === `Agendar ${verb} gratis`), `${name}: etiquetas unificadas (${[...new Set(bodyLabels)]})`);

  // Formulario: un solo botón de envío (se quitaron more_info / not_now)
  assert.match(html, /<button class="btn btn--primary" type="submit" id="lead-submit">Agendar (mi asesoría|mi revisión) gratis<\/button>/, `${name}: submit único`);
  assert.doesNotMatch(html, /name="intent"/, `${name}: sin botones de intención`);
  assert.doesNotMatch(html, /id="cal-reveal"/, `${name}: sin paso de revelar calendario`);
}

// A conserva el video de bienvenida en el hero; B no
const heroA = a.match(/<section class="hero">[\s\S]*?\n  <\/section>/)[0];
assert.match(heroA, /class="vmsg-frame"/, "A: video de bienvenida en el hero");
assert.doesNotMatch(b, /vmsg-frame/, "B: sin video (mismatch de mensaje para 'ya tiene LLC')");

console.log("landing CTA: todas las aserciones pasaron");
