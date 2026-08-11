/* =====================================================================
   TERRA REHBER — app.js  (MOTOR KATMANI)
   ---------------------------------------------------------------------
   Bu dosya içerik barındırmaz. Tüm metinler, adımlar, bölgeler ve
   terimler data.js içindedir. Yeni içerik eklemek için buraya
   dokunmana gerek yoktur.

   Sorumluluklar
     · durum yönetimi (dil, seviye, bölge, seçimler, geçmiş)
     · koşullu dallanma (showIf sağlanmayan adımları atlar)
     · seviyeye duyarlı metin seçimi (b / i / a)
     · bölgeye duyarlı koordinat sistemi tabloları
     · panel geçiş animasyonları
     · tooltip, ilerleme göstergesi, karar kaydı
   ===================================================================== */

'use strict';

/* ===================== DURUM ===================== */

const state = {
  lang: 'tr',
  currentId: 'welcome',
  history: [],
  /* Seçimlerin kaydı: adım id'si → seçenek id'si */
  answers: {},
  /* Sıralı karar kaydı (sondaki reçete için) */
  log: [],
  /* Seçimlerin ayarladığı değişkenler (choice.set ile) */
  vars: { level: 'i', region: 'global' },
  processToken: 0,
};

/* ===================== YARDIMCILAR ===================== */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function ms(varName, fallback) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function accentVar(name) {
  return `var(--${name || 'amber'})`;
}

/** Adımın i18n bloğunu geçerli dilde döndürür */
function t(step) {
  return step.i18n ? step.i18n[state.lang] : {};
}

/** Seviyeye göre gövde metnini seçer; eksikse orta seviyeye düşer */
function bodyForLevel(bodyObj) {
  if (typeof bodyObj === 'string') return bodyObj;
  if (!bodyObj) return '';
  return bodyObj[state.vars.level] || bodyObj.i || bodyObj.b || '';
}

/** Bir adımın cta metnini iki olası konumdan da okur */
function ctaText(step) {
  const local = t(step);
  if (local && local.cta) return local.cta;
  if (step.cta && step.cta[state.lang]) return step.cta[state.lang];
  return state.lang === 'tr' ? 'Devam' : 'Continue';
}

/* ===================== KOŞULLU DALLANMA ===================== */

/**
 * Hedef adımdan başlayarak showIf koşulunu sağlamayan adımları atlar.
 * Böylece içerikte koşul tanımlamak, akışı elle yönetmeyi gerektirmez.
 */
function resolveNext(id) {
  let guard = 0;
  let cursor = id;
  while (cursor && guard < 50) {
    const step = STEPS[cursor];
    if (!step) return null;
    if (typeof step.showIf === 'function' && !step.showIf(state.vars)) {
      cursor = step.next;
      guard += 1;
      continue;
    }
    return cursor;
  }
  return cursor;
}

/* ===================== TERİM BAĞLAMA ===================== */

/** Metindeki [[anahtar]] işaretlerini tooltip'li terimlere çevirir */
function linkGlossary(text) {
  if (!text) return '';
  return text.replace(/\[\[([a-z_]+)\]\]/g, (match, key) => {
    const entry = GLOSSARY[key];
    if (!entry) return match;
    const term = entry[state.lang].term;
    return `<span class="term">${esc(term)}<button type="button" class="term-info" data-glossary="${key}" aria-label="${esc(term)}">?</button></span>`;
  });
}

/** Bir metinde geçen terim anahtarlarını sırayla toplar */
function collectTerms(text) {
  const found = [];
  const re = /\[\[([a-z_]+)\]\]/g;
  let m;
  while ((m = re.exec(text || '')) !== null) {
    if (GLOSSARY[m[1]] && !found.includes(m[1])) found.push(m[1]);
  }
  return found;
}

/** Başlangıç seviyesinde adım altına açık terim şeridi basar */
function termStrip(text) {
  if (state.vars.level !== 'b') return '';
  const keys = collectTerms(text);
  if (!keys.length) return '';
  const ui = UI[state.lang];
  const items = keys.map((k) => {
    const g = GLOSSARY[k][state.lang];
    return `<li><strong>${esc(g.term)}</strong><span>${esc(g.simple)}</span></li>`;
  }).join('');
  return `<div class="term-strip">
    <p class="box-title"><i class="ph ph-book-open-text" aria-hidden="true"></i>${esc(ui.termsTitle)}</p>
    <ul>${items}</ul>
  </div>`;
}

/* ===================== PARÇA ÜRETİCİLERİ ===================== */

function visualBlock(step) {
  if (!step.visual) return '';
  if (step.visual === 'processing') {
    return `<div class="visual-box"><div class="visual-grid" aria-hidden="true"></div>
      <div class="radar-scope" aria-hidden="true">
        <span class="radar-ring r1"></span><span class="radar-ring r2"></span>
        <span class="radar-sweep"></span><span class="radar-core"></span>
      </div></div>`;
  }
  const svg = VISUALS[step.visual];
  if (!svg) return '';
  return `<div class="visual-box"><div class="visual-grid" aria-hidden="true"></div>${svg}</div>`;
}

function proBlock(step) {
  /* Teknik not kutusu yalnızca ileri seviyede açılır */
  if (state.vars.level !== 'a') return '';
  const local = t(step);
  if (!local.pro) return '';
  const ui = UI[state.lang];
  return `<div class="pro-box">
    <p class="box-title"><i class="ph ph-function" aria-hidden="true"></i>${esc(ui.proTitle)}</p>
    <p>${linkGlossary(esc(local.pro))}</p>
  </div>`;
}

function checklistBlock(step) {
  /* Tıkla-yap listesi ileri seviyede gizlenir */
  if (state.vars.level === 'a') return '';
  const local = t(step);
  if (!local.checklist || !local.checklist.length) return '';
  const ui = UI[state.lang];
  const items = local.checklist.map((line, i) => `
    <li><label><input type="checkbox" data-check="${i}"><span class="tick" aria-hidden="true"><i class="ph ph-check"></i></span><span class="check-text">${esc(line)}</span></label></li>`).join('');
  return `<div class="checklist">
    <p class="box-title"><i class="ph ph-list-checks" aria-hidden="true"></i>${esc(ui.checklistTitle)}</p>
    <ul>${items}</ul>
  </div>`;
}

function choiceCards(step, stepId) {
  const ui = UI[state.lang];
  const cards = step.choices.map((choice) => {
    const c = choice.i18n[state.lang];
    const impact = (c.impact || []).map((line) => `<li>${esc(line)}</li>`).join('');
    const impactBlock = impact ? `
      <span class="impact">
        <span class="impact-title">${esc(ui.impactTitle)}</span>
        <ul>${impact}</ul>
      </span>` : '';
    const warnBlock = c.warn ? `
      <span class="warn">
        <i class="ph ph-warning" aria-hidden="true"></i>
        <span><strong>${esc(ui.warnTitle)}:</strong> ${esc(c.warn)}</span>
      </span>` : '';
    return `<button type="button" class="choice-card" style="--card-accent:${accentVar(choice.accent)}"
              data-choice-step="${esc(stepId)}" data-choice-id="${esc(choice.id)}">
      <span class="choice-head">
        <span class="choice-icon"><i class="ph ${esc(choice.icon)}" aria-hidden="true"></i></span>
        <span class="choice-heading">
          <span class="choice-title">${esc(c.title)}</span>
          <span class="choice-desc">${esc(c.desc)}</span>
        </span>
      </span>
      ${impactBlock}
      ${warnBlock}
      <span class="choice-go"><span>${state.lang === 'tr' ? 'Bunu seç' : 'Choose this'}</span><i class="ph ph-arrow-right" aria-hidden="true"></i></span>
    </button>`;
  }).join('');
  return `<div class="choice-grid">${cards}</div>`;
}

/* ---- Bölgeye duyarlı koordinat sistemi tablosu ---- */

function crsBlock() {
  const ui = UI[state.lang];
  const region = REGIONS[state.vars.region] || REGIONS.global;
  const rn = region.i18n[state.lang];
  const h = region.horizontal.i18n[state.lang];
  const v = region.vertical.i18n[state.lang];

  const rows = region.horizontal.systems.map((sys) => `
    <tr>
      <td><button type="button" class="epsg" data-copy="${esc(sys.epsg)}" title="${esc(ui.crsCopy)}">${esc(sys.epsg)}<i class="ph ph-copy" aria-hidden="true"></i></button></td>
      <td class="crs-name">${esc(sys.name)}</td>
      <td class="crs-note">${esc(sys.note[state.lang])}</td>
    </tr>`).join('');

  const tips = region.tips.map((tip) => `<li>${esc(tip[state.lang])}</li>`).join('');

  return `<div class="crs-panel">
    <div class="crs-region">
      <span class="crs-region-icon"><i class="ph ${esc(region.icon)}" aria-hidden="true"></i></span>
      <span class="crs-region-text"><strong>${esc(rn.name)}</strong><em>${esc(rn.sub)}</em></span>
    </div>

    <section class="crs-section">
      <h3><i class="ph ph-grid-four" aria-hidden="true"></i>${esc(ui.crsHorizontal)}</h3>
      <p class="crs-datum">${esc(h.datum)}</p>
      <p class="crs-pick">${esc(h.pick)}</p>
      <div class="crs-table-wrap">
        <table class="crs-table"><tbody>${rows}</tbody></table>
      </div>
    </section>

    <section class="crs-section">
      <h3><i class="ph ph-arrows-vertical" aria-hidden="true"></i>${esc(ui.crsVertical)}</h3>
      <p class="crs-datum">${esc(v.datum)}</p>
      <p class="crs-pick">${esc(v.detail)}</p>
      <div class="terra-note"><i class="ph ph-lightbulb" aria-hidden="true"></i><span>${esc(v.terra)}</span></div>
    </section>

    <section class="crs-section">
      <h3><i class="ph ph-warning-diamond" aria-hidden="true"></i>${esc(ui.crsTips)}</h3>
      <ul class="crs-tips">${tips}</ul>
    </section>
  </div>`;
}

/* ---- Karar kaydı (bitiş reçetesi) ---- */

function decisionLog() {
  const ui = UI[state.lang];
  if (!state.log.length) return `<p class="body-text">${esc(ui.logEmpty)}</p>`;

  const rows = state.log.map((entry) => {
    const step = STEPS[entry.stepId];
    if (!step || !step.choices) return '';
    const choice = step.choices.find((c) => c.id === entry.choiceId);
    if (!choice) return '';
    const c = choice.i18n[state.lang];
    const s = t(step);
    const first = (c.impact && c.impact[0]) ? `<span class="log-why">${esc(c.impact[0])}</span>` : '';
    return `<li style="--card-accent:${accentVar(choice.accent)}">
      <span class="log-icon"><i class="ph ${esc(choice.icon)}" aria-hidden="true"></i></span>
      <span class="log-body">
        <span class="log-q">${esc(s.title || '')}</span>
        <span class="log-a">${esc(c.title)}</span>
        ${first}
      </span>
    </li>`;
  }).join('');

  return `<div class="log-box">
    <p class="box-title"><i class="ph ph-path" aria-hidden="true"></i>${esc(ui.logTitle)}</p>
    <ol class="log-list">${rows}</ol>
  </div>`;
}

/* ===================== PANEL İÇERİĞİ ===================== */

function panelHTML(stepId) {
  const step = STEPS[stepId];
  const local = t(step);
  const bodyRaw = bodyForLevel(local.body);
  const body = `<p class="body-text">${linkGlossary(esc(bodyRaw))}</p>`;
  const head = `
    <p class="eyebrow">${esc(local.eyebrow || '')}</p>
    <h2 class="step-title${step.type === 'welcome' ? ' step-title--hero' : ''}">${esc(local.title || '')}</h2>`;

  switch (step.type) {

    case 'welcome':
      return `${head}${visualBlock(step)}${body}
        <div class="welcome-actions">
          <button type="button" class="btn-primary" data-next="${esc(step.next)}">${esc(ctaText(step))}<i class="ph ph-arrow-right" aria-hidden="true"></i></button>
          <span class="meta-text">${esc(local.meta || '')}</span>
        </div>`;

    case 'choice':
      return `${head}${visualBlock(step)}${body}${termStrip(bodyRaw)}${proBlock(step)}${choiceCards(step, stepId)}`;

    case 'content':
      return `${head}${visualBlock(step)}${body}${termStrip(bodyRaw)}${proBlock(step)}${checklistBlock(step)}
        <div class="step-actions">
          <button type="button" class="btn-primary" data-next="${esc(step.next)}">${esc(ctaText(step))}<i class="ph ph-arrow-right" aria-hidden="true"></i></button>
        </div>`;

    case 'crs':
      return `${head}${body}${termStrip(bodyRaw)}${proBlock(step)}${crsBlock()}${checklistBlock(step)}
        <div class="step-actions">
          <button type="button" class="btn-primary" data-next="${esc(step.next)}">${esc(ctaText(step))}<i class="ph ph-arrow-right" aria-hidden="true"></i></button>
        </div>`;

    case 'process':
      return `${head}${visualBlock(step)}${body}
        <div class="process-status">
          <div class="process-track"><span class="process-fill" data-fill></span></div>
          <div class="process-readout"><span data-status>${esc(local.working)}…</span><span class="process-pct" data-pct>0%</span></div>
        </div>
        <div class="step-actions">
          <button type="button" class="btn-primary is-hidden" data-next="${esc(step.next)}" data-process-cta>${esc(local.cta)}<i class="ph ph-arrow-right" aria-hidden="true"></i></button>
        </div>`;

    case 'complete': {
      const ui = UI[state.lang];
      return `${head}${visualBlock(step)}${body}${decisionLog()}
        <div class="step-actions step-actions--split">
          <button type="button" class="btn-primary" data-action="restart">${esc(local.restart)}<i class="ph ph-arrow-counter-clockwise" aria-hidden="true"></i></button>
          <button type="button" class="btn-ghost" data-action="print"><i class="ph ph-printer" aria-hidden="true"></i>${esc(ui.printBtn)}</button>
        </div>`;
    }

    default:
      return head + body;
  }
}

/* ===================== GEÇİŞ MOTORU ===================== */

const viewport = () => $('#stepViewport');
const currentPanel = () => viewport().querySelector('.step-panel');

function mountStep(stepId, dir) {
  const step = STEPS[stepId];
  const panel = document.createElement('div');
  panel.className = 'step-panel';
  panel.dataset.enter = dir === 'back' ? 'from-top' : 'from-bottom';
  panel.style.setProperty('--step-accent', accentVar(step.accent));
  panel.innerHTML = panelHTML(stepId);
  viewport().appendChild(panel);

  requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('is-active')));

  bindPanel(panel, stepId);
  if (step.type === 'process') runProcess(panel, step);
  pulseCorners();
  return panel;
}

function transitionTo(nextId, dir) {
  const old = currentPanel();
  const leave = ms('--t-leave', 260);
  if (old) {
    old.classList.remove('is-active');
    old.classList.add('is-leaving');
    old.dataset.leave = dir === 'back' ? 'to-bottom' : 'to-top';
    setTimeout(() => old.remove(), leave);
  }
  setTimeout(() => {
    mountStep(nextId, dir);
    updateChrome();
    scrollTop();
  }, old ? Math.min(leave, 160) : 0);
}

function scrollTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

function goTo(rawId) {
  const nextId = resolveNext(rawId);
  if (!nextId || !STEPS[nextId]) return;
  state.history.push(state.currentId);
  state.currentId = nextId;
  transitionTo(nextId, 'forward');
}

function goBack() {
  if (!state.history.length) return;
  const prev = state.history.pop();
  /* Geri dönerken o adımda verilen kararı kayıttan düşür */
  state.log = state.log.filter((e) => e.stepId !== prev);
  state.currentId = prev;
  transitionTo(prev, 'back');
}

function restart() {
  state.history = [];
  state.answers = {};
  state.log = [];
  state.vars = { level: state.vars.level, region: state.vars.region };
  state.currentId = 'welcome';
  transitionTo('welcome', 'forward');
}

/** Dil veya seviye değişiminde mevcut paneli yerinde yeniden çizer */
function rerender() {
  const old = currentPanel();
  if (!old) return;
  const stepId = state.currentId;
  old.classList.add('is-fading');
  setTimeout(() => {
    old.innerHTML = panelHTML(stepId);
    bindPanel(old, stepId);
    const step = STEPS[stepId];
    if (step.type === 'process') finishProcess(old, step, true);
    old.classList.remove('is-fading');
  }, ms('--t-lang', 180));
}

function pulseCorners() {
  const el = $('#console');
  if (!el) return;
  el.classList.remove('is-pulsing');
  void el.offsetWidth;
  el.classList.add('is-pulsing');
}

/* ===================== İŞLEME ANİMASYONU ===================== */

function runProcess(panel, step) {
  const token = ++state.processToken;
  const fill = panel.querySelector('[data-fill]');
  const pct = panel.querySelector('[data-pct]');
  const duration = 2600;
  const start = performance.now();

  function frame(now) {
    if (token !== state.processToken) return;
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const value = Math.round(eased * 100);
    if (fill) fill.style.width = value + '%';
    if (pct) pct.textContent = value + '%';
    if (p < 1) requestAnimationFrame(frame);
    else finishProcess(panel, step, false, token);
  }
  requestAnimationFrame(frame);
}

function finishProcess(panel, step, instant, token) {
  if (!instant && token !== state.processToken) return;
  const local = t(step);
  const fill = panel.querySelector('[data-fill]');
  const pct = panel.querySelector('[data-pct]');
  const status = panel.querySelector('[data-status]');
  const cta = panel.querySelector('[data-process-cta]');
  if (fill) fill.style.width = '100%';
  if (pct) pct.textContent = '100%';
  if (status) status.textContent = local.done;
  panel.classList.add('is-done');
  if (cta) cta.classList.remove('is-hidden');
}

/* ===================== OLAY BAĞLAMA ===================== */

function bindPanel(panel, stepId) {
  panel.querySelectorAll('[data-next]').forEach((btn) => {
    btn.addEventListener('click', () => goTo(btn.dataset.next));
  });

  const restartBtn = panel.querySelector('[data-action="restart"]');
  if (restartBtn) restartBtn.addEventListener('click', restart);

  const printBtn = panel.querySelector('[data-action="print"]');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  panel.querySelectorAll('.choice-card').forEach((card) => {
    card.addEventListener('click', () => {
      const sId = card.dataset.choiceStep;
      const cId = card.dataset.choiceId;
      const step = STEPS[sId];
      const choice = step.choices.find((c) => c.id === cId);
      if (!choice) return;

      state.answers[sId] = cId;
      if (choice.set) Object.assign(state.vars, choice.set);

      /* Aynı adım için önceki kaydı düşür, yenisini ekle */
      state.log = state.log.filter((e) => e.stepId !== sId);
      state.log.push({ stepId: sId, choiceId: cId });

      /* Seviye seçimi anında arayüze yansısın */
      if (choice.set && choice.set.level) syncLevelToggle();

      goTo(choice.next);
    });
  });

  /* EPSG kodu kopyalama */
  panel.querySelectorAll('.epsg').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const done = () => {
        btn.classList.add('is-copied');
        setTimeout(() => btn.classList.remove('is-copied'), 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(btn.dataset.copy).then(done).catch(done);
      } else {
        done();
      }
    });
  });

  /* Kontrol listesi işaretleme */
  panel.querySelectorAll('.checklist input[type="checkbox"]').forEach((box) => {
    box.addEventListener('change', () => {
      box.closest('li').classList.toggle('is-done', box.checked);
    });
  });
}

/* ===================== ÜST BAR ===================== */

function updateChrome() {
  const step = STEPS[state.currentId];
  const ui = UI[state.lang];

  $('#backBtn').classList.toggle('is-visible', state.history.length > 0);

  const wrap = $('#progressWrap');
  if (typeof step.phase === 'number') {
    wrap.classList.add('is-visible');
    $('#progressTrack').innerHTML = ui.phases.map((label, i) => `
      <span class="phase${i < step.phase ? ' is-past' : ''}${i === step.phase ? ' is-current' : ''}">
        <span class="phase-dot"></span><span class="phase-label">${esc(label)}</span>
      </span>`).join('');
  } else {
    wrap.classList.remove('is-visible');
  }

  /* Seviye anahtarı yalnızca seviye seçildikten sonra görünür */
  $('#levelToggle').classList.toggle('is-visible',
    state.currentId !== 'welcome' && state.currentId !== 'level');
}

function applyChrome() {
  const ui = UI[state.lang];
  document.documentElement.setAttribute('lang', ui.htmlLang);
  $('#brandName').textContent = ui.brandName;
  $('#brandTag').textContent = ui.brandTag;
  $('#backLabel').textContent = ui.back;
  const lt = $('#langToggle');
  lt.dataset.lang = state.lang;
  lt.setAttribute('aria-label', state.lang === 'tr' ? 'Switch to English' : 'Türkçeye geç');
  syncLevelToggle();
}

function syncLevelToggle() {
  const ui = UI[state.lang];
  $$('#levelToggle .lvl').forEach((btn) => {
    const active = btn.dataset.level === state.vars.level;
    btn.classList.toggle('is-on', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    btn.setAttribute('title', ui.levelBadge[btn.dataset.level]);
  });
}

function setLang(lang) {
  if (lang === state.lang) return;
  state.lang = lang;
  applyChrome();
  rerender();
  updateChrome();
  hideTooltip();
}

function setLevel(level) {
  if (level === state.vars.level) return;
  state.vars.level = level;
  syncLevelToggle();
  rerender();
  hideTooltip();
}

/* ===================== TOOLTIP ===================== */

let tipTimer = null;

function showTooltip(btn) {
  const bubble = $('#tooltipBubble');
  const entry = GLOSSARY[btn.dataset.glossary];
  if (!entry) return;
  const g = entry[state.lang];
  /* Başlangıç seviyesinde sade tanım, diğerlerinde teknik tanım */
  const text = state.vars.level === 'b' ? g.simple : g.def;
  bubble.innerHTML = `<strong>${esc(g.term)}</strong><span>${esc(text)}</span>`;
  bubble.classList.add('is-visible');

  const r = btn.getBoundingClientRect();
  const w = Math.min(300, window.innerWidth - 24);
  bubble.style.width = w + 'px';
  let left = r.left + r.width / 2 - w / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - w - 12));
  bubble.style.left = left + 'px';
  bubble.style.setProperty('--arrow-offset', (r.left + r.width / 2 - left) + 'px');

  /* Üstte yer yoksa balonu aşağı aç */
  const h = bubble.offsetHeight;
  if (r.top - h - 14 < 8) {
    bubble.classList.add('is-below');
    bubble.style.top = (r.bottom + 12) + 'px';
  } else {
    bubble.classList.remove('is-below');
    bubble.style.top = (r.top - 12) + 'px';
  }
}

function hideTooltip() {
  $('#tooltipBubble').classList.remove('is-visible');
}

function initTooltips() {
  document.addEventListener('mouseover', (e) => {
    const btn = e.target.closest('.term-info');
    if (btn) { clearTimeout(tipTimer); showTooltip(btn); }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.term-info')) tipTimer = setTimeout(hideTooltip, 140);
  });
  document.addEventListener('focusin', (e) => {
    const btn = e.target.closest('.term-info');
    if (btn) showTooltip(btn);
  });
  document.addEventListener('focusout', (e) => {
    if (e.target.closest('.term-info')) hideTooltip();
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.term-info');
    if (btn) { e.preventDefault(); showTooltip(btn); }
    else if (!e.target.closest('#tooltipBubble')) hideTooltip();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTooltip(); });
  window.addEventListener('scroll', hideTooltip, { passive: true });
}

/* ===================== BAŞLATMA ===================== */

let started = false;

function init() {
  if (started) return;            /* çift tetiklenmeye karşı koru */
  started = true;

  applyChrome();
  mountStep('welcome', 'forward');
  updateChrome();

  $('#backBtn').addEventListener('click', goBack);
  $('#langToggle').addEventListener('click', () => setLang(state.lang === 'tr' ? 'en' : 'tr'));
  $$('#levelToggle .lvl').forEach((btn) => {
    btn.addEventListener('click', () => setLevel(btn.dataset.level));
  });

  initTooltips();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();                          /* script geç yüklendiyse hemen başlat */
}
