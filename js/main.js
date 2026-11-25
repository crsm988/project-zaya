/* Protecția și corecția vederii — interactivitate
   Proiect la fizică, clasa a IX-a · Realizat de Buga Mădălina */
(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const NS = 'http://www.w3.org/2000/svg';

  /** număr în format românesc: virgulă zecimală și semnul minus tipografic */
  function fmt(n, digits = 1) {
    const s = Math.abs(n).toFixed(digits).replace('.', ',');
    return (n < 0 && Math.abs(n) >= Math.pow(10, -digits) / 2 ? '−' : '') + s;
  }
  function fmtSigned(n, digits = 2) {
    return (n > 0 ? '+' : '') + fmt(n, digits);
  }
  function el(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  /* ---------------- Meniu mobil ---------------- */
  const toggle = $('.nav-toggle');
  const nav = $('#meniu');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---------------- Link activ în meniu ---------------- */
  const links = $$('.nav a');
  const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.classList.remove('is-active'));
          const a = byId.get(e.target.id);
          if (a) a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });

    /* apariție la derulare */
    const targets = $$('.section__head, .card, .defect, .disease, .myth, .timeline, .rule2020, .stat, .problem');
    targets.forEach(t => t.classList.add('reveal'));
    const rv = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); rv.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(t => rv.observe(t));
  }

  /* ---------------- Acomodarea în funcție de vârstă ---------------- */
  const age = $('#age');
  if (age) {
    const update = () => {
      const a = +age.value;
      const amp = Math.max(0.5, 18.5 - 0.3 * a);          // dioptrii (Hofstetter, medie)
      const ppCm = 100 / amp;                               // punctum proximum
      let add = 2.5 - amp / 2;                              // 40 cm → 2,5 δ, cu jumătate din acomodare în rezervă
      add = Math.round(add * 4) / 4;
      $('#ageOut').textContent = a;
      $('#ampOut').textContent = fmt(amp, 1) + ' δ';
      $('#ppOut').textContent = ppCm >= 100 ? fmt(ppCm / 100, 1) + ' m' : Math.round(ppCm) + ' cm';
      $('#addOut').textContent = add > 0 ? '≈ +' + fmt(add, 2) + ' δ' : 'nu sunt necesari';
      $('#ppDot').style.left = Math.min(98, Math.max(4, ppCm)) + '%';
    };
    age.addEventListener('input', update);
    update();
  }

  /* ---------------- Simulator optic ---------------- */
  const sim = {
    type: 'miop',
    delta: 4,
    glasses: false,
    P_EYE: 60,          // dioptrii
    D_GLASS: 12,        // mm, distanța ochelari–ochi
    S: 21,              // px pe mm
    LENS_X: 350,
    CY: 170,
    HEIGHTS: [-80, -40, 40, 80] // px, înălțimea razelor incidente
  };
  const svg = $('#simSvg');

  function drawSim() {
    if (!svg) return;
    const gEye = $('#simEye'), gRays = $('#simRays'), gGl = $('#simGlasses'), gLab = $('#simLabels');
    [gEye, gRays, gGl, gLab].forEach(g => { while (g.firstChild) g.removeChild(g.firstChild); });

    const { S, LENS_X, CY, D_GLASS } = sim;
    const fe = 1000 / sim.P_EYE;                         // mm
    const dEff = sim.type === 'normal' ? 0 : sim.delta;
    // miopie axială: ochi mai lung; hipermetropie axială: ochi mai scurt
    const L = sim.type === 'miop' ? 1000 / (sim.P_EYE - dEff)
            : sim.type === 'hiper' ? 1000 / (sim.P_EYE + dEff)
            : fe;
    const X = mm => LENS_X + mm * S;
    const retinaX = X(L);

    // lentila de corecție (mm). x1 = obiectul pentru ochi, fc = x1 + d
    let fc = null, Pc = 0;
    const useGlasses = sim.glasses && sim.type !== 'normal';
    if (useGlasses) {
      const inv = 1 / L - 1 / fe;
      const x1 = 1 / inv;
      fc = x1 + D_GLASS;
      Pc = 1000 / fc;
    }

    /* axa optică */
    el('line', { x1: 0, y1: CY, x2: 800, y2: CY, class: 's-axis' }, gEye);

    /* globul ocular */
    const front = LENS_X - 20;
    const rx = (retinaX - front) / 2, cx = front + rx, ry = 122;
    el('ellipse', { cx, cy: CY, rx, ry, class: 's-globe' }, gEye);
    const th = Math.PI / 3;
    el('path', {
      d: `M ${cx + rx * Math.cos(th)} ${CY - ry * Math.sin(th)} A ${rx} ${ry} 0 0 1 ${cx + rx * Math.cos(th)} ${CY + ry * Math.sin(th)}`,
      class: 's-retina'
    }, gEye);
    el('path', { d: `M ${front + 8} ${CY - 70} Q ${front - 22} ${CY} ${front + 8} ${CY + 70}`, class: 's-cornea' }, gEye);
    el('ellipse', { cx: LENS_X, cy: CY, rx: 9, ry: 56, class: 's-lens' }, gEye);

    /* razele */
    const startX = 10;
    let focusMm = null;
    sim.HEIGHTS.forEach(hp => {
      const h0 = -hp / S;            // mm, pozitiv în sus
      const pts = [[startX, CY + hp]];
      let h = h0, slope = 0, x = -D_GLASS;
      if (useGlasses) {
        const gx = X(-D_GLASS);
        pts.push([gx, CY - h * S]);
        slope = -h / fc;
        h = h + slope * D_GLASS;
      }
      pts.push([LENS_X, CY - h * S]);
      slope = slope - h / fe;
      x = 0;
      const zero = -h / slope;       // mm după lentila ochiului
      focusMm = zero;
      const hRet = h + slope * L;
      pts.push([retinaX, CY - hRet * S]);
      el('polyline', { points: pts.map(p => p.join(',')).join(' '), class: 's-ray' }, gRays);
      if (zero > L) {
        // focarul este în spatele retinei: continuare punctată
        const ext = Math.min(zero + 1.5, (800 - LENS_X) / S);
        el('line', { x1: retinaX, y1: CY - hRet * S, x2: X(ext), y2: CY - (h + slope * ext) * S, class: 's-ray s-ray--ghost' }, gRays);
      }
      void x;
    });

    const residual = Math.abs(focusMm - L);              // mm
    const ok = residual < 0.08;
    if (focusMm !== null && isFinite(focusMm)) {
      const fx = X(focusMm);
      if (fx < 800) el('circle', { cx: fx, cy: CY, r: 6, class: ok ? 's-focus s-focus--ok' : 's-focus' }, gRays);
    }

    /* ochelarii */
    if (useGlasses) {
      const gx = X(-D_GLASS), H = 100;
      const t = Math.min(26, 6 + Math.abs(Pc) * 2.2);
      const d = Pc > 0
        ? `M ${gx} ${CY - H} Q ${gx + t} ${CY} ${gx} ${CY + H} Q ${gx - t} ${CY} ${gx} ${CY - H} Z`
        : `M ${gx - 6 - t / 2} ${CY - H} H ${gx + 6 + t / 2} Q ${gx + 4} ${CY} ${gx + 6 + t / 2} ${CY + H} H ${gx - 6 - t / 2} Q ${gx - 4} ${CY} ${gx - 6 - t / 2} ${CY - H} Z`;
      el('path', { d, class: 's-glass ' + (Pc > 0 ? 's-glass--conv' : 's-glass--div') }, gGl);
      const lab = el('text', { x: gx, y: CY - H - 14, 'text-anchor': 'middle', class: 's-label s-label--strong' }, gLab);
      lab.textContent = (Pc > 0 ? 'Lentilă convergentă ' : 'Lentilă divergentă ') + fmtSigned(Pc, 1) + ' δ';
    }

    /* etichete */
    const t1 = el('text', { x: LENS_X, y: CY + 150 - 10 + 18, 'text-anchor': 'middle', class: 's-label' }, gLab);
    t1.textContent = 'cornee + cristalin';
    const t2 = el('text', { x: retinaX - 4, y: 30, 'text-anchor': 'end', class: 's-label' }, gLab);
    t2.textContent = 'retina';
    const t3 = el('text', { x: 14, y: 30, class: 's-label' }, gLab);
    t3.textContent = 'lumină de la un obiect îndepărtat →';

    /* previzualizare și mesaj */
    let blur = 0;
    if (!ok) {
      // diametrul petei de difuzie pe retină, transformat în neclaritate vizuală
      blur = Math.min(7, 0.4 + Math.abs(1000 / L - sim.P_EYE) * 0.8);
      if (useGlasses) blur = 0;
    }
    $('#simPreview .sim-preview__letters').style.filter = blur ? `blur(${blur.toFixed(1)}px)` : 'none';

    let msg;
    if (sim.type === 'normal') {
      msg = 'Ochi emetrop: razele paralele se întâlnesc exact pe retină. Imaginea este clară, nu sunt necesari ochelari.';
    } else if (useGlasses) {
      msg = `Cu ochelari de ${fmtSigned(Pc, 2)} δ focarul ajunge pe retină — imaginea devine clară. ` +
            `(Lentila alipită ar avea ${fmtSigned(sim.type === 'miop' ? -sim.delta : sim.delta, 1)} δ; la 12 mm de ochi valoarea diferă puțin.)`;
    } else if (sim.type === 'miop') {
      msg = 'Ochi miop: imaginea se formează în fața retinei, iar pe retină ajunge o pată neclară. Pune ochelarii!';
    } else {
      msg = 'Ochi hipermetrop: imaginea s-ar forma în spatele retinei. Un ochi tânăr poate compensa prin acomodare, dar obosește.';
    }
    $('#simStatus').textContent = msg;
  }

  if (svg) {
    $$('.simulator .segmented button').forEach(b => b.addEventListener('click', () => {
      $$('.simulator .segmented button').forEach(x => x.setAttribute('aria-checked', 'false'));
      b.setAttribute('aria-checked', 'true');
      sim.type = b.dataset.type;
      $('#sevWrap').classList.toggle('is-disabled', sim.type === 'normal');
      $('#glasses').disabled = sim.type === 'normal';
      drawSim();
    }));
    $('#severity').addEventListener('input', e => {
      sim.delta = +e.target.value;
      $('#sevOut').textContent = fmt(sim.delta, 1);
      drawSim();
    });
    $('#glasses').addEventListener('change', e => { sim.glasses = e.target.checked; drawSim(); });
    drawSim();
  }

  /* ---------------- Calculator de dioptrii ---------------- */
  const calcInput = $('#calcInput');
  if (calcInput) {
    let mode = 'miop';
    const run = () => {
      const d = parseFloat(String(calcInput.value).replace(',', '.'));
      const out = $('#calcOut'), ex = $('#calcExplain');
      if (!(d > 0)) { out.textContent = '—'; ex.textContent = 'introdu o distanță pozitivă'; return; }
      if (mode === 'miop') {
        const C = -100 / d;
        out.textContent = fmtSigned(C, 2) + ' δ';
        ex.textContent = 'divergentă, f = ' + fmt(-d, 0) + ' cm';
      } else {
        const C = 4 - 100 / d;
        if (C <= 0.01) {
          out.textContent = '0 δ';
          ex.textContent = 'PP ≤ 25 cm: poate citi fără lentile';
        } else {
          out.textContent = fmtSigned(C, 2) + ' δ';
          ex.textContent = 'convergentă, f = ' + fmt(100 / C, 1) + ' cm';
        }
      }
    };
    $$('#calculator .segmented button').forEach(b => b.addEventListener('click', () => {
      $$('#calculator .segmented button').forEach(x => x.setAttribute('aria-checked', 'false'));
      b.setAttribute('aria-checked', 'true');
      mode = b.dataset.calc;
      $('#calcLabel').textContent = mode === 'miop'
        ? 'Distanța până la punctum remotum (cm)'
        : 'Distanța până la punctum proximum (cm)';
      calcInput.value = mode === 'miop' ? 50 : 100;
      run();
    }));
    calcInput.addEventListener('input', run);
    run();
  }

  /* ---------------- Filtru maladii ---------------- */
  $$('.filter .chip').forEach(c => c.addEventListener('click', () => {
    $$('.filter .chip').forEach(x => x.classList.remove('is-active'));
    c.classList.add('is-active');
    const f = c.dataset.filter;
    $$('.disease').forEach(d => d.classList.toggle('is-hidden', f !== 'toate' && d.dataset.cat !== f));
  }));

  /* ---------------- Obiceiuri (salvate local) ---------------- */
  const KEY = 'vedere-obiceiuri';
  const boxes = $$('#habits input');
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { saved = []; }
  boxes.forEach(b => { if (saved.includes(b.dataset.h)) b.checked = true; });
  const score = () => {
    const n = boxes.filter(b => b.checked).length;
    const pct = Math.round(n / boxes.length * 100);
    const bar = $('#habitBar'); if (bar) bar.style.width = pct + '%';
    const msg = $('#habitMsg');
    if (msg) {
      msg.textContent = n === 0 ? 'Bifează obiceiurile pe care le ai deja.'
        : n < 5 ? `${n} din ${boxes.length} — e un început, mai sunt multe de câștigat.`
        : n < 10 ? `${n} din ${boxes.length} — foarte bine, ochii tăi îți mulțumesc!`
        : `${n} din ${boxes.length} — excelent! Ești un exemplu de protecție a vederii.`;
    }
    try { localStorage.setItem(KEY, JSON.stringify(boxes.filter(b => b.checked).map(b => b.dataset.h))); } catch (e) { /* ignorăm */ }
  };
  boxes.forEach(b => b.addEventListener('change', score));
  if (boxes.length) score();

  /* ---------------- Test ---------------- */
  const QUIZ = [
    { q: 'Din punct de vedere optic, ochiul uman se comportă ca:', o: ['o lentilă divergentă', 'o lentilă convergentă', 'o oglindă plană', 'o prismă'], a: 1,
      e: 'Corneea și cristalinul formează un sistem convergent de aproximativ 60 δ.' },
    { q: 'La un ochi miop, imaginea unui obiect îndepărtat se formează:', o: ['pe retină', 'în spatele retinei', 'în fața retinei', 'pe cristalin'], a: 2,
      e: 'Ochiul miop este prea convergent (sau prea lung), deci focarul cade înaintea retinei.' },
    { q: 'Miopia se corectează cu lentile:', o: ['convergente', 'divergente', 'cilindrice', 'fotocromatice'], a: 1,
      e: 'Lentila divergentă scade convergența totală și mută imaginea înapoi, pe retină.' },
    { q: 'Ce convergență are o lentilă cu distanța focală f = 50 cm?', o: ['0,5 δ', '50 δ', '2 δ', '−2 δ'], a: 2,
      e: 'C = 1/f = 1/0,5 m = 2 m⁻¹ = 2 δ.' },
    { q: 'Care parte a ochiului are cea mai mare contribuție la refracția luminii?', o: ['corneea', 'cristalinul', 'retina', 'irisul'], a: 0,
      e: 'Corneea (≈ 40–43 δ), deoarece aici lumina trece din aer în țesut, cu diferența cea mai mare de indice de refracție.' },
    { q: 'Prezbiopia apare deoarece:', o: ['globul ocular se alungește', 'corneea devine neregulată', 'cristalinul își pierde elasticitatea', 'retina se dezlipește'], a: 2,
      e: 'Cu vârsta, cristalinul devine rigid și acomodarea scade, iar punctum proximum se îndepărtează.' },
    { q: 'Imaginea formată pe retină este:', o: ['virtuală, dreaptă, mărită', 'reală, răsturnată, micșorată', 'reală, dreaptă, micșorată', 'virtuală, răsturnată, mărită'], a: 1,
      e: 'Obiectul se află dincolo de dublul distanței focale, deci imaginea este reală, răsturnată și mai mică; creierul o „întoarce”.' },
    { q: 'Unitatea de măsură a convergenței unei lentile este:', o: ['metrul', 'dioptria', 'lux-ul', 'candela'], a: 1,
      e: '1 dioptrie (δ) = 1 m⁻¹.' },
    { q: 'Ce boală este legată de creșterea presiunii din interiorul ochiului?', o: ['cataracta', 'conjunctivita', 'daltonismul', 'glaucomul'], a: 3,
      e: 'Glaucomul afectează nervul optic din cauza presiunii intraoculare crescute.' },
    { q: 'Un hipermetrop are punctum proximum la 50 cm. Ce lentilă îi trebuie pentru a citi la 25 cm?', o: ['+2 δ', '−2 δ', '+4 δ', '+0,5 δ'], a: 0,
      e: 'C = 1/0,25 − 1/0,5 = 4 − 2 = +2 δ (lentilă convergentă).' }
  ];
  const quizBox = $('#quizBox');
  if (quizBox) {
    let i = 0, right = 0;
    const render = () => {
      quizBox.innerHTML = '';
      if (i >= QUIZ.length) {
        const pct = right / QUIZ.length;
        const verdict = pct === 1 ? 'Perfect! Știi totul despre vedere.'
          : pct >= .7 ? 'Foarte bine! Ai înțeles fizica ochiului.'
          : pct >= .4 ? 'Bine, dar mai citește o dată secțiunile despre defecte și corecție.'
          : 'Mai parcurge proiectul și încearcă din nou.';
        quizBox.innerHTML = `<div class="quiz__result"><p>Rezultatul tău</p><div class="quiz__score">${right}/${QUIZ.length}</div><p>${verdict}</p><button class="btn btn--primary quiz__next" type="button">Reia testul</button></div>`;
        $('.quiz__next', quizBox).addEventListener('click', () => { i = 0; right = 0; render(); });
        return;
      }
      const item = QUIZ[i];
      const wrap = document.createElement('div');
      wrap.innerHTML = `<div class="quiz__top"><span>Întrebarea ${i + 1} din ${QUIZ.length}</span><span>Corecte: ${right}</span></div>
        <div class="progress"><div class="progress__bar" style="width:${(i / QUIZ.length) * 100}%"></div></div>
        <p class="quiz__q" style="margin-top:18px"></p><div class="quiz__opts"></div>`;
      $('.quiz__q', wrap).textContent = item.q;
      const opts = $('.quiz__opts', wrap);
      item.o.forEach((txt, k) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'quiz__opt'; b.textContent = txt;
        b.addEventListener('click', () => {
          $$('.quiz__opt', opts).forEach(x => { x.disabled = true; });
          opts.children[item.a].classList.add('is-right');
          if (k === item.a) right++; else b.classList.add('is-wrong');
          const fb = document.createElement('p');
          fb.className = 'quiz__feedback';
          fb.textContent = (k === item.a ? 'Corect! ' : 'Greșit. ') + item.e;
          wrap.appendChild(fb);
          const next = document.createElement('button');
          next.type = 'button'; next.className = 'btn btn--primary quiz__next';
          next.textContent = i + 1 < QUIZ.length ? 'Următoarea întrebare →' : 'Vezi rezultatul';
          next.addEventListener('click', () => { i++; render(); });
          wrap.appendChild(next);
          next.focus();
        });
        opts.appendChild(b);
      });
      quizBox.appendChild(wrap);
    };
    render();
  }
})();
