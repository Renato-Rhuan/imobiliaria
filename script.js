document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Interações de interface (sem GSAP) ---------- */
  $('#year').textContent = new Date().getFullYear();

  // Menu mobile
  const drawer = $('#drawer'), burger = $('#menu-open');
  const setDrawer = (open) => {
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(true));
  $('#menu-close').addEventListener('click', () => setDrawer(false));
  drawer.addEventListener('click', (e) => { if (e.target === drawer || e.target.closest('a')) setDrawer(false); });

  // WhatsApp
  const waBtn = $('#wa-toggle'), waModal = $('#wa-modal');
  const setWA = (open) => {
    waModal.classList.toggle('open', open);
    waModal.setAttribute('aria-hidden', String(!open));
    waBtn.setAttribute('aria-expanded', String(open));
  };
  waBtn.addEventListener('click', (e) => { e.stopPropagation(); setWA(!waModal.classList.contains('open')); });
  $('#wa-close').addEventListener('click', () => setWA(false));
  document.addEventListener('click', (e) => { if (!waModal.contains(e.target)) setWA(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setWA(false); setDrawer(false); } });

  // Formulário
  $('#lead-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Obrigado! Um dos nossos consultores entrará em contato em instantes.');
    e.target.reset();
  });

  // Header com fundo ao rolar
  const header = $('#header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- GSAP ---------- */
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero: 3 fotos com crossfade + zoom suave */
  const slides = $$('.hero-slide');
  const nums = $$('.count span');
  const bar = $('.bar span');
  const DUR = 6, FADE = 1.6;
  let cur = 0, busy = false, timer;

  gsap.set(slides, { autoAlpha: 0, zIndex: 0 });
  gsap.set(slides[0], { autoAlpha: 1, zIndex: 1 });

  const zoom = (i) => reduce || gsap.fromTo($('img', slides[i]), { scale: 1.14 }, { scale: 1, duration: DUR + FADE + 1, ease: 'none' });

  const run = () => {
    if (reduce) return;
    timer && timer.kill();
    gsap.set(bar, { scaleX: 0 });
    timer = gsap.to(bar, { scaleX: 1, duration: DUR, ease: 'none', onComplete: () => go(cur + 1) });
  };

  const go = (n) => {
    n = (n + slides.length) % slides.length;
    if (busy || n === cur) return;
    busy = true;
    const from = slides[cur], to = slides[n];
    gsap.set(to, { zIndex: 2 });
    gsap.set(from, { zIndex: 1 });
    gsap.to(to, { autoAlpha: 1, duration: reduce ? 0 : FADE, ease: 'power2.inOut' });
    gsap.to(from, {
      autoAlpha: 0, duration: reduce ? 0 : FADE, ease: 'power2.inOut',
      onComplete: () => { busy = false; gsap.set(from, { zIndex: 0 }); }
    });
    zoom(n);
    nums.forEach((el, i) => el.classList.toggle('on', i === n));
    cur = n;
    run();
  };

  $('#next').addEventListener('click', () => go(cur + 1));
  $('#prev').addEventListener('click', () => go(cur - 1));
  zoom(0);
  run();

  // Pausa quando o hero sai da tela
  ScrollTrigger.create({
    trigger: '#hero', start: 'top top', end: 'bottom top',
    onLeave: () => timer && timer.pause(), onEnterBack: () => timer && timer.resume()
  });

  if (reduce) return;

  /* Entrada do hero (única sequência orquestrada) */
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: .2 });
  intro
    .from('.header', { yPercent: -100, autoAlpha: 0, duration: .9 })
    .from('.hero .eyebrow', { y: 20, autoAlpha: 0, duration: .8 }, '-=.5')
    .from('.hero-title .line > span', { yPercent: 110, duration: 1.1, stagger: .12 }, '-=.5')
    .from('.swoosh', { scaleX: 0, transformOrigin: 'left', duration: .9 }, '-=.6')
    .from('.hero-p, .hero .cta-round', { y: 24, autoAlpha: 0, duration: .8, stagger: .12 }, '-=.6')
    .from('.hero-sign span', { clipPath: 'inset(0 100% 0 0)', duration: 1.1, stagger: .35, ease: 'power2.inOut' }, '-=.4')
    .from('.hero-foot', { y: 30, autoAlpha: 0, duration: .9 }, '-=.8');

  /* Revelações no scroll */
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el.children, {
      y: 36, autoAlpha: 0, duration: .9, stagger: .1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });
  $$('[data-stagger]').forEach((el) => {
    gsap.from(el.children, {
      y: 48, autoAlpha: 0, duration: .9, stagger: .15, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  // Imagens dos cards: revelação com máscara
  $$('.card-img img').forEach((img) => {
    gsap.from(img, {
      scale: 1.25, duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: img, start: 'top 90%', once: true }
    });
  });

  // Parallax (about e CTA)
  gsap.to('.about-img img', {
    yPercent: 8, ease: 'none',
    scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true }
  });
  gsap.to('.cta-bg', {
    yPercent: 10, ease: 'none',
    scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  // Contadores
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('pt-BR'); }
    });
  });
});
