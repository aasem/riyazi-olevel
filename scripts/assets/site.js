// Reader settings (script and theme), term tooltips, and print behaviour.
(function () {
  var root = document.documentElement;

  function saved(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function save(key, v) {
    try { localStorage.setItem(key, v); } catch (e) { /* private mode: the choice lasts for this page only */ }
  }
  function fromUrl(name) {
    var m = new RegExp('[?&]' + name + '=([a-z]+)').exec(location.search);
    return m ? m[1] : null;
  }

  // ---- script: Nastaliq or Naskh ----
  function applyScript(v) {
    if (v !== 'naskh') v = 'nastaliq';
    root.setAttribute('data-script', v);
    var buttons = document.querySelectorAll('[data-set-script]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-set-script') === v ? 'true' : 'false');
    }
    var pdf = document.querySelector('[data-pdf]');
    if (pdf) pdf.setAttribute('href', pdf.getAttribute('data-pdf') + '-' + v + '.pdf');
    return v;
  }

  // ---- theme: light or dark; follows the device until the reader chooses ----
  function systemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(v) {
    if (v !== 'dark' && v !== 'light') v = systemTheme();
    root.setAttribute('data-theme', v);
    return v;
  }

  applyScript(fromUrl('script') || saved('riyazi-script'));
  applyTheme(fromUrl('theme') || saved('riyazi-theme'));

  document.addEventListener('DOMContentLoaded', function () {
    applyScript(root.getAttribute('data-script'));

    // ---- term tooltips: English appears on hover, keyboard focus or tap ----
    var tip = document.querySelector('.tip');
    var shown = null;
    function hide() {
      if (tip) tip.hidden = true;
      shown = null;
    }
    function show(el) {
      if (!tip) return;
      tip.textContent = el.getAttribute('data-en');
      tip.hidden = false;
      var r = el.getBoundingClientRect();
      var w = tip.offsetWidth, h = tip.offsetHeight;
      var left = Math.min(Math.max(r.left + r.width / 2 - w / 2, 8), window.innerWidth - w - 8);
      var top = r.top - h - 8;
      if (top < 8) top = r.bottom + 8;
      tip.style.left = left + window.scrollX + 'px';
      tip.style.top = top + window.scrollY + 'px';
      shown = el;
    }
    function termOf(e) {
      return e.target && e.target.closest ? e.target.closest('.term') : null;
    }
    document.addEventListener('mouseover', function (e) { var t = termOf(e); if (t) show(t); });
    document.addEventListener('mouseout', function (e) { if (termOf(e)) hide(); });
    document.addEventListener('focusin', function (e) { var t = termOf(e); if (t) show(t); });
    document.addEventListener('focusout', function (e) { if (termOf(e)) hide(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    window.addEventListener('scroll', hide, { passive: true });

    document.addEventListener('click', function (e) {
      var t = termOf(e);
      if (t) { if (shown === t && e.detail === 0) hide(); else show(t); return; }
      hide();
      var el = e.target.closest ? e.target.closest('[data-set-script], [data-toggle-theme]') : null;
      if (!el) return;
      if (el.hasAttribute('data-set-script')) {
        save('riyazi-script', applyScript(el.getAttribute('data-set-script')));
      } else {
        save('riyazi-theme', applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
      }
    });
  });

  // Printing from the browser: show the answers that are folded away on screen.
  window.addEventListener('beforeprint', function () {
    var d = document.querySelectorAll('details');
    for (var i = 0; i < d.length; i++) d[i].open = true;
  });
})();
