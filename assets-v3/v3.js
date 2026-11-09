// tomberthet.fr v3 (brouillon). S'ajoute à assets/site.js et assets/monde.js.
// 1. Objets aimantés : un objet ne bouge que quand la souris s'en approche, et vient doucement vers elle
//    (remplace le suivi de la souris par tous les objets du ciel).
// 2. Carrousel des services : flèches précédent / suivant, et glisser à la souris.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (fine && !reduce) {
    document.documentElement.classList.add('magnet');
    const els = [...document.querySelectorAll('.isle, .fl, .dusk .dusk-max, .nuit .moon')];
    const pull = new Map(els.map(el => [el, { x: 0, y: 0 }]));
    let mx = -1e4, my = -1e4, queued = false;
    const frame = () => {
      queued = false;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width || r.bottom < -200 || r.top > innerHeight + 200) return;
        const p = pull.get(el);
        // Centre « au repos » : on retire le décalage déjà appliqué
        const cx = r.left + r.width / 2 - p.x, cy = r.top + r.height / 2 - p.y;
        const dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy);
        const R = Math.max(170, r.width * 1.2);
        const f = d < R ? (1 - d / R) : 0;
        const max = Math.min(22, r.width * .14);
        const k = f * f * (3 - 2 * f);            // départ et arrivée en douceur
        p.x = d ? dx / d * max * k : 0; p.y = d ? dy / d * max * k : 0;
        el.style.setProperty('--ax', p.x.toFixed(1) + 'px');
        el.style.setProperty('--ay', p.y.toFixed(1) + 'px');
      });
    };
    const tick = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; tick(); }, { passive: true });
    document.addEventListener('pointerleave', () => { mx = my = -1e4; tick(); });
  }

  document.querySelectorAll('[data-rail]').forEach(box => {
    const rail = box.querySelector('.rail');
    const prev = box.querySelector('[data-prev]'), next = box.querySelector('[data-next]');
    if (!rail || !prev || !next) return;
    const step = () => (rail.querySelector('li')?.getBoundingClientRect().width || 240) + 16;
    const sync = () => {
      prev.disabled = rail.scrollLeft < 4;
      next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 4;
    };
    prev.addEventListener('click', () => rail.scrollBy({ left: -step() * 2, behavior: reduce ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => rail.scrollBy({ left: step() * 2, behavior: reduce ? 'auto' : 'smooth' }));
    rail.addEventListener('scroll', sync, { passive: true });
    // Glisser à la souris (le doigt et le pavé tactile défilent déjà nativement)
    let down = null, moved = false;
    rail.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = { x: e.clientX, left: rail.scrollLeft }; moved = false;
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (!moved && Math.abs(dx) > 4) { moved = true; rail.classList.add('dragging'); }
      if (moved) { rail.scrollLeft = down.left - dx; e.preventDefault(); }
    });
    const end = () => {
      if (!down) return;
      down = null;
      if (!moved) return;
      // On garde la position, puis on laisse l'aimantation caler la carte la plus proche
      const left = rail.scrollLeft;
      rail.classList.remove('dragging');
      rail.scrollLeft = left;
      const s = step(), target = Math.round(left / s) * s;
      rail.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' });
    };
    addEventListener('pointerup', end);
    addEventListener('pointercancel', end);
    rail.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    rail.addEventListener('dragstart', e => e.preventDefault());
    addEventListener('resize', sync);
    sync();
  });
})();

// 3. Arrivée sur une page : ce qui est déjà à l'écran s'affiche tout de suite, sans attendre le défilement.
(() => {
  const now = () => document.querySelectorAll('[data-r]:not(.in)').forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight * 1.05) {
      el.style.transition = 'none'; el.style.animation = 'none'; el.classList.add('in');
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = ''; el.style.animation = ''; }));
    }
  });
  now(); addEventListener('load', now, { once: true });
})();

// 4. Aide « ? » du formulaire et bulles du carrousel : au toucher, un appui ouvre, un autre ferme.
document.addEventListener('click', e => {
  const tip = e.target.closest('.tip');
  document.querySelectorAll('.tip.open').forEach(t => { if (t !== tip) t.classList.remove('open'); });
  if (tip) { e.preventDefault(); tip.classList.toggle('open'); }
  const li = e.target.closest('.rail li');
  document.querySelectorAll('.rail li.open').forEach(l => { if (l !== li) l.classList.remove('open'); });
  if (li && !matchMedia('(hover:hover)').matches) li.classList.toggle('open');
});
