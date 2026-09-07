# Landings de campaña — LLC EE. UU.

Dos landings de tráfico pago (TikTok / Meta). Comparten formulario, reunión, sistema
visual y back-end; cambian el mensaje según la persona. El archivo empieza por `_`
para que Astro no lo publique como ruta.

| | Landing A | Landing B |
|---|---|---|
| Carpeta | `abrir-llc-primera-vez/` | `corregir-llc-existente/` |
| Ruta | `/leads-landing/abrir-llc-primera-vez/` | `/leads-landing/corregir-llc-existente/` |
| Persona | Emprendedor/empresario **sin LLC** — la va a abrir | Emprendedor/empresario que **ya tiene LLC** — corregir, ordenar, migrar |
| H1 | «Abre tu LLC en EE. UU. sin errores, con la estructura correcta desde el inicio» | «¿Ya tienes una LLC? Corrígela antes de que un error te cueste caro» |
| Público en el copy | e-commerce, agencias, SaaS, creadores, consultores, inversionistas (giros en **negrita** en el sub) | los mismos, **con una LLC ya abierta** |
| Form · `goal` por defecto | «Elige una opción» | «Ordenar o corregir mi LLC actual» (preseleccionado) |
| `page_name` (analítica) | `landing_abrir_llc_primera_vez` | `landing_corregir_llc_existente` |
| Enlace a la otra | Solo en el cierre de FAQ → `../corregir-llc-existente/` | Solo en el cierre de FAQ → `../abrir-llc-primera-vez/` |

`asesoria-llc-usa-diagnostico-agenda/` es la landing de producción anterior — no se toca.

## Qué comparten (idéntico)

- **Objetivo único:** cerrar la reunión de asesoría por Zoom. Un solo CTA repetido.
  El copy **no menciona duración** (ni "30 min" ni rango): posiciona la reunión como
  conversación consultiva, no llamada con cronómetro.
- **Mecanismo:** formulario de 4 campos (nombre, WhatsApp con país+bandera, correo, `goal`)
  → `POST` a `https://n8n.sotomayorconsulting.com/webhook/leads-directos-tiktok-landing`
  → n8n → Odoo (crm.lead). Luego se muestra el **calendario Zcal embebido** prellenado:
  `name`, `email`, `smsPhone` (recordatorio SMS) y **`a0`** (pregunta "Teléfono (WhatsApp)"
  = `customQuestionAnswers.0`, type tel — Zcal prefila las preguntas personalizadas por
  índice a0, a1, a2…). Evento: **"Sesión Estratégica: Tu Empresa en EE. UU."** — el evento
  Zcal está configurado en 30 min y su slug es `.../agendar-asesoria-llc/60min` (el `/30min`
  no existe). El copy de la landing no expone la duración; Zcal sí la muestra en el widget.
  Pendiente: revisar si conviene subir la duración del evento Zcal a 45–60 min para dar
  margen a que el asesor se extienda sin colisionar reservas consecutivas.
  El `lead_id` **no** viaja en la URL de Zcal; la reserva se reconcilia por email/teléfono
  en n8n (webhook de Zcal).
- **Tracking:** GTM `GTM-TNRQGDM` + TikTok Pixel `D5KFDEBC77U6BL6T7LDG` + scaffold de
  **Meta Pixel** (`__META_PIXEL_ID__`, no-op hasta poner el ID). Eventos con `event_id`
  deduplicable: `ViewContent` (load) · `Lead`/`CompleteRegistration` (envío del form —
  evento de optimización) · `Schedule` (reserva Zcal) · `Contact` (WhatsApp).
  El CAPI server-side lo hace n8n (`webhook/pixel-api-conversiones`) con el mismo `event_id`.
- **Atribución:** captura `utm_*`, `ttclid`, `fbclid`, `_ttp`, `_fbp`, `_fbc` → payload → Odoo.
  Persiste en `sessionStorage` (sobrevive el salto A↔B).
- **Guardas:** píxeles (TikTok/Meta) y `POST` a n8n se ejecutan en **cualquier host**
  (no hay guard de dominio: las landings pueden servirse desde GitHub Pages u otro host).
  Para probar sin tocar producción, usar `?qa=1&no_pixels=1&no_webhook=1`.
- **Selector de país:** custom con **imagen de bandera** (flagcdn) en el botón y en la lista;
  autoselecciona el país por idioma/zona horaria del navegador; el placeholder es un
  ejemplo de número por país. 19 países (LATAM + Centro América + Rep. Dominicana + US + ES).
- **Precio:** anual — «Los planes son anuales, desde USD 350 (Básico) + tasa del estado
  (varía por jurisdicción). El costo exacto de la renovación se ve en la reunión.»
- **Reembolso:** no se anuncia como garantía. FAQ: se puede solicitar la devolución cuando
  el servicio no se concreta; sujeto a revisión y a `/terminos` y `/politicas`.

## Variantes de mensaje por `?utm_content=` / `?hook=`

- **Landing A:** `dolares` · `patrimonio` · `ordenar`
- **Landing B:** `atrasadas` (5472/1120) · `estado` (Delaware / franchise tax) · `proveedor`

La campaña debe pasar el parámetro que coincide con el creativo.

## Antes de publicar (bloqueantes)

1. **Evento Zcal** — ✅ verificado (2026-09). El evento vive en el slug
   `.../agendar-asesoria-llc/60min` (dura 30 min; el `/30min` da 404). "Teléfono (WhatsApp)"
   es `customQuestionAnswers.0` = **a0** (type tel) y `name` / `email` / `smsPhone` / `a0`
   prellenan bien. Los 3 archivos (2 landings + gracias-por-tu-registro) apuntan a `/60min`.
2. **Meta Pixel ID** — reemplazar `__META_PIXEL_ID__` en `SCI_TRACKING_CONFIG` + token/acceso
   CAPI en n8n; añadir la rama Meta al webhook `pixel-api-conversiones`.
3. **n8n** — (a) devolver `Access-Control-Allow-Origin` y responder al `OPTIONS` para que el
   `fetch` confirme (sin eso el lead entra por reintento no-cors, estado `sent_unconfirmed`);
   (b) mapear los valores de `goal` a etapa/campo de Odoo:
   A: `llc_nueva`, `ordenar_llc`, `banca_pagos`, `inversion_patrimonio`;
   B: `ordenar_llc`, `cumplimiento`, `cambio_estado`, `banca_pagos`, `inversion_patrimonio`, `socios_holding`.
4. **GTM** — crear tags/triggers para `complete_registration` y `schedule` y mapearlos a las
   conversiones de TikTok y Meta Ads; verificar que el contenedor `GTM-TNRQGDM` está publicado
   con esos disparadores (hoy el contenedor existe pero hay que confirmar los tags).
5. **Consentimiento** — hoy es implícito al enviar (fineprint + enlace a políticas).
   Confirmar con legal si basta por país o hace falta checkbox.
6. **Indexación** — hoy `noindex,nofollow`. Confirmar si se deja así (recomendado para LP de
   campaña) o se permite indexar.
7. **Wording de precio anual** y del texto de reembolso — validar.
8. **Publicar** — quitar el `noindex` si aplica, renombrar nada (las carpetas ya son la ruta).

## Conversiones esperadas (para configurar en GTM / Ads)

| Evento estándar | dataLayer | Cuándo | Uso |
|---|---|---|---|
| `ViewContent` | `view_content` | carga | audiencias / calidad de tráfico |
| — | `lead_form_start` | primer foco en el form | micro-conversión / diagnóstico de fricción |
| `Lead` / `CompleteRegistration` | `complete_registration` | envío del formulario | **conversión de optimización de campaña** |
| `Schedule` | `schedule` | reserva confirmada en Zcal | conversión de calidad (reunión agendada) |
| `Contact` | `contact_whatsapp` | clic en WhatsApp | conversión secundaria |

Cuando el lead pase a **Ganado** en Odoo, n8n debe subir la **conversión offline** a
TikTok Events API y Meta CAPI con el `ttclid`/`fbclid` guardado.
