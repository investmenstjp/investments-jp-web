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
  if (t === 'photos_after') return L(`Buenas, acabo de enviar una solicitud de cotización a nombre de ${el.dataset.name || ''}. Les envío más fotos / un video del acceso y del área de descarga.`, `Hello, I just sent a quote request under the name ${el.dataset.name || ''}. Here are more photos / a video of the access and unloading area.`);
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
  const setErr = (id, msg) => { const el = F(id); el.closest('.f').classList.toggle('bad', !!msg); const e = $(`.err[data-for="${id}"]`); if (e) e.textContent = msg || ''; el.setAttribute('aria-invalid', msg ? 'true' : 'false'); };
  const NEED = { buy: ['Comprar contenedor', 'Buy a container'], rent: ['Alquilar contenedor', 'Rent a container'], transport: ['Transporte de contenedor', 'Container transport'], crane: ['Grúa o izaje', 'Crane or lifting'], other: ['Otro', 'Other'] };
  const radio = name => (form.elements[name] && form.elements[name].value) || '';
  /* GPS + photos are required only when the container has to be delivered: transport/crane service,
     or the client answered anything but "No" to transport and crane. Quote-only → optional. */
  const needsSite = () => { const n = F('f_need').value; if (n === 'transport' || n === 'crane') return true; return !(radio('need_transport') === 'no' && radio('need_crane') === 'no'); };
  const syncSite = () => {
    const req = needsSite();
    F('geoReq').textContent = req ? '*' : `(${L('opcional', 'optional')})`; F('geoReq').classList.toggle('opt', !req);
    F('phReq').textContent = req ? '*' : `(${L('opcional', 'optional')})`; F('phReq').classList.toggle('opt', !req);
    F('geoHelpReq').hidden = !req; F('geoHelpOpt').hidden = req; F('phHelpReq').hidden = !req; F('phHelpOpt').hidden = req;
    if (!req) { ['f_pin', 'f_photos'].forEach(id => setErr(id, '')); }
  };
  const sync = () => {
    const n = F('f_need').value;
    F('w_ctype').hidden = (n === 'crane' || n === 'other');
    F('w_tr').hidden = (n === 'transport');   // the service itself is transport
    F('w_cr').hidden = (n === 'crane');       // the service itself is crane work
    syncSite();
  };
  F('f_need').addEventListener('change', sync);
  form.addEventListener('change', e => { if (e.target.name === 'need_transport' || e.target.name === 'need_crane') { setErr(e.target.name === 'need_transport' ? 'w_tr' : 'w_cr', ''); syncSite(); } });
  const p = new URLSearchParams(location.search);
  const svc = p.get('service') || p.get('need');
  if (svc && NEED[svc]) F('f_need').value = svc;
  const ct = (p.get('ctype') || '').replace(/^mod(20|40)-/, 'mar$1-');   // links from the first Módulos version
  if (ct && F('f_ctype').querySelector(`option[value="${CSS.escape(ct)}"]`)) F('f_ctype').value = ct;
  if (p.get('lang') === 'en' && lang !== 'en') { lang = 'en'; applyLang(); }
  sync();

  /* ---- step 2: exact location of the site on a map (required when there is transport or crane).
     The client marks the spot on an interactive map (tap / drag the pin), can search a place, use the phone
     GPS to centre, or paste a Google Maps link. Sent as mapspin (Google Maps URL) + lat/lng. ---- */
  const geoStatus = F('geoStatus');
  const showGeo = (html, bad) => { geoStatus.innerHTML = html; geoStatus.classList.toggle('bad', !!bad); geoStatus.hidden = false; };
  const COORDS_RE = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;
  const MAPS_RE = /(maps\.app\.goo\.gl|goo\.gl\/maps|google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.apple\.com|waze\.com\/ul|waze\.com\/live-map)/i;
  const fmt = n => Number(n).toFixed(6);
  const gmaps = (la, lo) => `https://maps.google.com/?q=${fmt(la)},${fmt(lo)}`;
  const coordsFromLink = u => {   // lat,lng inside a Google Maps URL, when present
    const m = u.match(/[?&]q=(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/) || u.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/) || u.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/) || u.match(/[?&]ll=(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
    return m ? [parseFloat(m[1]), parseFloat(m[2])] : null;
  };
  const pinValue = () => {                     // normalised value for sending, '' if nothing valid
    if (F('f_lat').value && F('f_lng').value) return gmaps(F('f_lat').value, F('f_lng').value);
    const raw = F('f_pin').value.trim(); if (!raw) return '';
    const c = raw.match(COORDS_RE); if (c) return gmaps(c[1], c[2]);
    return MAPS_RE.test(raw) ? raw : '';
  };
  const PIN_ERR = () => L('Marque en el mapa el punto exacto del sitio (toque el mapa o use «Mi ubicación»), o pegue el enlace de Google Maps.', 'Mark the exact spot on the map (tap the map or use "My location"), or paste the Google Maps link.');

  const PANAMA = [8.43, -80.6];
  const PROV = { 'Panamá': [8.98, -79.52, 11], 'Panamá Oeste': [8.88, -79.78, 11], 'Colón': [9.36, -79.90, 11], 'Coclé': [8.50, -80.37, 10], 'Herrera': [7.96, -80.42, 11], 'Los Santos': [7.93, -80.42, 10], 'Veraguas': [8.10, -81.06, 10], 'Chiriquí': [8.43, -82.43, 11], 'Bocas del Toro': [9.34, -82.25, 10], 'Darién': [8.05, -77.78, 9], 'Comarca Guna Yala': [9.30, -78.60, 9], 'Comarca Ngäbe-Buglé': [8.45, -81.80, 10], 'Comarca Emberá-Wounaan': [8.10, -77.90, 9], 'Comarca Naso Tjër Di': [9.20, -82.80, 10] };
  let map = null, marker = null;
  const PIN_SVG = '<svg viewBox="0 0 34 44" width="34" height="44" xmlns="http://www.w3.org/2000/svg"><path d="M17 1C8.2 1 1 8.1 1 16.9 1 28.3 17 43 17 43s16-14.7 16-26.1C33 8.1 25.8 1 17 1z" fill="#D42A1C" stroke="#fff" stroke-width="2"/><circle cx="17" cy="17" r="6" fill="#fff"/></svg>';
  const setPin = (la, lo, opts) => {
    opts = opts || {};
    F('f_lat').value = fmt(la); F('f_lng').value = fmt(lo); F('f_pin').value = gmaps(la, lo); setErr('f_pin', '');
    if (map) {
      if (!marker) {
        marker = window.L.marker([la, lo], { draggable: true, icon: window.L.divIcon({ className: 'geo-pin', html: PIN_SVG, iconSize: [34, 44], iconAnchor: [17, 43] }), keyboard: false }).addTo(map);
        marker.on('dragend', () => { const q = marker.getLatLng(); setPin(q.lat, q.lng, { fromDrag: true }); });
      } else marker.setLatLng([la, lo]);
      if (opts.zoom) map.setView([la, lo], Math.max(map.getZoom(), opts.zoom));
    }
    const acc = opts.acc ? ` · ±${Math.round(opts.acc)} m` : '';
    showGeo(`✓ ${L('Ubicación marcada', 'Location marked')} (${fmt(la)}, ${fmt(lo)}${acc}) · <a href="${gmaps(la, lo)}" target="_blank" rel="noopener">${L('Ver en Google Maps', 'View in Google Maps')}</a><br><span class="geo-sub">${L('¿No es el punto exacto? Arrastre el pin o toque el lugar correcto.', 'Not the exact spot? Drag the pin or tap the right place.')}</span>`);
  };
  const clearPin = () => { F('f_lat').value = ''; F('f_lng').value = ''; if (marker && map) { map.removeLayer(marker); marker = null; } geoStatus.hidden = true; };
  const initMap = () => {
    if (map || !window.L || !F('geoMap')) return;
    try {
      const LF = window.L;
      map = LF.map('geoMap', { center: PANAMA, zoom: 7, scrollWheelZoom: false, zoomControl: true, attributionControl: true });
      const street = LF.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' });
      const sat = LF.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Esri, Maxar, Earthstar Geographics' });
      street.addTo(map);
      LF.control.layers({ [L('Mapa', 'Map')]: street, [L('Satélite', 'Satellite')]: sat }, null, { position: 'topright', collapsed: false }).addTo(map);
      map.on('click', e => setPin(e.latlng.lat, e.latlng.lng, { zoom: 16 }));
      setTimeout(() => map.invalidateSize(), 300);
      const prov = F('f_prov').value; if (PROV[prov]) map.setView(PROV[prov].slice(0, 2), PROV[prov][2]);
    } catch (e) { map = null; F('geoMap').hidden = true; F('geoTip').hidden = true; }
  };
  initMap();
  if (!map) { F('geoMap').hidden = true; F('geoTip').hidden = true; }   // Leaflet not loaded: GPS button + link still work
  F('f_prov').addEventListener('change', () => { const c = PROV[F('f_prov').value]; if (map && c && !marker) map.setView(c.slice(0, 2), c[2]); });

  const geoSearch = async () => {
    const q = F('geoSearch').value.trim(); if (!q) { F('geoSearch').focus(); return; }
    const b = F('geoSearchBtn'); b.disabled = true;
    try {
      const prov = F('f_prov').value, qq = prov && !new RegExp(prov, 'i').test(q) ? `${q}, ${prov}` : q;
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=pa&q=${encodeURIComponent(qq + ', Panamá')}`, { headers: { 'Accept': 'application/json' } });
      const js = await r.json();
      if (js && js[0]) {
        const la = parseFloat(js[0].lat), lo = parseFloat(js[0].lon);
        if (map) map.setView([la, lo], 15);
        showGeo(L('Lugar encontrado. Ahora acerque el mapa y toque el punto exacto donde irá el contenedor.', 'Place found. Now zoom in and tap the exact spot where the container will go.'));
      } else showGeo(L('No encontramos ese lugar. Pruebe con el nombre del pueblo o corregimiento, o use «Mi ubicación».', 'We could not find that place. Try the town or district name, or use "My location".'), true);
    } catch (e) { showGeo(L('No se pudo buscar en este momento. Toque el mapa para marcar el punto o use «Mi ubicación».', 'Search is unavailable right now. Tap the map to mark the spot or use "My location".'), true); }
    b.disabled = false;
  };
  F('geoSearchBtn').addEventListener('click', geoSearch);
  F('geoSearch').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); geoSearch(); } });

  F('geoBtn').addEventListener('click', () => {
    const b = F('geoBtn');
    if (!navigator.geolocation) { showGeo(L('Su navegador no permite compartir la ubicación. Toque el mapa para marcar el punto.', 'Your browser cannot share your location. Tap the map to mark the spot.'), true); return; }
    b.disabled = true; showGeo(L('Obteniendo su ubicación… si el teléfono pregunta, pulse «Permitir».', 'Getting your location… if your phone asks, tap "Allow".'));
    navigator.geolocation.getCurrentPosition(pos => {
      b.disabled = false; setPin(pos.coords.latitude, pos.coords.longitude, { zoom: 17, acc: pos.coords.accuracy });
    }, err => {
      b.disabled = false;
      if (pinValue()) { showGeo(L('No se pudo obtener su ubicación, pero ya hay un punto marcado. Revise que sea el correcto.', 'Could not get your location, but a spot is already marked. Check that it is the right one.')); return; }
      const denied = err && err.code === 1;
      showGeo(denied ? L('El permiso de ubicación fue denegado. Active la ubicación del teléfono y vuelva a intentarlo, o toque el mapa para marcar el punto.', 'Location permission was denied. Turn on your phone\'s location and try again, or tap the map to mark the spot.')
        : L('No se pudo obtener la ubicación. Intente al aire libre, o toque el mapa para marcar el punto.', 'Could not get your location. Try outdoors, or tap the map to mark the spot.'), true);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });
  F('f_pin').addEventListener('input', () => {
    const raw = F('f_pin').value.trim();
    if (!raw) { clearPin(); return; }
    const c = raw.match(COORDS_RE), fromLink = c ? [parseFloat(c[1]), parseFloat(c[2])] : coordsFromLink(raw);
    if (fromLink) { setPin(fromLink[0], fromLink[1], { zoom: 16 }); return; }
    F('f_lat').value = ''; F('f_lng').value = ''; if (marker && map) { map.removeLayer(marker); marker = null; }
    if (MAPS_RE.test(raw)) { setErr('f_pin', ''); showGeo(`✓ ${L('Enlace de ubicación recibido', 'Location link received')} · ${L('(no se puede mostrar en el mapa, pero lo usaremos)', '(cannot be shown on the map, but we will use it)')}`); }
    else geoStatus.hidden = true;
  });

  /* ---- step 3: photos of the site (required, 1–4). Compressed in the browser and sent with the request. ---- */
  const photos = [];                            // { filename, data (base64 jpeg), preview }
  const MAX_PHOTOS = 4, MAX_SIDE = 1280;
  const phGrid = F('phGrid'), phCount = F('phCount'), phInput = F('f_photos');
  const compress = file => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const s = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.naturalWidth * s)); c.height = Math.max(1, Math.round(img.naturalHeight * s));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      let q = 0.72, out = c.toDataURL('image/jpeg', q);
      while (out.length > 600000 && q > 0.4) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
      resolve(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
    img.src = url;
  });
  const renderPhotos = () => {
    phGrid.innerHTML = ''; phGrid.hidden = !photos.length;
    photos.forEach((p, i) => {
      const d = document.createElement('div'); d.className = 'ph-thumb';
      d.innerHTML = `<img src="${p.preview}" alt="${L('Foto', 'Photo')} ${i + 1}"><button type="button" class="ph-del" data-i="${i}" aria-label="${L('Quitar foto', 'Remove photo')} ${i + 1}">×</button>`;
      phGrid.appendChild(d);
    });
    phCount.textContent = photos.length ? `${photos.length}/${MAX_PHOTOS} ${L('fotos', 'photos')}${photos.length < MAX_PHOTOS ? ' · ' + L('puede agregar más', 'you can add more') : ''}` : '';
    F('phBtn').querySelector('span').textContent = photos.length ? L('Agregar otra foto', 'Add another photo') : L('Tomar o subir fotos', 'Take or upload photos');
    F('phBtn').hidden = photos.length >= MAX_PHOTOS;
  };
  F('phBtn').addEventListener('click', () => phInput.click());
  phGrid.addEventListener('click', e => { const b = e.target.closest('.ph-del'); if (!b) return; photos.splice(+b.dataset.i, 1); photos.forEach((p, i) => { p.filename = `foto-${i + 1}.jpg`; }); renderPhotos(); });
  phInput.addEventListener('change', async () => {
    const files = [...phInput.files].filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|heic|heif|webp)$/i.test(f.name));
    phInput.value = '';
    if (!files.length) { setErr('f_photos', L('Seleccione una imagen (foto).', 'Select an image (photo).')); return; }
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) { setErr('f_photos', L(`Máximo ${MAX_PHOTOS} fotos.`, `Maximum ${MAX_PHOTOS} photos.`)); return; }
    setErr('f_photos', ''); phCount.textContent = L('Preparando fotos…', 'Preparing photos…');
    let failed = 0;
    for (const f of files.slice(0, room)) {
      try { const data = await compress(f); photos.push({ filename: `foto-${photos.length + 1}.jpg`, data: data.split(',')[1], preview: data }); }
      catch (e) { failed++; }
    }
    photos.forEach((p, i) => { p.filename = `foto-${i + 1}.jpg`; });
    renderPhotos();
    if (failed) setErr('f_photos', L('Una de las fotos no se pudo leer. Intente con otra.', 'One of the photos could not be read. Try another one.'));
    if (files.length > room) phCount.textContent += ' · ' + L(`Solo se tomaron ${room}: el máximo es ${MAX_PHOTOS}.`, `Only ${room} were added: the maximum is ${MAX_PHOTOS}.`);
  });

  const IDS = ['f_need', 'f_ctype', 'f_prov', 'f_loc', 'w_tr', 'w_cr', 'f_pin', 'f_photos', 'f_name', 'f_wa', 'f_email'];
  IDS.forEach(id => F(id).addEventListener('input', () => setErr(id, '')));
  const validate = () => {
    const v = id => F(id).value.trim(); const errs = []; const n = v('f_need');
    if (!n) errs.push(['f_need', L('Elija qué necesita.', 'Choose what you need.')]);
    if ((n === 'buy' || n === 'rent') && !v('f_ctype')) errs.push(['f_ctype', L('Elija el tipo de contenedor.', 'Choose the container type.')]);
    if (!v('f_prov')) errs.push(['f_prov', L('Elija la provincia.', 'Choose the province.')]);
    if (v('f_loc').length < 3) errs.push(['f_loc', L('Escriba la ubicación o destino de entrega.', 'Enter the delivery location or destination.')]);
    if (n !== 'transport' && !radio('need_transport')) errs.push(['w_tr', L('Indique si requiere transporte.', 'Tell us if you need transport.')]);
    if (n !== 'crane' && !radio('need_crane')) errs.push(['w_cr', L('Indique si requiere descarga con grúa.', 'Tell us if you need crane unloading.')]);
    const req = needsSite();
    if (req && !pinValue()) errs.push(['f_pin', PIN_ERR()]);
    else if (!req && F('f_pin').value.trim() && !pinValue()) errs.push(['f_pin', L('El enlace no parece de Google Maps. Péguelo de nuevo o deje la casilla vacía.', 'That does not look like a Google Maps link. Paste it again or leave the field empty.')]);
    if (req && !photos.length) errs.push(['f_photos', L('Adjunte al menos una foto del sitio (acceso y área donde irá el contenedor).', 'Attach at least one photo of the site (access and the area where the container will go).')]);
    if (v('f_name').length < 2) errs.push(['f_name', L('Escriba su nombre.', 'Enter your name.')]);
    if (v('f_wa').replace(/\D/g, '').length < 7) errs.push(['f_wa', L('Escriba un número válido, por ejemplo 6123-4567.', 'Enter a valid number, e.g. 6123-4567.')]);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('f_email'))) errs.push(['f_email', L('Escriba un correo válido, por ejemplo nombre@correo.com.', 'Enter a valid email, e.g. name@email.com.')]);
    IDS.forEach(id => setErr(id, '')); errs.forEach(([id, m]) => setErr(id, m));
    if (errs.length) { const first = errs[0][0], target = first === 'f_pin' ? F('geoBtn') : (first === 'f_photos' ? F('phBtn') : (first === 'w_tr' || first === 'w_cr' ? F(first).querySelector('input') : F(first))); target.scrollIntoView({ block: 'center', behavior: 'smooth' }); target.focus({ preventScroll: true }); }
    return !errs.length;
  };
  const reset = () => { form.reset(); form.classList.remove('sent'); F('formOk').hidden = true; F('qSubmit').disabled = false; photos.length = 0; renderPhotos(); clearPin(); F('geoSearch').value = ''; sync(); };
  F('okNew').addEventListener('click', () => { reset(); F('f_need').focus(); });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;
    const fd = new FormData(form), need = fd.get('need'), noCt = F('w_ctype').hidden;
    const data = {
      service: need, service_label: NEED[need] ? NEED[need][lang === 'es' ? 0 : 1] : need,
      ctype: noCt ? '' : fd.get('ctype'), ctype_label: noCt ? '' : ((F('f_ctype').selectedOptions[0] || {}).textContent || ''),
      qty: fd.get('qty'), province: fd.get('province'), deladdr: fd.get('deladdr'), mapspin: pinValue(),
      need_transport: need === 'transport' ? 'si' : (fd.get('need_transport') || ''), need_crane: need === 'crane' ? 'si' : (fd.get('need_crane') || ''),
      site_required: needsSite() ? 'si' : 'no',
      lat: F('f_lat').value || '', lng: F('f_lng').value || '',
      desc: fd.get('desc') || '', name: fd.get('name'), whatsapp: fd.get('whatsapp'), email: fd.get('email'),
      photos_count: String(photos.length), photos: photos.map(p => ({ filename: p.filename, data: p.data })),
      lang, source: 'jpinvestments-smartquote', page: 'v7', ts: new Date().toISOString()
    };
    const btn = F('qSubmit'); btn.disabled = true;
    const label = btn.querySelector('span'), old = label.textContent; label.textContent = L('Enviando fotos y datos…', 'Sending photos and details…');
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
        data.desc ? `• ${L('Observaciones', 'Notes')}: ${data.desc}` : '', `• ${L('Nombre', 'Name')}: ${data.name}`, `• WhatsApp: ${data.whatsapp}`, `• Email: ${data.email}`,
        L('(Le adjunto las fotos del sitio en este chat.)', '(I am attaching the site photos in this chat.)')].filter(Boolean).join('\n');
      window.open(waLink(WA_NUMBER, lines), '_blank', 'noopener');
      F('okText').textContent = L('Abrimos WhatsApp con sus datos para que nos envíe la solicitud; adjunte ahí las fotos del sitio. Si no se abrió, escríbanos al +507 6250-4804.', 'We opened WhatsApp with your details so you can send us the request; attach the site photos there. If it did not open, message us at +507 6250-4804.');
    }
    F('okPhotos').dataset.name = data.name;
    form.classList.add('sent'); F('formOk').hidden = false; F('formOk').focus();
  });
}
})();
