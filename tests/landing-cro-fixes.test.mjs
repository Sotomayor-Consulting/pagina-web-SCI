import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const A = "../src/pages/leads-landing/abrir-llc-primera-vez/index.html";
const B = "../src/pages/leads-landing/corregir-llc-existente/index.html";
const read = (rel) => readFile(new URL(rel, import.meta.url), "utf8");

const a = await read(A);
const b = await read(B);

for (const [name, html] of [["A", a], ["B", b]]) {
  // hero visible en el primer paint
  assert.match(html, /\.js \.hero \.reveal\{opacity:1/, `${name}: el hero debe quedar visible en el primer paint`);

  // hook NO pegajoso: se lee de la URL, no de sessionStorage
  assert.match(
    html,
    /var key = \(URL_PARAMS\.get\("hook"\) \|\| URL_PARAMS\.get\("utm_content"\)/,
    `${name}: applyHook debe leer los parámetros de la visita actual`,
  );
  assert.doesNotMatch(html, /sessionStorage\.setItem\("sci_attr"/, `${name}: el hook no debe persistirse en sessionStorage`);

  // paso 2: expectativa "datos ya cargados" + realce del fallback si el iframe no carga
  assert.match(html, /Tus datos ya están cargados/, `${name}: el paso 2 debe decir que los datos ya van cargados`);
  assert.match(html, /cal-fallback--urgent/, `${name}: debe realzar el enlace de respaldo si el iframe no carga`);

  // Schedule: listener acotado a formas de "reserva confirmada", ya no el regex laxo
  assert.match(html, /booking\[_-\]\?\(completed\|confirmed\|success\)/, `${name}: el listener de Schedule debe acotar a reserva confirmada`);
  assert.doesNotMatch(html, /\/book\|schedul\|complete\/i\.test\(JSON\.stringify/, `${name}: no debe quedar el matcher laxo anterior`);
}

// A: goal opcional (sin required); B: goal sigue obligatorio (preseleccionado)
assert.match(a, /<select id="f-goal" name="goal" aria-describedby="e-goal">/, "A: el select de goal no debe ser required");
assert.doesNotMatch(a, /if \(!goal\) \{ showErr\("goal", true\)/, "A: no debe validar goal como obligatorio");
assert.match(b, /<select id="f-goal" name="goal" required aria-describedby="e-goal">/, "B: goal sigue obligatorio");

// A: tira de identificación de giros
assert.match(a, /Esto es para ti si…/, "A: debe tener la tira 'Esto es para ti si…'");

console.log("landing CRO fixes: todas las aserciones pasaron");
