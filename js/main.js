/* ==========================================================================
   RÉGLAGES : les seules lignes à modifier au quotidien
   ========================================================================== */

// Nombre de créneaux encore disponibles en décembre.
// À mettre à jour À LA MAIN quand un créneau est pris. 0 = « Décembre complet ».
const CRENEAUX_RESTANTS = 4;

// Fin réelle de l'offre (heure de Paris). Passé ce moment, le bandeau affiche
// automatiquement « Offre terminée, contactez-nous ».
const FIN_OFFRE = new Date('2026-12-31T23:59:59+01:00');

// Pack Lancement local : options incluses et remise appliquée quand elles sont
// toutes sélectionnées (1000 + 190 + 149 = 1339 €, moins 90 € = 1249 €).
// Les prix des options se modifient dans index.html (attributs data-price).
const PACK = { nom: 'Pack Lancement local', options: ['gmb', 'avis'], remise: 90 };

// Adresse d'envoi du formulaire de rappel. Penser à la recopier aussi dans
// l'attribut action="" du <form> dans index.html (fonctionnement sans JS).
// Web3Forms : 'https://api.web3forms.com/submit'   Formspree : 'https://formspree.io/f/XXXXXXX'
const FORM_ENDPOINT = '[FORM_ENDPOINT]';

// Web3Forms uniquement : clé d'accès publique. [À COMPLÉTER : clé Web3Forms]
const WEB3FORMS_ACCESS_KEY = '';

// Numéro du bouton d'appel (barre mobile), format international.
// [À COMPLÉTER : téléphone], ex. '+33600000000'. Vide = le bouton mène au formulaire de rappel.
const TELEPHONE = '';

/* ========================================================================== */

(() => {
  'use strict';
  window.__agzReady = true;

  const html = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  const fine = matchMedia('(pointer: fine)').matches && matchMedia('(hover: hover)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  let lenis = null;

  /* ------------------------------------------------------------------------
     Offre : créneaux + date de fin
     ------------------------------------------------------------------------ */
  function applyOffer() {
    const ended = Date.now() > FIN_OFFRE.getTime();
    const n = Math.max(0, Math.floor(Number(CRENEAUX_RESTANTS) || 0));
    html.classList.toggle('offre-terminee', ended);

    const active = $('[data-promo-active]');
    const over = $('[data-promo-ended]');
    if (active) active.hidden = ended;
    if (over) over.hidden = !ended;
    const promoCta = $('[data-promo-cta]');
    if (promoCta) promoCta.innerHTML = ended ? 'Nous contacter <span aria-hidden="true">→</span>' : 'Réserver <span aria-hidden="true">→</span>';

    $$('[data-creneaux]').forEach((el) => { el.textContent = String(n); });
    const slotsText = $('.promo-slots');
    if (slotsText) {
      if (n === 0) slotsText.textContent = 'Décembre complet';
      else if (n === 1) slotsText.innerHTML = 'Plus qu’<strong data-creneaux>1</strong> créneau en décembre';
    }

    const gauge = $('[data-gauge]');
    const label = $('[data-gauge-label]');
    const slots = $('[data-slots]');
    if (slots) slots.innerHTML = '<i></i>'.repeat(n);
    if (gauge) gauge.classList.toggle('is-full', n === 0 || ended);
    if (label) {
      if (ended) label.textContent = 'Offre terminée : contactez-nous';
      else if (n === 0) label.textContent = 'Décembre complet : demandez à être rappelé';
      else label.textContent = n === 1 ? 'créneau restant en décembre' : 'créneaux restants en décembre';
    }

    const mcta = $('[data-mbar-cta]');
    if (mcta) mcta.textContent = ended ? 'Nous contacter' : 'Réserver · 1000 €';

    // Titre du CTA final : « Plus que 4 créneaux / en décembre. »
    const f1 = $('[data-final-1]');
    const f2 = $('[data-final-2]');
    if (f1 && f2) {
      let l1 = 'Plus que ' + n + ' créneaux';
      let l2 = 'en décembre.';
      if (n === 1) l1 = 'Plus qu’un créneau';
      if (n === 0 || ended) { l1 = 'Parlons de'; l2 = 'votre projet.'; }
      if (f1.dataset.txt !== l1 + l2) {
        f1.dataset.txt = l1 + l2;
        f1.textContent = l1; f2.textContent = l2;
        const t = $('.final-title'); if (t) t.setAttribute('aria-label', l1 + ' ' + l2);
      }
    }
  }
  applyOffer();
  setInterval(applyOffer, 60 * 1000);

  /* ------------------------------------------------------------------------
     Téléphone, liens désactivés
     ------------------------------------------------------------------------ */
  if (TELEPHONE) $$('[data-tel]').forEach((a) => { a.href = 'tel:' + TELEPHONE.replace(/\s/g, ''); });
  $$('a[aria-disabled="true"]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

  /* ------------------------------------------------------------------------
     Options à la carte : sélection, estimation, envoi avec la demande
     ------------------------------------------------------------------------ */
  const selected = new Set();
  const optItems = $$('[data-opt]');
  const euros = (v) => v.toLocaleString('fr-FR') + '\u00a0€';

  function renderOptions() {
    let once = 1000;
    let month = 0;
    let from = false;
    const names = [];
    optItems.forEach((li) => {
      const on = selected.has(li.dataset.opt);
      li.classList.toggle('is-on', on);
      const btn = $('.mi-add', li);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      $('.mi-add-l', btn).textContent = on ? 'Ajouté' : 'Ajouter';
      if (!on) return;
      const price = Number(li.dataset.price) || 0;
      if (li.dataset.unit === 'mois') month += price;
      else once += price;
      if ('replace' in li.dataset) once -= 1000; // le site complet remplace le one page
      if ('from' in li.dataset) from = true;
      names.push(li.dataset.name + (li.dataset.unit === 'mois' ? ' (' + price + ' €/mois)' : ''));
    });
    const pack = PACK.options.every((id) => selected.has(id)) && !selected.has('complet');
    if (pack) once -= PACK.remise;

    const total = (from ? 'à partir de ' : '') + euros(once) + (month ? ' + ' + euros(month) + '/mois' : '');
    const label = names.length
      ? 'Site + ' + names.length + ' option' + (names.length > 1 ? 's' : '') + (pack ? ' · ' + PACK.nom + ' (−' + PACK.remise + ' €)' : '')
      : 'Site one page seul';

    const bc = $('[data-basket-count]'); if (bc) bc.textContent = label;
    const bt = $('[data-basket-total]'); if (bt) bt.textContent = 'Estimation : ' + total;
    const basket = $('[data-basket]'); if (basket) basket.classList.toggle('has-items', names.length > 0);

    const summary = names.join(', ') + (pack ? ' + ' + PACK.nom : '');
    const fo = $('[data-form-options]'); if (fo) fo.value = names.length ? summary + ' | Estimation : ' + total : '';
    const ft = $('[data-form-type]'); if (ft) ft.value = names.length ? 'options' : 'standard';
    const fs = $('[data-form-subject]'); if (fs) fs.value = names.length ? 'Demande de rappel, site + options' : 'Demande de rappel, offre 1000 €';
    const box = $('[data-form-opts]');
    if (box) {
      box.hidden = !names.length;
      $('[data-form-opts-list]', box).textContent = summary;
      $('[data-form-opts-total]', box).textContent = 'Estimation : ' + total;
    }
  }

  optItems.forEach((li) => {
    $('.mi-add', li).addEventListener('click', () => {
      const id = li.dataset.opt;
      if (selected.has(id)) selected.delete(id); else selected.add(id);
      renderOptions();
    });
  });
  $$('[data-pack]').forEach((b) => b.addEventListener('click', () => {
    b.dataset.pack.split(',').forEach((id) => selected.add(id.trim()));
    selected.delete('complet');
    renderOptions();
    const basket = $('[data-basket]');
    if (basket && window.gsap && !reduced) gsap.fromTo(basket, { scale: .96 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .5)' });
  }));
  // Compatibilité avec l'ancien lien ?type=premium
  if (new URLSearchParams(location.search).get('type') === 'premium') selected.add('complet');
  renderOptions();

  /* ------------------------------------------------------------------------
     Formulaire de rappel
     ------------------------------------------------------------------------ */
  const form = $('[data-form]');
  if (form) {
    const status = $('[data-form-status]');
    const say = (msg, ok) => { status.textContent = msg; status.className = 'form-status ' + (ok ? 'is-ok' : 'is-err'); };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let first = null;
      $$('input[required], textarea[required]', form).forEach((el) => {
        const bad = el.type === 'checkbox' ? !el.checked : !el.value.trim();
        el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad && !first) first = el;
      });
      if (first) { say('Merci de remplir les champs obligatoires et de cocher la case de consentement.', false); first.focus(); return; }
      if (!/^https?:\/\//.test(FORM_ENDPOINT)) {
        say('Le formulaire n’est pas encore branché ([FORM_ENDPOINT] à renseigner dans js/main.js).', false);
        return;
      }
      const data = new FormData(form);
      if (WEB3FORMS_ACCESS_KEY) data.append('access_key', WEB3FORMS_ACCESS_KEY);
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      say('Envoi en cours…', true);
      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.status);
        form.reset(); renderOptions();
        say('Merci, votre demande est bien partie. Vous serez rappelé au numéro indiqué.', true);
      } catch (err) {
        say('L’envoi n’a pas fonctionné. Réessayez dans un instant.', false);
      } finally { btn.disabled = false; }
    });
  }

  /* ------------------------------------------------------------------------
     Modales légales
     ------------------------------------------------------------------------ */
  $$('[data-modal]').forEach((a) => a.addEventListener('click', (e) => {
    const d = document.getElementById(a.dataset.modal);
    if (!d || typeof d.showModal !== 'function') return;
    e.preventDefault();
    d.showModal();
    if (lenis) lenis.stop();
  }));
  $$('dialog.modal').forEach((d) => {
    d.addEventListener('close', () => { if (lenis) lenis.start(); });
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  });

  /* ------------------------------------------------------------------------
     Avant / après
     ------------------------------------------------------------------------ */
  const ba = $('.ba');
  const baRange = $('.ba-range');
  if (ba && baRange) baRange.addEventListener('input', () => ba.style.setProperty('--pos', baRange.value + '%'));

  /* ------------------------------------------------------------------------
     Barre mobile : s'efface quand la section Réserver est à l'écran
     ------------------------------------------------------------------------ */
  const mbar = $('[data-mbar]');
  if (mbar && 'IntersectionObserver' in window) {
    // Masquée sur la réservation et sur les options (le panier prend le relais)
    const visibles = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) visibles.add(en.target); else visibles.delete(en.target); });
      mbar.classList.toggle('is-away', visibles.size > 0);
    }, { rootMargin: '0px 0px -30% 0px' });
    ['#reserver', '#options'].forEach((sel) => { const el = $(sel); if (el) io.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Défilement vers les ancres
     ------------------------------------------------------------------------ */
  function promoOffset() { const p = $('#promo'); return (p ? p.offsetHeight : 0) + 12; }
  function scrollToEl(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -promoOffset(), duration: 1.4 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.dataset.modal || a.getAttribute('href') === '#') return;
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    scrollToEl(el);
    if (el.id === 'reserver' && a.closest('.final, .hero, .nav, .promo, .mbar')) {
      /* rien de plus : simple ancre */
    }
  });

  /* ------------------------------------------------------------------------
     Loader : passable au clic
     ------------------------------------------------------------------------ */
  const loader = $('#loader');
  const loaderShown = !!loader && getComputedStyle(loader).display !== 'none';
  if (loader) {
    loader.addEventListener('click', () => loader.classList.add('is-done'));
    loader.addEventListener('animationend', (e) => { if (e.animationName === 'loaderOut') loader.classList.add('is-done'); });
  }

  /* ------------------------------------------------------------------------
     FAQ (accordéon natif <details>, animé si possible)
     ------------------------------------------------------------------------ */
  let refreshTimer;
  const softRefresh = () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 120); };
  $$('.qa').forEach((d) => {
    const sum = $('summary', d);
    const body = $('.qa-a', d);
    sum.addEventListener('click', (e) => {
      if (reduced || !hasGsap) { softRefresh(); return; }
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, duration: .45, ease: 'power3.inOut', onComplete: () => { d.open = false; body.style.height = ''; softRefresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: body.scrollHeight, duration: .55, ease: 'power3.out', onComplete: () => { body.style.height = ''; softRefresh(); } });
        gsap.fromTo($('p', body), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .5, delay: .08, ease: 'power2.out' });
      }
    });
  });

  /* ========================================================================
     ANIMATIONS (GSAP). Rien ne s'exécute si mouvement réduit ou GSAP absent.
     ======================================================================== */
  if (!hasGsap) { html.classList.remove('js'); return; }
  if (reduced) {
    $$('.step').forEach((s) => s.classList.add('is-on'));
    const d = $('[data-day]'); if (d) d.textContent = '7';
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Smooth scroll Lenis : desktop uniquement */
  if (window.Lenis && fine && !isTouch) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* Découpe des titres en mots */
  $$('.split').forEach((el) => {
    const words = el.textContent.trim().split(' ');
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w) => '<span class="w" aria-hidden="true"><span>' + w + '</span></span>').join(' ');
  });

  /* ---------------- Hero : intro ---------------- */
  const stageTilt = $('.stage-tilt');
  const phone = $('.mock-phone');
  const baseTilt = { y: -14, x: 6 };
  gsap.set(stageTilt, { rotationY: baseTilt.y, rotationX: baseTilt.x });
  gsap.set(phone, { z: 90 });

  const counters = () => {
    $$('[data-count]').forEach((el, i) => {
      const end = Number(el.dataset.count);
      const o = { v: 0 };
      el.style.display = 'inline-block';
      el.style.minWidth = String(end).length + 'ch';
      el.style.textAlign = 'right';
      gsap.to(o, { v: end, duration: i ? 1.8 : 1.3, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } });
    });
  };

  // L'intro visuelle du hero est en CSS (démarre sans attendre le JS) ; ici, les compteurs.
  gsap.delayedCall(loaderShown ? 1.35 : .65, counters);

  /* Hero : parallaxe au scroll (plans à vitesses différentes) */
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 0, end: 'bottom top', scrub: true, invalidateOnRefresh: true } })
    .to('.hero-copy', { y: -110, opacity: .25, ease: 'none' }, 0)
    .to('.hero-stage', { y: -160, ease: 'none' }, 0)
    .to(phone, { y: -110, ease: 'none' }, 0)
    .to('.hero-grid', { y: 140, ease: 'none' }, 0)
    .to('.hero-glow', { y: 220, scale: 1.2, ease: 'none' }, 0)
    .to('.fig:first-child', { x: () => -Math.min(70, window.innerWidth * .04), ease: 'none' }, 0)
    .to('.fig--price', { x: () => Math.min(70, window.innerWidth * .04), ease: 'none' }, 0);

  /* Hero : rotation 3D au mouvement de la souris */
  if (fine) {
    const rx = gsap.quickTo(stageTilt, 'rotationX', { duration: .9, ease: 'power3' });
    const ry = gsap.quickTo(stageTilt, 'rotationY', { duration: .9, ease: 'power3' });
    const gx = gsap.quickTo('.hero-glow', 'x', { duration: 1.4, ease: 'power3' });
    const hero = $('.hero');
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      ry(baseTilt.y + px * 16);
      rx(baseTilt.x - py * 12);
      gx(px * -80);
    });
    hero.addEventListener('pointerleave', () => { ry(baseTilt.y); rx(baseTilt.x); gx(0); });
  }

  // Le reste est initialisé en petites tâches successives pour ne pas bloquer le fil principal.
  const tasks = [];
  tasks.push(() => {
    /* ---------------- Transitions de sections : les sections claires s'élargissent ---------------- */
    $$('.section.light:not(.is-hidden)').forEach((sec) => {
      gsap.fromTo(sec,
        { clipPath: 'inset(0% 3.5% 0% 3.5% round 44px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 30%', scrub: true } });
    });
  });

  tasks.push(() => {
    /* ---------------- Titres : mots qui montent ---------------- */
    $$('.split').forEach((el) => {
      gsap.fromTo($$('.w > span', el), { yPercent: 115 }, {
        yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: .05,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  });

  tasks.push(() => {
    /* ---------------- Reveals génériques ---------------- */
    $$('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
  });

  tasks.push(() => {
    /* ---------------- Problème : irritants barrés un à un ---------------- */
    $$('.pain').forEach((p) => {
      const s = $('.strike', p);
      gsap.fromTo(p, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 90%', once: true } });
      gsap.fromTo(s, { '--s': '0%' }, {
        '--s': '100%', ease: 'none',
        scrollTrigger: {
          trigger: p, start: 'top 72%', end: 'top 42%', scrub: .6,
          onUpdate: (self) => p.classList.toggle('is-struck', self.progress > .9)
        }
      });
    });
    const punch = $('.punch');
    if (punch) {
      gsap.fromTo($('mark', punch), { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: 1, ease: 'expo.inOut', scrollTrigger: { trigger: punch, start: 'top 80%', once: true } });
      $('mark', punch).style.background = 'linear-gradient(var(--accent), var(--accent)) left / 0% 100% no-repeat';
    }
  });

  tasks.push(() => {
    /* ---------------- Comparatif : lignes une à une ---------------- */
    const cmp = $('.cmp');
    if (cmp) {
      gsap.fromTo($$('thead th', cmp), { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: cmp, start: 'top 82%', once: true } });
      $$('tbody tr', cmp).forEach((row) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 86%', once: true } });
        tl.fromTo(row, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .9, ease: 'expo.out' })
          .fromTo($('.us strong', row), { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: .7, ease: 'expo.out' }, .25);
      });
    }
  });

  tasks.push(() => {
    /* ---------------- Inclus : icônes qui se dessinent ---------------- */
    const feats = $$('[data-feat]');
    feats.forEach((li, i) => {
      const shapes = $$('path, rect, circle', li);
      shapes.forEach((sh) => {
        let len = 200;
        try { len = Math.ceil(sh.getTotalLength()) + 2; } catch (e) { /* rien */ }
        sh.style.strokeDasharray = len;
        sh.style.strokeDashoffset = len;
      });
      const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 88%', once: true }, delay: (i % 3) * .08 });
      tl.fromTo(li, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .9, ease: 'expo.out' })
        .to(shapes, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: .1 }, .1);
    });
  });

  tasks.push(() => {
    /* ---------------- Process : le 7 se remplit au rythme de la semaine (signature) ---------------- */
    const timeline = $('.timeline');
    if (timeline) {
      const seven = $('.seven');
      const lineFill = $('.tl-line span');
      const dayEl = $('[data-day]');
      const steps = $$('.step', timeline);
      const values = [0, 1, 2, 5, 6]; // jour de départ de chaque étape
      let anchors = [];
      const measure = () => {
        const h = timeline.offsetHeight || 1;
        anchors = steps.map((s) => (s.offsetTop + 30) / h);
      };
      measure();
      const dayAt = (p) => {
        if (p >= 1) return 7;
        if (p <= anchors[0]) return 0;
        for (let i = 0; i < anchors.length; i++) {
          const a0 = anchors[i];
          const a1 = i + 1 < anchors.length ? anchors[i + 1] : 1;
          const v0 = values[i];
          const v1 = i + 1 < values.length ? values[i + 1] : 7;
          if (p < a1) return v0 + (v1 - v0) * ((p - a0) / (a1 - a0));
        }
        return 7;
      };
      let lastDay = -1;
      ScrollTrigger.create({
        trigger: timeline, start: 'top 62%', end: 'bottom 62%', scrub: true,
        onRefresh: measure,
        onUpdate: (self) => {
          const p = self.progress;
          const d = dayAt(p);
          lineFill.style.setProperty('--p', p.toFixed(4));
          seven.style.setProperty('--p', (d / 7).toFixed(4));
          steps.forEach((s, i) => s.classList.toggle('is-on', p >= anchors[i] - .005));
          const di = Math.min(7, Math.floor(d + .001));
          if (di !== lastDay) {
            lastDay = di;
            dayEl.textContent = di;
            gsap.fromTo(dayEl, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .35, ease: 'power2.out' });
          }
        }
      });
      gsap.fromTo('.seven', { scale: .86, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.process', start: 'top 70%', once: true } });
    }
  });

  tasks.push(() => {
    /* ---------------- Réalisations : carrousel épinglé (desktop) / swipe (mobile) ---------------- */
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const works = $('.works');
      const track = $('.works-track');
      works.classList.add('is-pinned');
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '.works-pin', pin: true, start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      $$('.work', track).forEach((card) => {
        gsap.fromTo($('img', card), { xPercent: -6, scale: 1.12 }, { xPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        gsap.fromTo(card, { rotation: 3, y: 50 }, { rotation: 0, y: 0, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'left 55%', scrub: true } });
      });
      return () => { works.classList.remove('is-pinned'); gsap.set(track, { clearProps: 'transform' }); };
    });
    mm.add('(max-width: 899px)', () => {
      gsap.fromTo('.work', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.works-track', start: 'top 85%', once: true } });
    });

    /* Avant / après : petit indice de glissement à l'arrivée */
    if (ba) {
      const o = { v: 82 };
      gsap.to(o, {
        v: 50, duration: 1.6, ease: 'expo.inOut',
        scrollTrigger: { trigger: ba, start: 'top 75%', once: true },
        onStart: () => { ba.style.setProperty('--pos', '82%'); },
        onUpdate: () => { ba.style.setProperty('--pos', o.v + '%'); baRange.value = o.v; }
      });
    }
  });

  tasks.push(() => {
    /* ---------------- Qui je suis ---------------- */
    const portrait = $('[data-clip]');
    if (portrait) {
      gsap.fromTo($('.portrait-ph', portrait), { clipPath: 'inset(100% 0% 0% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: portrait, start: 'top 80%', once: true } });
      gsap.fromTo('.portrait-initials', { yPercent: 30 }, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: portrait, start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  });

  tasks.push(() => {
    /* ---------------- Réserver : jauge ---------------- */
    const gauge = $('[data-gauge]');
    if (gauge) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: gauge, start: 'top 85%', once: true } });
      tl.fromTo(gauge, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .9, ease: 'expo.out' })
        .fromTo($$('.gauge-slots i', gauge), { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: .5, stagger: .12, ease: 'power3.out' }, .3);
      gsap.fromTo('.opt', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.book-grid', start: 'top 80%', once: true } });
      gsap.fromTo('.book-steps li', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: .8, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.book-steps', start: 'top 90%', once: true } });
    }
  });

  tasks.push(() => {
    /* ---------------- Options à la carte : lignes du menu ---------------- */
    $$('.menu-col').forEach((col) => {
      gsap.fromTo($$('.menu-h, .mi', col), { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: .9, ease: 'expo.out', stagger: .08,
        scrollTrigger: { trigger: col, start: 'top 85%', once: true }
      });
      $$('.mi-dots', col).forEach((d) => {
        gsap.fromTo(d, { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: d, start: 'top 90%', once: true } });
      });
    });
  });

  tasks.push(() => {
    /* ---------------- CTA final : lettres qui se dressent ---------------- */
    const finalTitle = $('.final-title');
    if (finalTitle) {
      finalTitle.setAttribute('aria-label', finalTitle.textContent.replace(/\s+/g, ' ').trim());
      $$('.final-l', finalTitle).forEach((line) => {
        line.setAttribute('aria-hidden', 'true');
        line.innerHTML = line.textContent.split(' ').map((w) => '<span class="wd">' + Array.from(w).map((c) => '<span class="ch" style="display:inline-block">' + c + '</span>').join('') + '</span>').join(' ');
      });
      gsap.fromTo($$('.ch', finalTitle), { yPercent: 110, rotation: 10, opacity: 0 }, {
        yPercent: 0, rotation: 0, opacity: 1, ease: 'power3.out', stagger: .025,
        scrollTrigger: { trigger: '.final', start: 'top 85%', end: 'top 25%', scrub: .8 }
      });
      gsap.fromTo('.final .btn', { scale: .85, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.final .btn', start: 'top 92%', once: true } });
    }
  });

  tasks.push(() => {
    /* ---------------- Curseur custom + boutons magnétiques (desktop) ---------------- */
    if (fine) {
      html.classList.add('has-cursor');
      const dot = $('.cursor-dot');
      const ring = $('.cursor-ring');
      const dx = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' });
      const dy = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
      const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' });
      const ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
      window.addEventListener('pointermove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); html.classList.remove('cursor-hidden'); }, { passive: true });
      document.addEventListener('pointerleave', () => html.classList.add('cursor-hidden'));
      document.addEventListener('pointerover', (e) => {
        html.classList.toggle('cursor-hover', !!e.target.closest('a, button, summary, label, .ba-range, input, textarea'));
        if (e.target.closest('iframe')) html.classList.add('cursor-hidden');
      });

      $$('.magnetic').forEach((el) => {
        const mx = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3' });
        const my = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3' });
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          mx((e.clientX - (r.left + r.width / 2)) * .28);
          my((e.clientY - (r.top + r.height / 2)) * .38);
        });
        el.addEventListener('pointerleave', () => { mx(0); my(0); });
      });
    }
  });

  const runTasks = () => {
    const t = tasks.shift();
    if (!t) { ScrollTrigger.refresh(); return; }
    t();
    setTimeout(runTasks, 0);
  };
  setTimeout(runTasks, 0);

  /* Recalcul après chargement des polices */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
