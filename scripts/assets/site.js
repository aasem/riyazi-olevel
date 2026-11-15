// Reader settings (script and theme), contents drawer, search, term tooltips, and print behaviour.
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
  function closest(e, sel) {
    return e.target && e.target.closest ? e.target.closest(sel) : null;
  }

  // ---- script: Nastaliq, Naskh or Amiri ----
  function applyScript(v) {
    if (v !== 'naskh' && v !== 'amiri') v = 'nastaliq';
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

  // ---- search: lesson titles and terms, in Urdu or English ----
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[ً-ٰٟـ]/g, '')   // Urdu vowel marks and tatweel
      .replace(/[يى]/g, 'ی')          // Arabic yeh -> Urdu yeh
      .replace(/ك/g, 'ک')                  // Arabic kaf -> Urdu kaf
      .replace(/[ةۀۂ]/g, 'ہ')    // heh variants -> Urdu heh
      .replace(/\s+/g, ' ').trim();
  }
  function find(query) {
    var q = norm(query);
    var index = window.RIYAZI_INDEX || [];
    if (!q) return [];
    var out = [];
    for (var i = 0; i < index.length; i++) {
      var l = index[i], score = 0, hit = null;
      if (norm(l.i) === q) score = 100;
      else if (norm(l.t).indexOf(q) >= 0) score = 60;
      else if (norm(l.e).indexOf(q) >= 0) score = 50;
      for (var j = 0; j < l.k.length; j++) {
        if (norm(l.k[j][0]).indexOf(q) >= 0 || norm(l.k[j][1]).indexOf(q) >= 0) {
          hit = l.k[j];
          score = Math.max(score, 40);
          break;
        }
      }
      if (!score && norm(l.c).indexOf(q) >= 0) score = 10;
      if (score) out.push({ l: l, score: score + (l.u ? 100 : 0), hit: hit });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 12);
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyScript(root.getAttribute('data-script'));
    var base = document.body.getAttribute('data-root') || '';

    // ---- contents drawer (phones and tablets) ----
    function setNav(open) { root.classList.toggle('nav-open', open); }
    var current = document.querySelector('.book-nav .current');
    if (current && current.scrollIntoView) current.scrollIntoView({ block: 'center' });

    // ---- search box ----
    var box = document.querySelector('.search');
    var input = box ? box.querySelector('input') : null;
    var results = box ? box.querySelector('.results') : null;
    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }
    function render() {
      var found = find(input.value);
      results.textContent = '';
      if (input.value.trim() && !found.length) {
        results.appendChild(el('li', 'none', 'کچھ نہیں ملا'));
        return;
      }
      for (var i = 0; i < found.length; i++) {
        var f = found[i], li = el('li');
        var row = f.l.u ? el('a') : el('span', 'off');
        if (f.l.u) row.setAttribute('href', base + f.l.u);
        row.appendChild(el('span', 'num', f.l.i));
        var body = el('span', 'r-body');
        body.appendChild(el('span', 'r-title', f.l.t));
        var sub = f.hit ? f.hit[0] + ' · ' + f.hit[1] : f.l.c;
        body.appendChild(el('span', 'r-sub', sub + (f.l.u ? '' : ' · ابھی دستیاب نہیں')));
        row.appendChild(body);
        li.appendChild(row);
        results.appendChild(li);
      }
    }
    function setSearch(open) {
      if (!box) return;
      box.hidden = !open;
      if (open) { setNav(false); input.value = ''; render(); input.focus(); }
    }
    if (input) input.addEventListener('input', render);

    // ---- term tooltips: English appears on hover, keyboard focus or tap ----
    var tip = document.querySelector('.tip');
    function hide() { if (tip) tip.hidden = true; }
    function show(t) {
      if (!tip) return;
      tip.textContent = t.getAttribute('data-en');
      tip.hidden = false;
      var r = t.getBoundingClientRect();
      var w = tip.offsetWidth, h = tip.offsetHeight;
      var left = Math.min(Math.max(r.left + r.width / 2 - w / 2, 8), window.innerWidth - w - 8);
      var top = r.top - h - 8;
      if (top < 56) top = r.bottom + 8;
      tip.style.left = left + window.scrollX + 'px';
      tip.style.top = top + window.scrollY + 'px';
    }
    document.addEventListener('mouseover', function (e) { var t = closest(e, '.term'); if (t) show(t); });
    document.addEventListener('mouseout', function (e) { if (closest(e, '.term')) hide(); });
    document.addEventListener('focusin', function (e) { var t = closest(e, '.term'); if (t) show(t); });
    document.addEventListener('focusout', function (e) { if (closest(e, '.term')) hide(); });
    window.addEventListener('scroll', hide, { passive: true });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { hide(); setNav(false); setSearch(false); }
      var typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName);
      if (e.key === '/' && !typing) { e.preventDefault(); setSearch(true); }
    });

    document.addEventListener('click', function (e) {
      var t = closest(e, '.term');
      if (t) { show(t); return; }
      hide();
      if (closest(e, '[data-toggle-nav]')) { setNav(!root.classList.contains('nav-open')); return; }
      if (closest(e, '[data-close-nav]') || closest(e, '.book-nav a')) { setNav(false); return; }
      if (closest(e, '[data-open-search]')) { setSearch(true); return; }
      if (closest(e, '[data-close-search]') || e.target === box) { setSearch(false); return; }
      var s = closest(e, '[data-set-script]');
      if (s) { save('riyazi-script', applyScript(s.getAttribute('data-set-script'))); return; }
      if (closest(e, '[data-toggle-theme]')) {
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
