// SAAVEDRA CAFÉ · demo — intro del sello, carta corta, estante de bolsas, la receta (balanza), mazo de fotos.
import { initKit } from '../kit/kit.js?v=2';
import { esc } from '../kit/core/util.js?v=2';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const html = document.documentElement;
const desktop = matchMedia('(min-width: 1024px)');
const hoverFino = matchMedia('(hover: hover) and (pointer: fine)');
const calma = matchMedia('(prefers-reduced-motion: reduce)').matches;

// =========================================================
// INTRO: el sello baja, entinta el kraft y la solapa se levanta
// =========================================================
(function intro() {
  const el = $('.intro');
  const fin = () => html.classList.add('listo');
  if (!html.classList.contains('con-intro') || !el) { el?.remove(); fin(); return; }
  const t0 = performance.now();
  const minimo = innerWidth < 900 ? 1050 : 1320;
  const heroImg = $('.hero__arco img');
  const espera = Promise.all([
    document.fonts?.ready || Promise.resolve(),
    heroImg && !heroImg.complete ? new Promise(r => { heroImg.addEventListener('load', r, { once: true }); heroImg.addEventListener('error', r, { once: true }); }) : Promise.resolve(),
  ]);
  Promise.race([espera, new Promise(r => setTimeout(r, 2600))]).then(() => {
    setTimeout(() => {
      el.classList.add('is-sale');
      html.classList.remove('con-intro');
      setTimeout(fin, 160);
      setTimeout(() => el.remove(), 800);
    }, Math.max(0, minimo - (performance.now() - t0)));
  });
})();

// =========================================================
// ENTRADAS AL SCROLL
// =========================================================
const io = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => {
  ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
}, { threshold: .18, rootMargin: '0px 0px -6% 0px' }) : null;
function observar(root = document) {
  $$('[data-r]:not(.visto)', root).forEach((el, i) => {
    if (!el.style.getPropertyValue('--d')) { const sib = el.parentElement ? $$(':scope > [data-r]', el.parentElement).indexOf(el) : 0; el.style.setProperty('--d', Math.max(0, sib)); }
    io ? io.observe(el) : el.classList.add('visto');
  });
}
observar();

// =========================================================
// BARRA, MENÚ y links activos
// =========================================================
const top = $('.top');
addEventListener('scroll', () => {
  const y = scrollY;
  top.classList.toggle('is-scroll', y > 30);
  html.classList.toggle('paso-hero', y > innerHeight * .55);
}, { passive: true });
top.classList.toggle('is-scroll', scrollY > 30);

const menuBtn = $('.top__menu'), menu = $('#menu-m');
const ICO_MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>';
const ICO_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
function menuAbrir(si) {
  menu.hidden = !si; menuBtn.setAttribute('aria-expanded', si); menuBtn.innerHTML = si ? ICO_X : ICO_MENU;
  menuBtn.setAttribute('aria-label', si ? 'Cerrar menú' : 'Abrir menú');
  html.classList.toggle('menu-abierto', si); bloquear(si);
}
menuBtn?.addEventListener('click', () => menuAbrir(menu.hidden));
menu?.addEventListener('click', (e) => {
  const a = e.target.closest('a'); if (!a) return;
  e.preventDefault(); menuAbrir(false);
  const dest = $(a.getAttribute('href')); requestAnimationFrame(() => dest?.scrollIntoView({ behavior: calma ? 'auto' : 'smooth' }));
});
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu && !menu.hidden) menuAbrir(false); });
desktop.addEventListener?.('change', () => { if (desktop.matches && !menu.hidden) menuAbrir(false); });

const navLinks = $$('.nav a');
if (io) {
  const vis = new IntersectionObserver((ents) => ents.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('is-on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['carta', 'filtrados', 'receta', 'llevar', 'lugar', 'donde'].forEach(id => { const s = document.getElementById(id); if (s) vis.observe(s); });
}

let scrollGuardado = 0, bloqueos = 0;
function bloquear(si) {
  bloqueos = Math.max(0, bloqueos + (si ? 1 : -1));
  if (si && bloqueos === 1) { scrollGuardado = scrollY; Object.assign(document.body.style, { position: 'fixed', top: `-${scrollGuardado}px`, left: '0', right: '0' }); }
  if (!si && bloqueos === 0) { Object.assign(document.body.style, { position: '', top: '', left: '', right: '' }); html.style.scrollBehavior = 'auto'; scrollTo(0, scrollGuardado); html.style.scrollBehavior = ''; }
}

// el sello gira con el scroll
const giros = $$('.sello__giro');
let rafGiro = 0;
addEventListener('scroll', () => {
  if (calma || rafGiro) return;
  rafGiro = requestAnimationFrame(() => { rafGiro = 0; const g = scrollY * .12; giros.forEach(el => { el.style.transform = `rotate(${g}deg)`; }); });
}, { passive: true });

// =========================================================
// TEMPLATES DEL KIT
// =========================================================
const chica = (src) => String(src || '').replace(/\.webp$/, '-s.webp');
const TAGS = { vegan: { label: 'Vegan' }, sintacc: { label: 'Sin TACC' } };
function precioTxt(p, ctx) { return ctx.money(p.precio) ?? 'Consultar'; }
function tplCarta(p, ctx) {
  const izq = p.foto
    ? `<button type="button" class="it__foto" data-foto="${esc(ctx.asset(p.foto))}" data-nombre="${esc(p.nombre)}" aria-label="Ver foto: ${esc(p.nombre)}"><img src="${esc(ctx.asset(chica(p.foto)))}" alt="" width="240" height="240" loading="lazy" decoding="async"></button>`
    : `<span class="it__foto it__foto--ini" aria-hidden="true">${esc(p.nombre.charAt(0))}.</span>`;
  const extra = (p.variantes?.length ? p.variantes.map(v => v.nombre).join(' o ') : '') + (p.opciones?.some(o => o.id === 'leche') ? `${p.variantes?.length ? ' · ' : 'C'}${p.variantes?.length ? 'c' : ''}on leche de almendras si querés` : '');
  const desc = p.descripcion || extra;
  return `${izq}
    <div class="it__body"><h3 class="it__n">${esc(p.nombre)}${p.foto ? '<span class="dot" aria-hidden="true">●</span>' : ''} ${(p.etiquetas || []).map(ctx.etiquetaHTML).join('')}</h3>${desc ? `<p class="it__d">${esc(desc)}</p>` : ''}</div>
    <div class="it__side"><span class="it__precio">${esc(precioTxt(p, ctx))}</span>${ctx.pedible(p) ? `<div data-kit-qty="${esc(p.id)}"></div>` : ''}</div>`;
}
function tplBolsa(p, ctx) {
  const sem = p.id === 'grano-semana' ? (ctx.destacado ? ctx.destacado('semana') : {}) : null;
  const origen = sem ? (sem.origen || '[ORIGEN]') : p.nombre.split('·')[0].trim();
  const sub = sem ? `${sem.tostador || '[TOSTADOR]'} · filtrado de la semana` : (p.nombre.split('·')[1]?.trim() || 'Para llevar');
  const datos = sem
    ? `<p class="bolsa__dato"><b>Proceso:</b> ${esc(sem.proceso || '[A COMPLETAR desde el panel]')}</p><p class="bolsa__dato"><b>Notas:</b> ${esc(sem.notas || '[A COMPLETAR desde el panel]')}</p>`
    : `<p class="bolsa__dato">${esc(p.descripcion || '')}</p>`;
  return `<div class="bolsa__in">
      <div class="bolsa__cara bolsa__frente" data-girar>
        <img class="bolsa__sello" src="img/logo-negro.svg" alt="" width="767" height="198">
        <span class="bolsa__ventana"><img src="img/f/granos-v.webp" alt="" width="200" height="200" loading="lazy" decoding="async"></span>
        <div class="bolsa__eti"><span class="bolsa__n">${esc(origen)}.</span><span class="bolsa__o">${esc(sub)}</span></div>
        <span class="bolsa__girar">Tocá para dar vuelta ↻</span>
      </div>
      <div class="bolsa__cara bolsa__dorso" data-girar>
        <span class="bolsa__o">${esc(sem ? 'Filtrado de la semana' : 'Granos para llevar')}</span>
        <span class="bolsa__n">${esc(origen)}.</span>
        ${datos}
        <p class="bolsa__dato">Pedí que te lo molamos para tu método.</p>
        <div class="bolsa__pie"><span class="bolsa__precio">${esc(precioTxt(p, ctx))}</span>${ctx.pedible(p) ? `<div data-kit-qty="${esc(p.id)}"></div>` : ''}</div>
      </div>
    </div>`;
}
function tplCaja(p, ctx) {
  return `<div class="caja__foto">${p.foto ? `<img src="${esc(ctx.asset(p.foto))}" alt="${esc(p.nombre)}" width="1100" height="1100" loading="lazy" decoding="async">` : ''}</div>
    <div class="caja__txt"><h3 class="caja__n">${esc(p.nombre)}.</h3>${p.descripcion ? `<p class="caja__d">${esc(p.descripcion)}</p>` : ''}
    <span class="caja__chip">Por encargo · con 24 hs de anticipación</span>
    <div class="caja__pie"><span class="caja__precio">${esc(precioTxt(p, ctx))}</span>${ctx.pedible(p) ? `<div data-kit-qty="${esc(p.id)}"></div>` : ''}</div></div>`;
}

// =========================================================
// KIT
// =========================================================
const pendientes = []; let alCarta = null;
document.addEventListener('kit:carta', (e) => { alCarta ? alCarta(e) : pendientes.push(e); });
const kit = await initKit({
  config: 'cliente.json',
  imagenes: { lqip: 'img/lqip.json' },
  cartas: {
    'carta-principal': { itemClass: 'it', template: tplCarta, etiquetas: TAGS },
    'estante': { itemClass: 'bolsa', template: tplBolsa },
    'cajas': { itemClass: 'caja', template: tplCaja },
  },
  carrito: { label: 'Tu bolsita' },
  badgeTexto: 'Probá el panel del local',
});
window.kitSaavedra = kit;
const productos = new Map();

// ---------- carta: cabecera de sección, tono papel/tinta, anterior/siguiente, foto
const carta = $('#carta'), cartaEl = $('#carta-principal');
const cab = document.createElement('div'); cab.className = 'carta__cab';
cab.innerHTML = '<span class="carta__sec">Cafe.</span><p class="carta__meta"></p>';
const TONO = { cafe: 'papel', frio: 'papel', paste: 'tinta', salado: 'tinta' };
const META = {
  cafe: (n) => `${n} opciones · Puerto Blest · para llevar`,
  frio: (n) => `${n} opciones · para llevar`,
  paste: (n) => `${n} opciones · pastelería propia · opción vegan y sin TACC`,
  salado: (n) => `${n} opciones · se piden para retirar`,
};
const FOTO_CAT = { cafe: 'img/f/flat.webp', frio: 'img/f/frio.webp', paste: 'img/f/latte-scon.webp', salado: 'img/f/cappu.webp' };
const LARGOS = new Set(['salado']);
function catActual() { return $('.kit-tab.is-on', cartaEl)?.dataset.cat || 'cafe'; }
function pintarCabecera() {
  const tabs = $$('.kit-tab', cartaEl); const on = Math.max(0, tabs.findIndex(t => t.classList.contains('is-on')));
  const cat = catActual();
  const panel = $('.kit-carta__panel:not([hidden])', cartaEl);
  const n = panel ? $$('.kit-item', panel).length : 0;
  if (!cab.isConnected || cab.nextElementSibling !== $('.kit-carta__panel', cartaEl)) cartaEl.insertBefore(cab, $('.kit-carta__panel', cartaEl));
  $('.carta__sec', cab).textContent = tabs[on]?.textContent || 'Cafe.';
  $('.carta__meta', cab).textContent = (META[cat] || ((k) => `${k} opciones`))(n);
  carta.dataset.tono = TONO[cat] || 'papel';
  panel?.classList.toggle('es-largo', LARGOS.has(cat));
  const prev = tabs[on - 1], next = tabs[on + 1];
  const [bp, bn] = $$('[data-mover]');
  bp.style.visibility = prev ? '' : 'hidden'; bn.style.visibility = next ? '' : 'hidden';
  $('[data-prev]').textContent = prev ? prev.textContent : 'Anterior';
  $('[data-next]').textContent = next ? next.textContent : 'Siguiente';
  const items = panel ? $$('.kit-item', panel) : [];
  const def = items.find(i => i.dataset.photo);
  if (def) seleccionar(def, false); else fotoAside(FOTO_CAT[cat], tabs[on]?.textContent || '');
}
function fotoAside(src, nombre) {
  const img = $('.carta__foto img'), cap = $('.carta__foto-n');
  if (!src || img.getAttribute('src') === src) { cap.textContent = nombre; return; }
  img.classList.add('is-cambia');
  const pre = new Image(); pre.src = src;
  const listo = () => { img.src = src; cap.textContent = nombre; requestAnimationFrame(() => img.classList.remove('is-cambia')); };
  pre.decode ? pre.decode().then(listo, listo) : (pre.onload = listo);
}
function seleccionar(item, marcar = true) {
  if (!item) return;
  const p = productos.get(item.dataset.id); if (!p) return;
  $$('.it.is-sel', cartaEl).forEach(x => x.classList.remove('is-sel'));
  if (marcar) item.classList.add('is-sel');
  if (p.foto) fotoAside(kit.asset(p.foto), p.nombre + '.');
}
function onCarta(e) {
  (e.detail.productos || []).forEach(p => productos.set(p.id, p));
  if (e.detail.el === cartaEl) pintarCabecera();
  if (e.detail.el?.id === 'estante') armarEstante(e.detail.el);
}
cartaEl.addEventListener('click', (e) => {
  if (e.target.closest('.kit-tab')) { requestAnimationFrame(pintarCabecera); return; }
  const foto = e.target.closest('[data-foto]');
  if (foto) { lightbox(foto.dataset.foto, foto.dataset.nombre); return; }
  const it = e.target.closest('.kit-item');
  if (it && !e.target.closest('button, a')) seleccionar(it);
});
let hovT = 0;
cartaEl.addEventListener('pointerover', (e) => {
  if (!hoverFino.matches) return;
  const it = e.target.closest('.kit-item'); if (!it || !it.dataset.photo) return;
  clearTimeout(hovT); hovT = setTimeout(() => seleccionar(it), 70);
});
$$('[data-mover]').forEach(b => b.addEventListener('click', () => {
  const tabs = $$('.kit-tab', cartaEl); const on = tabs.findIndex(t => t.classList.contains('is-on'));
  const dest = tabs[on + Number(b.dataset.mover)]; if (!dest) return;
  dest.click();
  const tabsEl = $('.kit-tabs', cartaEl);
  if (tabsEl && !desktop.matches) tabsEl.scrollTo({ left: dest.offsetLeft - 20, behavior: calma ? 'auto' : 'smooth' });
  const y = cab.getBoundingClientRect().top;
  if (y < 0 || y > innerHeight * .6) scrollTo({ top: scrollY + y - (desktop.matches ? 120 : 150), behavior: calma ? 'auto' : 'smooth' });
}));
// la pestaña activa siempre a la vista (celu)
cartaEl.addEventListener('click', (e) => {
  const t = e.target.closest('.kit-tab'); const tabsEl = $('.kit-tabs', cartaEl);
  if (t && tabsEl && !desktop.matches) tabsEl.scrollTo({ left: t.offsetLeft - 20, behavior: calma ? 'auto' : 'smooth' });
});

// ---------- lightbox
const lb = $('.lb');
function lightbox(src, nombre) {
  $('img', lb).src = src; $('img', lb).alt = nombre || ''; $('figcaption', lb).textContent = nombre ? nombre + '.' : '';
  lb.hidden = false; bloquear(true); $('.lb__x', lb).focus();
}
function cerrarLb() { if (lb.hidden) return; lb.hidden = true; bloquear(false); }
lb.addEventListener('click', (e) => { if (e.target.closest('[data-lb-cerrar]')) cerrarLb(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarLb(); });

// =========================================================
// ESTANTE DE BOLSAS: dar vuelta + arrastre con el mouse
// =========================================================
function armarEstante(el) {
  const panel = $('.kit-carta__panel', el); if (!panel) return;
  if (!$('.bolsa--foto', panel)) {
    const f = document.createElement('figure'); f.className = 'bolsa--foto';
    f.innerHTML = '<img src="img/f/granos-s.webp" srcset="img/f/granos-s.webp 380w, img/f/granos.webp 720w" sizes="(min-width: 1024px) 300px, 74vw" alt="Granos de Puerto Blest en su bolsa" width="720" height="1280" loading="lazy" decoding="async">';
    panel.appendChild(f);
  }
  arrastrable(panel);
}
document.addEventListener('click', (e) => {
  const cara = e.target.closest('[data-girar]'); if (!cara) return;
  if (e.target.closest('button, a, .kit-qty, [data-kit-qty]')) return;
  const panel = cara.closest('.kit-carta__panel');
  if (panel?.dataset.arrastro === '1') return;
  cara.closest('.bolsa')?.classList.toggle('is-vuelta');
});
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.bolsa')) { e.preventDefault(); e.target.classList.toggle('is-vuelta'); }
});
// arrastre con el mouse en cualquier fila deslizable (el dedo usa el scroll nativo)
function arrastrable(fila) {
  if (fila.dataset.drag) return; fila.dataset.drag = '1';
  let x0 = 0, s0 = 0, activo = false, movio = false, v = 0, lx = 0, lt = 0;
  fila.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || fila.scrollWidth <= fila.clientWidth + 2) return;
    if (e.target.closest('button, a, input, .kit-qty')) return;
    activo = true; movio = false; x0 = lx = e.clientX; s0 = fila.scrollLeft; lt = performance.now(); v = 0;
  });
  addEventListener('pointermove', (e) => {
    if (!activo) return;
    const dx = e.clientX - x0;
    if (!movio && Math.abs(dx) > 5) { movio = true; fila.classList.add('is-drag'); fila.setPointerCapture?.(e.pointerId); }
    if (!movio) return;
    e.preventDefault();
    const now = performance.now(); v = (e.clientX - lx) / Math.max(1, now - lt); lx = e.clientX; lt = now;
    fila.scrollLeft = s0 - dx;
  });
  addEventListener('pointerup', () => {
    if (!activo) return; activo = false;
    if (movio) {
      fila.dataset.arrastro = '1'; setTimeout(() => { fila.dataset.arrastro = ''; }, 60);
      let vel = -v * 16; const paso = () => { if (Math.abs(vel) < .5) { fila.classList.remove('is-drag'); return; } fila.scrollLeft += vel; vel *= .92; requestAnimationFrame(paso); };
      requestAnimationFrame(paso);
    }
  });
  fila.addEventListener('dragstart', (e) => e.preventDefault());
}

// =========================================================
// LA RECETA: la balanza
// =========================================================
const receta = (() => {
  const rango = $('#dosis'), val = $('[data-dosis-val]'), pasosEl = $('[data-pasos]');
  const lcdAgua = $('[data-lcd-agua]'), lcdT = $('[data-lcd-tiempo]'), lcdLbl = $('[data-lcd-lbl]');
  const btn = $('[data-timer]'), reset = $('[data-reset]'), bal = $('.balanza');
  let dosis = 18, ratio = 16, t = 0, corriendo = false, raf = 0, tAnt = 0, pasoOn = -1;
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  function pasos() {
    const total = dosis * ratio, bloom = dosis * 2;
    return [
      { n: 'Bloom', hasta: bloom, desde: 0, fin: 45, txt: `${bloom} g` },
      { n: 'Vertido', hasta: Math.round(total * .6), desde: 45, fin: 75, txt: `${Math.round(total * .6)} g` },
      { n: 'Vertido', hasta: total, desde: 75, fin: 105, txt: `${total} g` },
      { n: 'Drenado', hasta: total, desde: 105, fin: 180, txt: 'esperá' },
    ];
  }
  function pintar() {
    const ps = pasos(), total = dosis * ratio;
    val.textContent = `${dosis} g`; rango.value = dosis;
    pasosEl.innerHTML = ps.map((p, i) => `<li data-i="${i}"><span>${i + 1} · ${p.n}<small>${mmss(p.desde)} a ${mmss(p.fin)}</small></span><span>${p.n === 'Drenado' ? p.txt : 'hasta ' + p.txt}</span><i class="barrita"></i></li>`).join('');
    pasoOn = -1;
    if (!corriendo && t === 0) { lcdLbl.textContent = 'Agua total'; lcdAgua.textContent = `${total} g`; lcdT.textContent = '3:00'; }
    else tick(true);
  }
  function tick(forzar) {
    const ps = pasos();
    const i = ps.findIndex(p => t < p.fin); const idx = i === -1 ? ps.length : i;
    if (idx !== pasoOn || forzar) {
      if (idx !== pasoOn && pasoOn !== -1 && idx < ps.length) navigator.vibrate?.(40);
      pasoOn = idx;
      $$('li', pasosEl).forEach((li, k) => { li.classList.toggle('is-on', k === idx); li.classList.toggle('is-ok', k < idx); });
    }
    const p = ps[Math.min(idx, ps.length - 1)];
    const li = $$('li', pasosEl)[idx];
    if (li) $('.barrita', li).style.width = `${Math.min(100, (t - p.desde) / (p.fin - p.desde) * 100)}%`;
    lcdT.textContent = mmss(t);
    if (idx >= ps.length) {
      lcdLbl.textContent = '¡Listo!'; lcdAgua.textContent = `${dosis * ratio} g`;
      parar(); btn.textContent = 'Otra vez'; return;
    }
    lcdLbl.textContent = `Verter ${p.n === 'Drenado' ? '· esperá' : 'hasta'}`;
    lcdAgua.textContent = `${p.hasta} g`;
  }
  function loop(now) { t += (now - tAnt) / 1000; tAnt = now; tick(); if (corriendo) raf = requestAnimationFrame(loop); }
  function arrancar() { if (t >= 180) t = 0; corriendo = true; tAnt = performance.now(); bal.classList.add('is-corre'); btn.textContent = 'Pausar'; reset.hidden = false; raf = requestAnimationFrame(loop); }
  function parar() { corriendo = false; cancelAnimationFrame(raf); bal.classList.remove('is-corre'); if (t < 180) btn.textContent = 'Seguir'; }
  btn.addEventListener('click', () => { if (corriendo) parar(); else { if (t >= 180) { t = 0; pintar(); } arrancar(); } });
  reset.addEventListener('click', () => { parar(); t = 0; reset.hidden = true; btn.textContent = 'Empezar el timer'; pintar(); });
  const setDosis = (d) => { dosis = Math.max(10, Math.min(40, d)); pintar(); };
  $$('[data-dosis]').forEach(b => b.addEventListener('click', () => setDosis(dosis + Number(b.dataset.dosis))));
  rango.addEventListener('input', () => setDosis(Number(rango.value)));
  $$('input[name="ratio"]').forEach(r => r.addEventListener('change', () => { ratio = Number(r.value); pintar(); }));
  pintar();
  return { pintar };
})();

// =========================================================
// EL LUGAR: mazo de fotos (celu) / galería (desktop)
// =========================================================
(function mazo() {
  const el = $('[data-mazo]'); if (!el) return;
  let orden = $$('.foto', el);
  const pintar = () => { if (desktop.matches) { orden.forEach(f => { f.style.zIndex = ''; }); return; } orden.forEach((f, i) => { f.style.zIndex = String(orden.length - i); f.style.transform = `rotate(${i === 0 ? 0 : getComputedStyle(f).getPropertyValue('--r')}) translateY(${Math.min(i, 3) * 6}px)`; }); };
  orden.forEach(f => { f.style.transform = ''; });
  pintar();
  function sacar(f, dx = 1) {
    f.classList.add('is-sale'); f.style.transform = `translateX(${dx * 130}%) rotate(${dx * 18}deg)`;
    setTimeout(() => { f.classList.remove('is-sale'); orden = [...orden.slice(1), f]; el.appendChild(f); orden.forEach(x => { if (x !== f) return; x.style.transition = 'none'; }); pintar(); requestAnimationFrame(() => { f.style.transition = ''; }); }, 380);
  }
  $('[data-mazo-sig]')?.addEventListener('click', () => { if (!desktop.matches) sacar(orden[0], 1); });
  let x0 = 0, y0 = 0, arrastra = null, dx = 0;
  el.addEventListener('pointerdown', (e) => {
    if (desktop.matches) return;
    const f = e.target.closest('.foto'); if (f !== orden[0]) return;
    arrastra = f; x0 = e.clientX; y0 = e.clientY; dx = 0; f.setPointerCapture?.(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (!arrastra) return;
    dx = e.clientX - x0; const dy = e.clientY - y0;
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    arrastra.classList.add('is-arrastra');
    arrastra.style.transform = `translateX(${dx}px) rotate(${dx / 16}deg)`;
  });
  const soltar = () => {
    if (!arrastra) return; const f = arrastra; arrastra = null; f.classList.remove('is-arrastra');
    if (Math.abs(dx) > 80) sacar(f, Math.sign(dx)); else pintar();
  };
  el.addEventListener('pointerup', soltar); el.addEventListener('pointercancel', soltar);
  el.addEventListener('click', (e) => {
    if (!desktop.matches) return;
    const f = e.target.closest('.foto'); if (!f) return;
    const img = $('img', f); lightbox(img.currentSrc || img.src, img.alt);
  });
  desktop.addEventListener?.('change', pintar);
})();

// =========================================================
// ABIERTO AHORA + mapa diferido
// =========================================================
(function estado() {
  const est = kit.abierto ? kit.abierto() : null;
  const dias = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short' }).format(new Date());
  const hoy = dias[['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd)];
  $$('.horas li').forEach(li => li.classList.toggle('is-hoy', li.dataset.dias.split(',').includes(hoy)));
  if (!est) return;
  const txt = est.abierto ? `Abierto ahora · hasta las ${est.cierra} hs` : (est.abre ? `Cerrado ahora · abre a las ${est.abre} hs` : 'Cerrado ahora');
  $$('[data-estado]').forEach(el => { el.classList.toggle('is-abierto', !!est.abierto); $('span', el).textContent = txt; });
})();
const mapa = $('.donde__mapa iframe');
if (mapa && io) {
  const om = new IntersectionObserver((ents) => { if (ents.some(e => e.isIntersecting)) { mapa.src = mapa.dataset.src; om.disconnect(); } }, { rootMargin: '400px 0px' });
  om.observe(mapa);
} else if (mapa) mapa.src = mapa.dataset.src;

// =========================================================
// CONTADOR DE LA BOLSITA
// =========================================================
function pintarContador() {
  const n = (kit.carrito?.calc().items || []).reduce((s, i) => s + i.cant, 0);
  const b = $('.top__n'); b.textContent = n; b.classList.toggle('is-on', n > 0);
  $('.top__bolsa').setAttribute('aria-label', n ? `Ver tu bolsita (${n})` : 'Ver tu bolsita');
}
document.addEventListener('kit:carrito', pintarContador);
kit.carrito?.listo?.then?.(pintarContador);
pintarContador();

// eventos de la carta que llegaron mientras arrancaba el kit
alCarta = onCarta;
pendientes.splice(0).forEach(onCarta);
document.addEventListener('kit:destacados', () => { kit.cartas?.find(c => c.el.id === 'estante')?.recargar(); });
