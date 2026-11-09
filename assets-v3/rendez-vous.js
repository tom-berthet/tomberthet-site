// Page Prendre rendez-vous : calendrier Cal.com intégré (code d'intégration standard de Cal.com).
// Si le calendrier ne se charge pas, un bouton ouvre la page de réservation directement.
(() => {
  const box = document.getElementById('cal-inline');
  const wait = document.getElementById('cal-wait');
  const link = (window.RDV && window.RDV.calLink || '').trim();
  if (!box) return;
  if (!link) { box.hidden = true; return; }        // pas encore branché : on garde le message d'attente
  const direct = document.getElementById('cal-direct');
  if (direct) { direct.href = 'https://cal.com/' + link; direct.hidden = false; }
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, 'https://app.cal.com/embed/embed.js', 'init');
  Cal('init', 'rdv', { origin: 'https://cal.com' });
  Cal.ns.rdv('inline', { elementOrSelector: '#cal-inline', calLink: link, config: { layout: 'month_view', theme: 'light' } });
  Cal.ns.rdv('ui', { hideEventTypeDetails: false, layout: 'month_view', styles: { branding: { brandColor: '#111113' } } });
  if (wait) wait.hidden = true;
  // Sécurité : si rien ne s'affiche après 8 secondes, on remontre le message avec le lien direct
  setTimeout(() => { if (!box.querySelector('iframe') && wait) wait.hidden = false; }, 8000);
})();
