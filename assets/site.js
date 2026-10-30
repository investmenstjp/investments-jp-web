/* Investments JP v6 — shared script for every page */
(function () {
'use strict';
/* ================== CONFIG ================== */
const WA_NUMBERS = [
  { n: '50762504804', label: '+507 6250-4804' },
  { n: '50764142350', label: '+507 6414-2350' }
];
const WA_NUMBER = WA_NUMBERS[0].n;
const FORM_WEBHOOK = 'https://hook.us2.make.com/hwe0zyxbs2bpdfqtjedqtoibrirshu7l';
/* ============================================ */

/* ---------- measurement: Google Analytics 4 + Meta Pixel (loaded in <head> when configured) ----------
   Only counts actions — never sends what the visitor types in the form. */
const track = (ev, params, fb) => {
  try {
    if (typeof window.gtag === 'function') window.gtag('event', ev, Object.assign({ page_path: location.pathname }, params || {}));
    if (fb && typeof window.fbq === 'function') window.fbq('track', fb[0], fb[1] || {});
  } catch (e) {}
};
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
  const h = a.getAttribute('href') || '';
  if (/wa\.me\/|api\.whatsapp\.com/.test(h) && !a.classList.contains('js-wa')) {
    const n = (h.match(/wa\.me\/(\d+)/) || [])[1] || '';
    track('whatsapp_click', { contact: n.endsWith('4142350') ? 'oficina' : 'principal' }, ['Contact', { content_name: 'WhatsApp' }]);
  } else if (h.indexOf('tel:') === 0) {
    track('phone_call_click', { contact: h.indexOf('4142350') > -1 ? 'oficina' : 'principal' }, ['Contact', { content_name: 'Llamada' }]);
  } else if (h.indexOf('mailto:') === 0) {
    track('email_click', {}, ['Contact', { content_name: 'Correo' }]);
  } else if (/g\.page\/r\//.test(h)) {
    track('review_link_click', {});
  } else if (/instagram\.com\//.test(h)) {
    track('instagram_click', {});
  } else if (a.classList.contains('wa-form')) {
    track('quote_form_open', {});
  }
}, true);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
let lang = store.get('jp-lang') === 'en' ? 'en' : 'es';
const L = (es, en) => lang === 'es' ? es : en;

/* ---------- old one-page links → new pages ---------- */
if (location.pathname === '/' || location.pathname === '/index.html') {
  const p = new URLSearchParams(location.search), h = location.hash;
  const map = { '#cotizar': '/cotizar/', '#contenedores': '/contenedores/', '#tamanos': '/contenedores/', '#proyectos': '/proyectos/', '#trabajo': '/proyectos/', '#servicios': '/transporte-y-gruas/', '#preguntas': '/empresa/#preguntas', '#empresa': '/empresa/', '#como-cotizar': '/cotizar/' };
  if (p.get('quote') === 'true' || p.get('service')) { location.replace('/cotizar/' + location.search); return; }
  if (map[h]) { location.replace(map[h]); return; }
}

const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

/* ---------- language (Spanish in the HTML, English in data-en) ---------- */
const ES = new Map();
function applyLang() {
  $$('[data-en]').forEach(el => {
    if (el.tagName === 'OPTION') { if (!el.dataset.es) el.dataset.es = el.textContent; el.textContent = lang === 'en' ? el.dataset.en : el.dataset.es; return; }
    if (!ES.has(el)) ES.set(el, el.innerHTML);
    el.innerHTML = lang === 'en' ? el.dataset.en : ES.get(el);
  });
  $$('[data-ph-en]').forEach(i => { if (!i.dataset.phEs) i.dataset.phEs = i.placeholder; i.placeholder = lang === 'en' ? i.dataset.phEn : i.dataset.phEs; });
  $$('.tile').forEach(t => { const c = t.querySelector('.cap'); if (c) c.textContent = lang === 'en' ? t.dataset.capEn : t.dataset.cap; });
  $$('optgroup[data-label-en]').forEach(g => { if (!g.dataset.labelEs) g.dataset.labelEs = g.label; g.label = lang === 'en' ? g.dataset.labelEn : g.dataset.labelEs; });
  document.documentElement.lang = lang;
  const b = $('#langBtn'); if (b) b.textContent = lang === 'es' ? 'EN' : 'ES';
}
$('#langBtn').addEventListener('click', () => { lang = lang === 'es' ? 'en' : 'es'; store.set('jp-lang', lang); applyLang(); });
if (lang === 'en') applyLang();

/* ---------- mobile menu ---------- */
const menuBtn = $('#menuBtn'), mnav = $('#mnav');
menuBtn.addEventListener('click', () => { const open = mnav.hidden; mnav.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); });

/* ---------- quick-contact bar: only after the first screen ---------- */
const mbar = $('#mbar');
const onScroll = () => mbar.classList.toggle('on', window.scrollY > window.innerHeight * 0.5);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ---------- WhatsApp: prepared message + choice of number (and form for quotes) ---------- */
function unitPhrase(u) { return /^oficina/i.test(u) ? 'una ' + u : (/^m[óo]dulo/i.test(u) ? 'un ' + u : 'un contenedor de ' + u); }
function waMessage(el) {
  const t = el.dataset.wa, u = el.dataset.unit || '';
  if (t === 'unit') return L(`Buenas, estoy interesado en cotizar ${unitPhrase(u)}. ¿Me pueden ayudar con disponibilidad, precio y transporte?`, `Hello, I'm interested in a quote for ${u}. Can you help me with availability, price and transport?`);
  if (t === 'photos') return L(`Buenas, ¿me pueden enviar fotos reales de ${unitPhrase(u)} disponible? Gracias.`, `Hello, could you send me real photos of the available ${u}? Thank you.`);
  if (t === 'photos_after') return L(`Buenas, acabo de enviar una solicitud de cotización a nombre de ${el.dataset.name || ''}. Les envío fotos del acceso y del área de descarga.`, `Hello, I just sent a quote request under the name ${el.dataset.name || ''}. Here are photos of the access and unloading area.`);
  return L('Buenas, quiero cotizar con Investments JP. ¿Me pueden ayudar?', 'Hello, I would like a quote from Investments JP. Can you help me?');
}
const waLink = (n, msg) => `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
const WA_ICON = (document.querySelector('.wa-ic') || { outerHTML: '' }).outerHTML;
const pick = document.createElement('dialog');
pick.className = 'wa-pick';
pick.innerHTML = '<div class="wa-sheet"><h3 id="wpT"></h3><p id="wpP"></p><div id="wpL"></div><button type="button" class="btn btn-ghost wa-cancel" id="wpC"></button></div>';
document.body.appendChild(pick);
pick.addEventListener('click', e => { if (e.target === pick) pick.close(); });
$('#wpC', pick).addEventListener('click', () => pick.close());
function openPicker(msg, formUrl) {
  if (typeof pick.showModal !== 'function') { track('whatsapp_click', { contact: 'principal' }, ['Contact', { content_name: 'WhatsApp' }]); window.open(waLink(WA_NUMBER, msg), '_blank', 'noopener'); return; }
  $('#wpT', pick).textContent = formUrl ? L('¿Cómo prefiere cotizar?', 'How would you like to get a quote?') : L('Escríbanos por WhatsApp', 'Message us on WhatsApp');
  $('#wpP', pick).textContent = L('El mensaje ya va escrito.', 'Your message is ready.');
  $('#wpC', pick).textContent = L('Cancelar', 'Cancel');
  let h = WA_NUMBERS.map((w, i) => `<a class="wa-opt" href="${waLink(w.n, msg)}" target="_blank" rel="noopener"><span class="wa-dot">${WA_ICON}</span><span><b>WhatsApp ${w.label}</b><small>${L(i ? 'Oficina' : 'Contacto principal', i ? 'Office' : 'Main contact')}</small></span></a>`).join('');
  if (formUrl) h += `<a class="wa-opt wa-form" href="${formUrl}"><span class="wa-dot">✎</span><span><b>${L('Llenar formulario', 'Fill in the form')}</b><small>${L('Respuesta en menos de 24 h', 'Reply within 24 h')}</small></span></a>`;
  $('#wpL', pick).innerHTML = h;
  $$('.wa-opt', pick).forEach(a => a.addEventListener('click', () => setTimeout(() => pick.close(), 50)));
  pick.showModal();
}
$$('.js-wa').forEach(a => { a.href = waLink(WA_NUMBER, waMessage(a)); });
document.addEventListener('click', e => {
  const a = e.target.closest('.js-wa');
  if (a) { e.preventDefault(); openPicker(waMessage(a)); return; }
  const c = e.target.closest('.js-cot');
  if (c) { e.preventDefault(); openPicker(waMessage({ dataset: { wa: 'unit', unit: c.dataset.unit } }), `/cotizar/?service=buy&ctype=${encodeURIComponent(c.dataset.ctype)}`); }
});

/* ---------- modules: bathroom option (segmented control) swaps the plan, the text and what gets quoted ---------- */
$$('.mod').forEach(m => {
  const btns = $$('.mseg button', m);
  btns.forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.k;
    btns.forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
    $$('[data-k]', m).forEach(x => { if (x.tagName !== 'BUTTON') x.hidden = x.dataset.k !== k; });
    const cot = $('.js-cot', m), ph = $('.js-wa[data-wa="photos"]', m);
    if (cot) { cot.dataset.unit = b.dataset.unit; cot.dataset.ctype = b.dataset.ctype; }
    if (ph) { ph.dataset.unit = b.dataset.unit; ph.href = waLink(WA_NUMBER, waMessage(ph)); }
    track('module_option', { option: b.dataset.ctype });
  }));
});

/* ---------- filters ---------- */
$$('.chip[data-filter]').forEach(ch => ch.addEventListener('click', () => {
  $$('.chip[data-filter]').forEach(c => c.classList.toggle('on', c === ch));
  const f = ch.dataset.filter;
  $$('.unit').forEach(u => { u.hidden = f !== 'all' && u.dataset.group !== f; });
}));
$$('.chip[data-cat]').forEach(ch => ch.addEventListener('click', () => {
  $$('.chip[data-cat]').forEach(c => c.classList.toggle('on', c === ch));
  const f = ch.dataset.cat;
  $$('.tile').forEach(t => { t.hidden = f !== 'todos' && t.dataset.cat !== f; });
}));

/* ---------- lightbox ---------- */
const lb = $('#lb');
if (lb) {
  const stage = $('#lbStage');
  let items = [], idx = 0;
  const cdn = (p, w) => /investments-jp\.com$|netlify\.app$/.test(location.hostname) ? `/.netlify/images?url=/${p}&w=${w}&q=74` : '/' + p;
  const show = i => {
    idx = (i + items.length) % items.length;
    const it = items[idx];
    stage.innerHTML = it.type === 'video'
      ? `<video src="/${it.src}" poster="${it.poster || ''}" controls autoplay muted playsinline loop></video>`
      : `<img src="${it.src}" alt="${(it.cap || '').replace(/"/g, '&quot;')}">`;
    $('#lbCap').textContent = it.cap || '';
    $('#lbCount').textContent = `${idx + 1} / ${items.length}`;
    $('#lbPrev').hidden = $('#lbNext').hidden = items.length < 2;
  };
  const open = (list, start) => { items = list; lb.showModal ? lb.showModal() : lb.setAttribute('open', ''); show(start); };
  const close = () => { stage.innerHTML = ''; lb.close ? lb.close() : lb.removeAttribute('open'); };
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => show(idx - 1));
  $('#lbNext').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('close', () => { stage.innerHTML = ''; });
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
  stage.addEventListener('click', e => { if (e.target === stage) close(); });
  let tx = null;
  stage.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 45 && items.length > 1) show(idx + (dx < 0 ? 1 : -1)); tx = null; });
  document.addEventListener('click', e => {
    const t = e.target.closest('.tile');
    if (t) {
      const vis = $$('.tile', t.closest('.gallery')).filter(x => !x.hidden);
      open(vis.map(x => ({ type: x.dataset.type, src: x.dataset.src, poster: x.dataset.poster, cap: lang === 'en' ? x.dataset.capEn : x.dataset.cap })), vis.indexOf(t));
      return;
    }
    const b = e.target.closest('.js-photos');
    if (b) {
      open(JSON.parse(b.dataset.gal).map(s => s.startsWith('video:')
        ? (([v, p]) => ({ type: 'video', src: v, poster: cdn(p, 1200), cap: b.dataset.title }))(s.slice(6).split('|'))
        : { type: 'img', src: cdn(s, 1800), cap: b.dataset.title }), 0);
    }
  });
}

/* ---------- quote form ---------- */
const form = $('#qForm');
if (form) {
  const F = id => document.getElementById(id);
  const NEED = { buy: ['Comprar contenedor', 'Buy a container'], rent: ['Alquilar contenedor', 'Rent a container'], transport: ['Transporte de contenedor', 'Container transport'], crane: ['Grúa o izaje', 'Crane or lifting'], other: ['Otro', 'Other'] };
  const sync = () => { const n = F('f_need').value; F('w_ctype').hidden = (n === 'crane' || n === 'other'); };
  F('f_need').addEventListener('change', sync);
  const p = new URLSearchParams(location.search);
  const svc = p.get('service') || p.get('need');
  if (svc && NEED[svc]) F('f_need').value = svc;
  const ct = (p.get('ctype') || '').replace(/^mod(20|40)-/, 'mar$1-');   // links from the first Módulos version
  if (ct && F('f_ctype').querySelector(`option[value="${CSS.escape(ct)}"]`)) F('f_ctype').value = ct;
  if (p.get('lang') === 'en' && lang !== 'en') { lang = 'en'; applyLang(); }
  sync();

  F('geoBtn').addEventListener('click', () => {
    const b = F('geoBtn');
    if (!navigator.geolocation) { F('f_pin').placeholder = L('Su navegador no permite compartir ubicación', 'Your browser cannot share location'); return; }
    b.disabled = true;
    navigator.geolocation.getCurrentPosition(pos => {
      F('f_pin').value = `https://maps.google.com/?q=${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`; b.disabled = false;
    }, () => { b.disabled = false; F('f_pin').placeholder = L('No se pudo obtener la ubicación. Pegue el pin de Google Maps.', 'Could not get your location. Paste a Google Maps pin.'); }, { enableHighAccuracy: true, timeout: 12000 });
  });

  const IDS = ['f_need', 'f_ctype', 'f_prov', 'f_loc', 'f_name', 'f_wa', 'f_email'];
  const setErr = (id, msg) => { const el = F(id); el.closest('.f').classList.toggle('bad', !!msg); const e = $(`.err[data-for="${id}"]`); if (e) e.textContent = msg || ''; el.setAttribute('aria-invalid', msg ? 'true' : 'false'); };
  IDS.forEach(id => F(id).addEventListener('input', () => setErr(id, '')));
  const validate = () => {
    const v = id => F(id).value.trim(); const errs = [];
    if (!v('f_need')) errs.push(['f_need', L('Elija qué necesita.', 'Choose what you need.')]);
    if ((v('f_need') === 'buy' || v('f_need') === 'rent') && !v('f_ctype')) errs.push(['f_ctype', L('Elija el tipo de contenedor.', 'Choose the container type.')]);
    if (!v('f_prov')) errs.push(['f_prov', L('Elija la provincia.', 'Choose the province.')]);
    if (v('f_loc').length < 3) errs.push(['f_loc', L('Escriba la ubicación o destino de entrega.', 'Enter the delivery location or destination.')]);
    if (v('f_name').length < 2) errs.push(['f_name', L('Escriba su nombre.', 'Enter your name.')]);
    if (v('f_wa').replace(/\D/g, '').length < 7) errs.push(['f_wa', L('Escriba un número válido, por ejemplo 6123-4567.', 'Enter a valid number, e.g. 6123-4567.')]);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('f_email'))) errs.push(['f_email', L('Escriba un correo válido, por ejemplo nombre@correo.com.', 'Enter a valid email, e.g. name@email.com.')]);
    IDS.forEach(id => setErr(id, '')); errs.forEach(([id, m]) => setErr(id, m));
    if (errs.length) F(errs[0][0]).focus();
    return !errs.length;
  };
  const reset = () => { form.reset(); form.classList.remove('sent'); F('formOk').hidden = true; F('qSubmit').disabled = false; sync(); };
  F('okNew').addEventListener('click', () => { reset(); F('f_need').focus(); });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;
    const fd = new FormData(form), need = fd.get('need'), noCt = F('w_ctype').hidden;
    const data = {
      service: need, service_label: NEED[need] ? NEED[need][lang === 'es' ? 0 : 1] : need,
      ctype: noCt ? '' : fd.get('ctype'), ctype_label: noCt ? '' : ((F('f_ctype').selectedOptions[0] || {}).textContent || ''),
      qty: fd.get('qty'), province: fd.get('province'), deladdr: fd.get('deladdr'), mapspin: fd.get('mapspin') || '',
      need_transport: fd.get('need_transport') || '', need_crane: fd.get('need_crane') || '',
      desc: fd.get('desc') || '', name: fd.get('name'), whatsapp: fd.get('whatsapp'), email: fd.get('email'),
      lang, source: 'jpinvestments-smartquote', page: 'v6', ts: new Date().toISOString()
    };
    const btn = F('qSubmit'); btn.disabled = true;
    const label = btn.querySelector('span'), old = label.textContent; label.textContent = L('Enviando…', 'Sending…');
    let sent = false;
    try { const r = await fetch(FORM_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); sent = r.ok; } catch (err) { sent = false; }
    label.textContent = old;
    track('generate_lead', { service: data.service, container: data.ctype || '-', province: data.province, method: sent ? 'formulario' : 'whatsapp' },
      ['Lead', { content_name: data.service_label, content_category: data.ctype_label || data.service_label }]);
    if (!sent) {
      const yn = x => ({ si: L('Sí', 'Yes'), no: 'No', no_se: L('No sé', 'Not sure') }[x] || '-');
      const lines = [L('Buenas, quiero una cotización:', 'Hello, I would like a quote:'), `• ${L('Servicio', 'Service')}: ${data.service_label}`,
        data.ctype_label ? `• ${L('Contenedor', 'Container')}: ${data.ctype_label}` : '', `• ${L('Cantidad', 'Quantity')}: ${data.qty}`,
        `• ${L('Provincia', 'Province')}: ${data.province}`, `• ${L('Ubicación', 'Location')}: ${data.deladdr}`, data.mapspin ? `• Pin: ${data.mapspin}` : '',
        `• ${L('Transporte', 'Transport')}: ${yn(data.need_transport)} · ${L('Grúa', 'Crane')}: ${yn(data.need_crane)}`,
        data.desc ? `• ${L('Observaciones', 'Notes')}: ${data.desc}` : '', `• ${L('Nombre', 'Name')}: ${data.name}`, `• WhatsApp: ${data.whatsapp}`, `• Email: ${data.email}`].filter(Boolean).join('\n');
      window.open(waLink(WA_NUMBER, lines), '_blank', 'noopener');
      F('okText').textContent = L('Abrimos WhatsApp con sus datos para que nos envíe la solicitud. Si no se abrió, escríbanos al +507 6250-4804.', 'We opened WhatsApp with your details so you can send us the request. If it did not open, message us at +507 6250-4804.');
    }
    F('okPhotos').dataset.name = data.name;
    form.classList.add('sent'); F('formOk').hidden = false; F('formOk').focus();
  });
}
})();
