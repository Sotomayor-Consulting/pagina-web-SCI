import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const A = "../src/pages/leads-landing/abrir-llc-primera-vez/index.html";
const B = "../src/pages/leads-landing/corregir-llc-existente/index.html";
const read = (rel) => readFile(new URL(rel, import.meta.url), "utf8");
const a = await read(A);
const b = await read(B);

for (const [name, html, verb] of [["A", a, "asesoría"], ["B", b, "revisión"]]) {
  // Header en estilo ghost (no compite con el form del hero)
  assert.match(html, /data-cta="header">[^<]*<\/a>/, `${name}: header CTA existe`);
  assert.match(html, /class="btn btn--ghost btn--sm" href="#agendar" data-cta="header"/, `${name}: header CTA es ghost`);

  // CTA de salto en el hero, oculto por defecto y visible en movil
  assert.match(html, /class="btn btn--primary hero-jump" href="#agendar" data-cta="hero-jump"/, `${name}: hero-jump CTA presente`);
  assert.match(html, /\.hero-jump\{display:none\}/, `${name}: hero-jump oculto por defecto`);
  assert.match(html, /@media \(max-width:900px\)\{[\s\S]*?\.hero-jump\{display:flex/, `${name}: hero-jump visible en movil`);
  assert.match(html, /\.hero-obj \.hide-sm\{display:none\}/, `${name}: chips reducidos en movil`);
  assert.ok((html.match(/<div class="hero-obj[\s\S]*?<\/div>/)[0].match(/class="hide-sm"/g) || []).length === 2, `${name}: 2 chips marcados hide-sm`);

  // CTA de body dorados a #agendar: exactamente 5 (fit/cases, pain, meeting, faq, final)
  const goldBody = [...html.matchAll(/class="btn btn--primary"[^>]*href="#agendar"[^>]*data-cta="(fit|cases|pain|meeting|faq|final)"/g)].map(m => m[1]);
  assert.equal(goldBody.length, 5, `${name}: 5 CTAs dorados en el body (hay ${goldBody.length}: ${goldBody})`);

  // why-first ya no tiene botón; plans degradado a enlace de texto
  assert.doesNotMatch(html, /data-cta="why-first"/, `${name}: se quitó el CTA de why-first`);
  assert.doesNotMatch(html, /class="btn btn--primary"[^>]*data-cta="plans"/, `${name}: plans ya no es botón dorado`);
  assert.match(html, /data-cta="plans"[^>]*>Agendar (asesoría|revisión) gratis →<\/a>/, `${name}: plans es enlace de texto`);

  // Etiqueta unificada en los CTAs de body
  const bodyLabels = [...html.matchAll(/data-cta="(fit|cases|pain|meeting|faq|final)">([^<]+)</g)].map(m => m[2]);
  assert.ok(bodyLabels.every(l => l === `Agendar ${verb} gratis`), `${name}: etiquetas unificadas (${[...new Set(bodyLabels)]})`);

  // Focus del primer campo vacío al pulsar un CTA de salto
  assert.match(html, /el\.focus\(\{ preventScroll: true \}\)/, `${name}: enfoca el primer campo al saltar al form`);
}

console.log("landing CTA: todas las aserciones pasaron");
